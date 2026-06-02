package com.salesforce.androidsdk.reactnative

import org.junit.Test

class ReactSmartStoreTest : BaseReactNativeTest() {
    @Test fun testGetDatabaseSize() = runTest("testGetDatabaseSize")
    @Test fun testRegisterExistsRemoveExists() = runTest("testRegisterExistsRemoveExists")
    @Test fun testGetSoupIndexSpecs() = runTest("testGetSoupIndexSpecs")
    @Test fun testUpsertRetrieve() = runTest("testUpsertRetrieve")
    @Test fun testQuerySoup() = runTest("testQuerySoup")
    @Test fun testMoveCursor() = runTest("testMoveCursor")
    @Test fun testSmartQuerySoup() = runTest("testSmartQuerySoup")
    @Test fun testRemoveFromSoup() = runTest("testRemoveFromSoup")
    @Test fun testClearSoup() = runTest("testClearSoup")
    @Test fun testGetRemoveStores() = runTest("testGetRemoveStores")
    @Test fun testGetRemoveGlobalStores() = runTest("testGetRemoveGlobalStores")
}
