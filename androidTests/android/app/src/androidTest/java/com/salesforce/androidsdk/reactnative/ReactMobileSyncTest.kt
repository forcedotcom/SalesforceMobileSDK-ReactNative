package com.salesforce.androidsdk.reactnative

import org.junit.Test

class ReactMobileSyncTest : BaseReactNativeTest() {
    @Test fun testSyncDown() = runTest("testSyncDown")
    @Test fun testSyncUp() = runTest("testSyncUp")
    @Test fun testReSync() = runTest("testReSync")
    @Test fun testCleanResyncGhosts() = runTest("testCleanResyncGhosts")
    @Test fun testGetSyncStatusDeleteSync() = runTest("testGetSyncStatusDeleteSync")
}
