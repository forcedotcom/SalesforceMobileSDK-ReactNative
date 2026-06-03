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
import android.util.Log
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.UiSelector
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.BeforeClass
import java.io.BufferedReader
import java.io.InputStreamReader

data class TestResult(val success: Boolean, val message: String?)

abstract class BaseReactNativeTest {

    companion object {
        private const val TAG = "BaseReactNativeTest"
        private lateinit var device: UiDevice
        private var credentials: String? = null
        // Cache test results per suite: { suiteName: { testName: result } }
        val testResults = mutableMapOf<String, Map<String, TestResult>>()

        @JvmStatic
        @BeforeClass
        fun setupOnce() {
            device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
            credentials = loadTestCredentials()

            // Authenticate and launch app once for all tests
            val context = InstrumentationRegistry.getInstrumentation().targetContext
            val authIntent = Intent().apply {
                component = ComponentName(
                    context.packageName,
                    "com.salesforce.androidsdk.util.test.TestAuthenticationActivity"
                )
                putExtra("creds", credentials)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(authIntent)

            // Wait for the test list ScrollView to appear (testID="testList")
            val found = device.findObject(UiSelector().description("testList")).waitForExists(30_000)
            assertTrue("Test list did not appear", found)
        }

        private fun loadTestCredentials(): String {
            val context = InstrumentationRegistry.getInstrumentation().targetContext
            val inputStream = context.assets.open("test_credentials.json")
            val reader = BufferedReader(InputStreamReader(inputStream))
            return reader.readText().also { reader.close() }
        }
    }

    // Subclasses must override to specify their suite name
    abstract val suiteName: String

    // Subclasses must override to provide list of test names in execution order
    abstract val testNames: List<String>

    protected val device: UiDevice
        get() = Companion.device

    @Before
    fun setUp() {
        // Run suite if not already run (batch execution)
        if (!testResults.containsKey(suiteName)) {
            runSuiteAndCollectResults()
        }
    }

    /**
     * Run all tests in the suite at once and collect results
     */
    private fun runSuiteAndCollectResults() {
        val runSuiteId = "runSuite_$suiteName"

        // Scroll to Run All button
        val scrollable = androidx.test.uiautomator.UiScrollable(
            UiSelector().description("testList").scrollable(true)
        )
        scrollable.setAsVerticalList()
        scrollable.scrollIntoView(UiSelector().description(runSuiteId))

        val runButton = device.findObject(UiSelector().description(runSuiteId))
        assertTrue(
            "Run All button not found: $runSuiteId - bundle may be stale or suite not registered",
            runButton.waitForExists(10_000)
        )

        runButton.click()

        // Wait for suite completion by checking for last test result
        val lastTestName = testNames.lastOrNull()
        if (lastTestName != null) {
            val lastPassSelector = UiSelector().description("result_${lastTestName}_pass")
            val lastFailSelector = UiSelector().description("result_${lastTestName}_fail")
            val passFound = device.findObject(lastPassSelector).waitForExists(300_000)
            val failFound = device.findObject(lastFailSelector).waitForExists(5_000)
            assertTrue("Suite $suiteName did not complete within 5 minutes", passFound || failFound)
        }

        // Collect all test results from UI
        val results = mutableMapOf<String, TestResult>()
        for (testName in testNames) {
            val passSelector = UiSelector().description("result_${testName}_pass")
            val failSelector = UiSelector().description("result_${testName}_fail")
            val passElement = device.findObject(passSelector)
            val failElement = device.findObject(failSelector)

            if (passElement.exists()) {
                results[testName] = TestResult(true, null)
            } else if (failElement.exists()) {
                val errorSelector = UiSelector().description("error_$testName")
                val errorElement = device.findObject(errorSelector)
                val message = if (errorElement.exists()) errorElement.text else "unknown error"
                results[testName] = TestResult(false, message)
            } else {
                // Test did not run or result not visible
                results[testName] = TestResult(false, "No result found for test")
            }
        }

        testResults[suiteName] = results
    }

    fun runTest(name: String) {
        // Check if we have a cached result from batch execution
        val result = testResults[suiteName]?.get(name)

        if (result != null) {
            // Use cached result
            assertTrue("$name failed: ${result.message ?: "unknown error"}", result.success)
        } else {
            // Fallback: run individual test (should rarely happen)
            Log.w(TAG, "⚠️ No cached result for $name, running individually")
            runTestIndividually(name)
        }
    }

    /**
     * Fallback method to run a single test individually (old approach)
     */
    private fun runTestIndividually(name: String) {
        // Scroll to the button if it's not visible
        val scrollable = androidx.test.uiautomator.UiScrollable(
            UiSelector().description("testList").scrollable(true)
        )
        scrollable.setAsVerticalList()
        scrollable.scrollIntoView(UiSelector().description("run_$name"))

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
}
