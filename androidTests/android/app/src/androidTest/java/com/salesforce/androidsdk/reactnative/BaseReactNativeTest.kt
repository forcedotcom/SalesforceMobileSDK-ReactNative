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
import android.util.Log
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.rule.GrantPermissionRule
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.UiSelector
import com.salesforce.androidsdk.reactnative.util.MainActivity
import com.salesforce.androidsdk.util.test.TestAuthenticationActivity
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Rule
import java.io.BufferedReader
import java.io.InputStreamReader

data class TestResult(val success: Boolean, val message: String?)

abstract class BaseReactNativeTest {

    companion object {
        private const val TAG = "BaseReactNativeTest"

        private fun loadTestCredentials(): String {
            val context = InstrumentationRegistry.getInstrumentation().targetContext
            val inputStream = context.assets.open("test_credentials.json")
            val reader = BufferedReader(InputStreamReader(inputStream))
            return reader.readText().also { reader.close() }
        }
    }

    @get:Rule(order = 0)
    val permissionRule: GrantPermissionRule = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        GrantPermissionRule.grant(Manifest.permission.POST_NOTIFICATIONS)
    } else {
        GrantPermissionRule.grant()
    }

    @get:Rule(order = 1)
    val activityRule = ActivityScenarioRule<MainActivity>(
        Intent(
            InstrumentationRegistry.getInstrumentation().targetContext,
            TestAuthenticationActivity::class.java
        ).putExtra("creds", loadTestCredentials())
    )

    protected val device: UiDevice by lazy {
        UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
    }

    // Subclasses can override to specify test timeout in milliseconds (default: 15s)
    open val testTimeoutMs: Long
        get() = 15_000

    fun runTest(name: String) {
        // Wait for test list to appear
        val found = device.findObject(UiSelector().description("testList")).waitForExists(30_000)
        assertTrue("Test list did not appear", found)

        // Scroll to the test button if needed
        val button = device.findObject(UiSelector().description("run_$name"))

        if (!button.exists()) {
            // Button not immediately visible, try scrolling
            try {
                val scrollable = androidx.test.uiautomator.UiScrollable(
                    UiSelector().description("testList").scrollable(true)
                )
                scrollable.setAsVerticalList()
                scrollable.setMaxSearchSwipes(20) // Allow more swipes to reach bottom
                val scrolled = scrollable.scrollIntoView(UiSelector().description("run_$name"))
                if (!scrolled) {
                    Log.w(TAG, "scrollIntoView returned false for run_$name")
                }
            } catch (e: Exception) {
                Log.w(TAG, "Scroll failed for run_$name: ${e.message}")
            }
        }

        assertTrue("Button not found: run_$name - may need to scroll further", button.waitForExists(10_000))
        button.click()

        val passSelector = UiSelector().description("result_${name}_pass")
        val passed = device.findObject(passSelector).waitForExists(testTimeoutMs)

        if (!passed) {
            val failSelector = UiSelector().description("result_${name}_fail")
            val failed = device.findObject(failSelector).waitForExists(5_000)
            if (failed) {
                val errorObj = device.findObject(UiSelector().description("error_$name"))
                val message = if (errorObj.exists()) errorObj.text else "unknown error"
                fail("Test $name failed: $message")
            } else {
                fail("Test $name did not complete in time")
            }
        }
    }
}
