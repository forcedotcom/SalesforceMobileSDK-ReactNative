class ReactSmartStoreTests: BaseReactNativeTest {
    func testGetDatabaseSize() { runTest("testGetDatabaseSize") }
    func testRegisterExistsRemoveExists() { runTest("testRegisterExistsRemoveExists") }
    func testGetSoupIndexSpecs() { runTest("testGetSoupIndexSpecs") }
    func testUpsertRetrieve() { runTest("testUpsertRetrieve") }
    func testQuerySoup() { runTest("testQuerySoup") }
    func testMoveCursor() { runTest("testMoveCursor") }
    func testSmartQuerySoup() { runTest("testSmartQuerySoup") }
    func testRemoveFromSoup() { runTest("testRemoveFromSoup") }
    func testClearSoup() { runTest("testClearSoup") }
    func testGetRemoveStores() { runTest("testGetRemoveStores") }
    func testGetRemoveGlobalStores() { runTest("testGetRemoveGlobalStores") }
}
