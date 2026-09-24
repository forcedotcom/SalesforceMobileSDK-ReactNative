/*
 * Copyright (c) 2026-present, salesforce.com, inc.
 * All rights reserved.
 * Redistribution and use of this software in source and binary forms, with or
 * without modification, are permitted provided that the following conditions
 * are met:
 * - Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * - Neither the name of salesforce.com, inc. nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission of salesforce.com, inc.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
package com.salesforce.androidsdk.reactnative

import android.content.Intent
import android.os.SystemClock
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.UiDevice
import com.salesforce.androidsdk.util.test.TestAuthenticationActivity
import org.json.JSONObject
import org.junit.Assert.assertTrue
import java.util.concurrent.ConcurrentHashMap

data class TestResult(val success: Boolean, val message: String?)

/**
 * Base class for the React Native instrumented tests.
 *
 * The old harness rendered every test as a button in a React Native ScrollView and
 * drove it with UIAutomator swipe gestures. RN's ScrollView exposes no scroll
 * semantics to UIAutomator, so navigation was done with blind fixed-distance
 * swipes, which was non-deterministic on Firebase Test Lab's slow ARM emulators
 * (button-not-found / stale-click / false "did not complete in time").
 *
 * This version drives NO UI. It launches the app ONCE; the app mounts
 * HeadlessTestApp (see androidTests/index.js), which runs the whole shared suite
 * and emits one logcat line per result. [HeadlessResults] reads finite logcat
 * snapshots, parses those lines, and each @Test simply asserts on its parsed result.
 * Because the run happens once for the whole process, the ~70min (35 cold starts)
 * runtime collapses to a single launch while every @Test still reports independently
 * in the JUnit XML.
 */
abstract class BaseReactNativeTest {

    fun runTest(name: String) {
        val result = HeadlessResults.resultFor(name)
        assertTrue(result.message ?: "Test '$name' failed", result.success)
    }
}

/**
 * Process-static collector. The FIRST @Test (of any subclass) to call [resultFor]
 * triggers exactly one app launch + full-suite run; every other @Test reads the
 * cached result. Fail-closed: any test whose result line never arrives is reported
 * as a failure, so a crash/hang can never masquerade as a pass.
 */
object HeadlessResults {

    private const val RESULT_PREFIX = "SFTESTRESULT::"
    private const val DEFAULT_MAX_RUN_MS = 45L * 60 * 1000 // < Firebase --timeout 60m
    // App must launch and mount HeadlessTestApp (emit BEGIN) within this, else fail
    // fast with a real cause instead of blocking the whole run on a silent no-mount.
    private const val DEFAULT_BEGIN_TIMEOUT_MS = 3L * 60 * 1000
    // Match HeadlessTestApp's per-test cap, but enforce it outside the JS event
    // loop so a blocking native call cannot suppress the JavaScript timer.
    private const val DEFAULT_PROGRESS_TIMEOUT_MS = 30_000L
    private const val LOGCAT_POLL_INTERVAL_MS = 1_000L
    private const val LOGCAT_SNAPSHOT_COMMAND =
        "logcat -d -v raw -s ReactNativeJS:I AndroidRuntime:E"

    private val results = ConcurrentHashMap<String, TestResult>()
    private val lock = Object()

    @Volatile
    private var collected = false

    @Volatile
    private var runError: String? = null

    // Best-effort: a FATAL EXCEPTION for our process captured from logcat, folded
    // into the failure message so a crash reads as its real cause, not a timeout.
    @Volatile
    private var crashHint: String? = null

    fun resultFor(name: String): TestResult {
        ensureCollected()
        return results[name] ?: TestResult(false, runError ?: "No result reported for '$name'")
    }

    private fun ensureCollected() = synchronized(lock) {
        if (collected) return
        try {
            collectOnce()
        } catch (t: Throwable) {
            runError = "Headless collection failed: ${t.message}"
        } finally {
            collected = true
        }
    }

    private fun collectOnce() {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val context = instrumentation.targetContext
        val maxRunMs = InstrumentationRegistry.getArguments()
            .getString("maxRunMs")?.toLongOrNull() ?: DEFAULT_MAX_RUN_MS

        val device = UiDevice.getInstance(instrumentation)
        // Clear logcat so every finite snapshot only contains this run's output.
        device.executeShellCommand("logcat -c")

        val beginTimeoutMs = InstrumentationRegistry.getArguments()
            .getString("beginTimeoutMs")?.toLongOrNull() ?: DEFAULT_BEGIN_TIMEOUT_MS
        val progressTimeoutMs = InstrumentationRegistry.getArguments()
            .getString("progressTimeoutMs")?.toLongOrNull() ?: DEFAULT_PROGRESS_TIMEOUT_MS
        val targetPackage = context.packageName

        // Launch once: TestAuthenticationActivity authenticates from the creds asset,
        // then starts MainActivity, which mounts HeadlessTestApp and runs the suite.
        context.startActivity(
            Intent(context, TestAuthenticationActivity::class.java)
                .putExtra("creds", loadTestCredentials())
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        )

        // Fast-fail if the app never mounts HeadlessTestApp (no BEGIN): bad/missing
        // creds, a JS bundle load failure, or a release variant would otherwise block
        // the whole maxRunMs and then report a misleading "no DONE". (A crash that
        // kills the shared instrumentation process is already reported quickly by
        // `am instrument` as "Process crashed"; this covers the alive-but-silent case.)
        var events = awaitEvents(device, targetPackage, beginTimeoutMs) { it.began || it.done }
        if (!events.began) {
            runError = "Headless run did not emit BEGIN within ${beginTimeoutMs}ms — " +
                "app launched but HeadlessTestApp never mounted " +
                "(check test_credentials.json and the JS bundle)." +
                (crashHint?.let { "\nApp FATAL:\n$it" } ?: "")
            return
        }

        // Android 12L's long-running `logcat` pipe can retain the final buffered
        // lines indefinitely. Read finite `logcat -d` snapshots instead: the
        // command exits and flushes, so a tail-position DONE is observable.
        if (!events.done) {
            val completion = awaitCompletion(
                device,
                targetPackage,
                events,
                maxRunMs,
                progressTimeoutMs
            )
            events = completion.events
            if (!events.done) {
                runError = completion.timeoutMessage +
                    (crashHint?.let { " — app FATAL:\n$it" } ?: "")
            }
        }
    }

    private data class CompletionWait(
        val events: HeadlessLogcatEvents,
        val timeoutMessage: String
    )

    private fun awaitCompletion(
        device: UiDevice,
        targetPackage: String,
        initialEvents: HeadlessLogcatEvents,
        maxRunMs: Long,
        progressTimeoutMs: Long
    ): CompletionWait {
        val startedAt = SystemClock.elapsedRealtime()
        val overallDeadline = startedAt + maxRunMs
        var lastProgressAt = startedAt
        var lastResultCount = initialEvents.resultLines.size
        var events = initialEvents

        while (true) {
            if (events.done) return CompletionWait(events, "")

            val now = SystemClock.elapsedRealtime()
            if (events.resultLines.size > lastResultCount) {
                lastResultCount = events.resultLines.size
                lastProgressAt = now
            }

            val idleMs = now - lastProgressAt
            if (idleMs >= progressTimeoutMs) {
                return CompletionWait(
                    events,
                    "Headless run made no progress for ${progressTimeoutMs}ms " +
                        "after ${lastResultCount} result(s)"
                )
            }
            if (now >= overallDeadline) {
                return CompletionWait(
                    events,
                    "Headless run did not emit DONE within ${maxRunMs}ms"
                )
            }

            SystemClock.sleep(
                minOf(
                    LOGCAT_POLL_INTERVAL_MS,
                    overallDeadline - now,
                    progressTimeoutMs - idleMs
                )
            )
            events = readEvents(device, targetPackage)
        }
    }

    private fun awaitEvents(
        device: UiDevice,
        targetPackage: String,
        timeoutMs: Long,
        finished: (HeadlessLogcatEvents) -> Boolean
    ): HeadlessLogcatEvents {
        val deadline = SystemClock.elapsedRealtime() + timeoutMs
        var events: HeadlessLogcatEvents
        do {
            events = readEvents(device, targetPackage)
            if (finished(events)) return events

            val remainingMs = deadline - SystemClock.elapsedRealtime()
            if (remainingMs > 0) {
                SystemClock.sleep(minOf(LOGCAT_POLL_INTERVAL_MS, remainingMs))
            }
        } while (SystemClock.elapsedRealtime() < deadline)

        // One last finite dump closes the race where DONE arrives at the deadline.
        return readEvents(device, targetPackage)
    }

    private fun readEvents(
        device: UiDevice,
        targetPackage: String
    ): HeadlessLogcatEvents {
        val events = HeadlessLogcatParser.parse(
            device.executeShellCommand(LOGCAT_SNAPSHOT_COMMAND),
            targetPackage
        )
        events.resultLines.forEach { line -> runCatching { parseResult(line) } }
        events.crashHint?.let { crashHint = it }
        return events
    }

    private fun parseResult(line: String) {
        val json = line.substringAfter(RESULT_PREFIX).trim()
        val obj = JSONObject(json)
        val message = obj.optString("e", "")
        results[obj.getString("n")] = TestResult(obj.getBoolean("ok"), message.ifEmpty { null })
    }

    private fun loadTestCredentials(): String {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        return context.assets.open("test_credentials.json").bufferedReader().use { it.readText() }
    }
}
