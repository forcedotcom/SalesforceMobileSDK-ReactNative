package com.salesforce.androidsdk.reactnative

import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.By
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.UiSelector
import androidx.test.uiautomator.Until
import com.salesforce.androidsdk.reactnative.util.MainActivity
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Rule

abstract class BaseReactNativeTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(MainActivity::class.java)

    private val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())

    @Before
    fun waitForTestList() {
        val found = device.wait(Until.hasObject(By.desc("testList")), 30_000)
        assertTrue("Test list did not appear", found != null && found)
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
}
