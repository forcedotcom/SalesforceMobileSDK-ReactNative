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

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.ParcelFileDescriptor
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.rule.GrantPermissionRule
import androidx.test.uiautomator.UiDevice
import com.salesforce.androidsdk.util.test.TestAuthenticationActivity
import org.json.JSONObject
import org.junit.Assert.assertTrue
import org.junit.Rule
import java.io.BufferedReader
import java.io.InputStreamReader
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

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
 * and emits one logcat line per result. [HeadlessResults] streams logcat, parses
 * those lines, and each @Test simply asserts on its parsed result. Because the run
 * happens once for the whole process, the ~70min (35 cold starts) runtime collapses
 * to a single launch while every @Test still reports independently in the JUnit XML.
 */
abstract class BaseReactNativeTest {

    // Pre-grant POST_NOTIFICATIONS so no permission dialog can interrupt the run on
    // API 33+. (The app manifest removes the permission; granting is a no-op if absent.)
    @get:Rule
    val permissionRule: GrantPermissionRule = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        GrantPermissionRule.grant(Manifest.permission.POST_NOTIFICATIONS)
    } else {
        GrantPermissionRule.grant()
    }

    // Vestigial: kept only so the two subclass overrides (ReactNetTest, ReactMobileSyncTest)
    // still compile. Real per-test timeouts now live in HeadlessTestApp.js (SUITE_TIMEOUTS).
    open val testTimeoutMs: Long
        get() = 60_000

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
    private const val DONE_PREFIX = "SFTESTDONE::"
    private const val DEFAULT_MAX_RUN_MS = 45L * 60 * 1000 // < Firebase --timeout 60m

    private val results = ConcurrentHashMap<String, TestResult>()
    private val lock = Object()

    @Volatile
    private var collected = false

    @Volatile
    private var runError: String? = null

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

        // Clear logcat so we only read this run's output.
        UiDevice.getInstance(instrumentation).executeShellCommand("logcat -c")

        val done = CountDownLatch(1)
        // Stream logcat from the shell uid (which holds READ_LOGS). Start reading
        // BEFORE launching so no early sentinel is missed.
        val pfd = instrumentation.uiAutomation.executeShellCommand("logcat -v raw -s ReactNativeJS:I")
        val reader = BufferedReader(InputStreamReader(ParcelFileDescriptor.AutoCloseInputStream(pfd)))
        val readerThread = Thread {
            try {
                reader.forEachLine { line ->
                    when {
                        line.contains(RESULT_PREFIX) -> parseResult(line)
                        line.contains(DONE_PREFIX) -> done.countDown()
                    }
                }
            } catch (_: Throwable) {
                // Stream closed after the run finished — expected.
            }
        }
        readerThread.isDaemon = true
        readerThread.start()

        // Launch once: TestAuthenticationActivity authenticates from the creds asset,
        // then starts MainActivity, which mounts HeadlessTestApp and runs the suite.
        context.startActivity(
            Intent(context, TestAuthenticationActivity::class.java)
                .putExtra("creds", loadTestCredentials())
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        )

        // Condition-wait on the DONE sentinel — no Thread.sleep / polling.
        val finished = done.await(maxRunMs, TimeUnit.MILLISECONDS)
        if (!finished) {
            runError = "Headless run did not emit DONE within ${maxRunMs}ms"
        }
        runCatching { pfd.close() }
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
