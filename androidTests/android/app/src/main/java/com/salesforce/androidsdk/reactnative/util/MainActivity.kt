package com.salesforce.androidsdk.reactnative.util

import android.os.Bundle
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.salesforce.androidsdk.reactnative.ui.SalesforceReactActivity

class MainActivity : SalesforceReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
    }

    override fun getMainComponentName() = "SalesforceReactTestApp"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun shouldAuthenticate() = true
}
