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

import android.os.Handler
import android.os.Looper
import androidx.test.platform.app.InstrumentationRegistry
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BridgeReactContext
import com.facebook.react.bridge.Callback
import com.salesforce.androidsdk.reactnative.bridge.SalesforceOauthReactBridge
import com.salesforce.androidsdk.reactnative.ui.SalesforceReactActivity
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger

/** The standalone context exercises dispatch without starting a JS runtime. */
@Suppress("DEPRECATION")
class ReactOAuthDispatchLifecycleTest {
    private val instrumentation = InstrumentationRegistry.getInstrumentation()
    private val mainHandler = Handler(Looper.getMainLooper())
    private lateinit var context: BridgeReactContext
    private lateinit var module: SalesforceOauthReactBridge

    @Before
    fun setUp() {
        instrumentation.runOnMainSync {
            context = BridgeReactContext(instrumentation.targetContext)
            module = SalesforceOauthReactBridge(context)
        }
    }

    @After
    fun tearDown() {
        instrumentation.runOnMainSync {
            mainHandler.removeCallbacksAndMessages(null)
            context.onHostDestroy()
            context.destroy()
        }
    }

    @Test
    fun authenticateDispatchesOnMainThread() {
        lateinit var activity: RecordingActivity
        instrumentation.runOnMainSync {
            activity = RecordingActivity()
            context.onHostResume(activity)
        }
        val done = CountDownLatch(1)

        module.authenticate(Arguments.createMap(), Callback { done.countDown() })

        assertTrue(done.await(5, TimeUnit.SECONDS))
        assertTrue("Activity authentication must run on the main thread", activity.onMain.get())
        assertEquals(1, activity.calls.get())
    }

    @Test
    fun finishingActivityIsSkippedForReplacement() = verifyReplacement(finishing = true)

    @Test
    fun destroyedActivityIsSkippedForReplacement() = verifyReplacement(destroyed = true)

    @Test
    fun absentActivityRetainsBoundedSingleErrorCallback() {
        val done = CountDownLatch(1)
        val calls = AtomicInteger()
        var error: Any? = null

        module.authenticate(Arguments.createMap(), Callback { args ->
            error = args.firstOrNull()
            calls.incrementAndGet()
            done.countDown()
        })

        assertTrue("Missing Activity must finish with an error", done.await(5, TimeUnit.SECONDS))
        assertEquals("SalesforceReactActivity not found", error)
        assertEquals(1, calls.get())
    }

    private fun verifyReplacement(finishing: Boolean = false, destroyed: Boolean = false) {
        lateinit var outgoing: RecordingActivity
        lateinit var replacement: RecordingActivity
        instrumentation.runOnMainSync {
            outgoing = RecordingActivity(finishing, destroyed)
            replacement = RecordingActivity()
            context.onHostResume(outgoing)
            mainHandler.postDelayed({ context.onHostResume(replacement) }, 100)
        }
        val done = CountDownLatch(1)

        module.authenticate(Arguments.createMap(), Callback { done.countDown() })

        assertTrue(done.await(5, TimeUnit.SECONDS))
        assertEquals("Never attach to the disposed Activity", 0, outgoing.calls.get())
        assertEquals(1, replacement.calls.get())
        assertTrue(replacement.onMain.get())
    }

    private class RecordingActivity(
        private val finishing: Boolean = false,
        private val destroyed: Boolean = false,
    ) : SalesforceReactActivity() {
        val calls = AtomicInteger()
        val onMain = AtomicBoolean()

        override fun isFinishing() = finishing
        override fun isDestroyed() = destroyed

        override fun authenticate(callback: Callback) {
            calls.incrementAndGet()
            onMain.set(Looper.myLooper() == Looper.getMainLooper())
            callback.invoke(null, "authenticated")
        }
    }
}
