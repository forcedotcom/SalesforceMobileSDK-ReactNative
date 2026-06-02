package com.salesforce.androidsdk.reactnative

import org.junit.Test

class ReactHarnessTest : BaseReactNativeTest() {
    @Test fun testPassing() = runTest("testPassing")
    @Test fun testAsyncPassing() = runTest("testAsyncPassing")
}
