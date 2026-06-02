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

import android.content.ComponentName
import android.content.Intent
import android.os.Build
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.rule.GrantPermissionRule
import androidx.test.uiautomator.By
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.UiSelector
import androidx.test.uiautomator.Until
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Rule
import java.io.BufferedReader
import java.io.InputStreamReader

abstract class BaseReactNativeTest {

    @get:Rule
    val permissionRule: GrantPermissionRule = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        GrantPermissionRule.grant(android.Manifest.permission.POST_NOTIFICATIONS)
    } else {
        GrantPermissionRule.grant()
    }

    private val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())

    @Before
    fun ensureTestListVisible() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext

        // Check if test list is already visible (app already running and authenticated)
        val alreadyVisible = device.findObject(UiSelector().descriptionContains("run_test")).waitForExists(3_000)
        if (alreadyVisible) return

        // Not visible — need to authenticate and launch
        val creds = loadTestCredentials()
        val authIntent = Intent().apply {
            component = ComponentName(
                context.packageName,
                "com.salesforce.androidsdk.util.test.TestAuthenticationActivity"
            )
            putExtra("creds", creds)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(authIntent)

        // Wait for the test list to appear
        val found = device.findObject(UiSelector().descriptionContains("run_test")).waitForExists(30_000)
        assertTrue("Test list did not appear", found)
    }

    fun runTest(name: String) {
        val button = device.findObject(UiSelector().description("run_$name"))
        assertTrue("Button not found: run_$name", button.waitForExists(10_000))
        button.click()

        val passSelector = UiSelector().description("result_${name}_pass")
        val passed = device.findObject(passSelector).waitForExists(120_000)

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

    private fun loadTestCredentials(): String {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val inputStream = context.assets.open("test_credentials.json")
        val reader = BufferedReader(InputStreamReader(inputStream))
        return reader.readText().also { reader.close() }
    }
}
