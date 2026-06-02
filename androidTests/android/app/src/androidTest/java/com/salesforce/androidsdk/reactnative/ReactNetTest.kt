package com.salesforce.androidsdk.reactnative

import org.junit.Test

class ReactNetTest : BaseReactNativeTest() {
    @Test fun testGetApiVersion() = runTest("testGetApiVersion")
    @Test fun testVersions() = runTest("testVersions")
    @Test fun testResources() = runTest("testResources")
    @Test fun testDescribeGlobal() = runTest("testDescribeGlobal")
    @Test fun testMetaData() = runTest("testMetaData")
    @Test fun testDescribe() = runTest("testDescribe")
    @Test fun testDescribeLayout() = runTest("testDescribeLayout")
    @Test fun testCreateRetrieve() = runTest("testCreateRetrieve")
    @Test fun testUpsertUpdateRetrieve() = runTest("testUpsertUpdateRetrieve")
    @Test fun testCreateDelRetrieve() = runTest("testCreateDelRetrieve")
    @Test fun testQuery() = runTest("testQuery")
    @Test fun testSearch() = runTest("testSearch")
    @Test fun testPublicApiCall() = runTest("testPublicApiCall")
    @Test fun testCollectionCreateRetrieve() = runTest("testCollectionCreateRetrieve")
    @Test fun testCollectionUpsertUpdateRetrieve() = runTest("testCollectionUpsertUpdateRetrieve")
    @Test fun testCollectionCreateDeleteRetrieve() = runTest("testCollectionCreateDeleteRetrieve")
}
