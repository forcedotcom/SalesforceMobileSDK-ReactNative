package com.salesforce.androidsdk.reactnative

import android.content.ComponentName
import android.content.Intent
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.By
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.UiSelector
import androidx.test.uiautomator.Until
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Rule
import androidx.test.rule.GrantPermissionRule
import android.os.Build
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
    fun launchWithInstantLogin() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val creds = loadTestCredentials()

        // Launch TestAuthenticationActivity with credentials
        val authIntent = Intent().apply {
            component = ComponentName(
                context.packageName,
                "com.salesforce.androidsdk.util.test.TestAuthenticationActivity"
            )
            putExtra("creds", creds)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(authIntent)

        // Wait for the test list to appear (TestAuthenticationActivity launches MainActivity)
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

    private fun loadTestCredentials(): String {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val inputStream = context.assets.open("test_credentials.json")
        val reader = BufferedReader(InputStreamReader(inputStream))
        return reader.readText().also { reader.close() }
    }
}
