import XCTest

class BaseReactNativeTest: XCTestCase {
    let app = XCUIApplication()

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app.launch()
        XCTAssertTrue(app.otherElements["testList"].waitForExistence(timeout: 30),
                      "Test list did not appear")
    }

    func runTest(_ name: String) {
        let runId = "run_\(name)"
        let element = app.descendants(matching: .any).matching(identifier: runId).firstMatch
        XCTAssertTrue(element.waitForExistence(timeout: 10), "Button not found: \(runId)")
        element.tap()

        let passId = "result_\(name)_pass"
        let failId = "result_\(name)_fail"
        let passElement = app.descendants(matching: .any).matching(identifier: passId).firstMatch
        let failElement = app.descendants(matching: .any).matching(identifier: failId).firstMatch

        let passed = passElement.waitForExistence(timeout: 120)

        if !passed {
            let failed = failElement.waitForExistence(timeout: 5)
            if failed {
                let errorId = "error_\(name)"
                let errorElement = app.descendants(matching: .any).matching(identifier: errorId).firstMatch
                let message = errorElement.exists ? errorElement.label : "unknown error"
                XCTFail("Test \(name) failed: \(message)")
            } else {
                XCTFail("Test \(name) did not complete in time")
            }
        }
    }
}
