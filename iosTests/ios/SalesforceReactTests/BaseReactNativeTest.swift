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
        let button = app.buttons["run_\(name)"]
        XCTAssertTrue(button.waitForExistence(timeout: 10), "Button not found: run_\(name)")
        button.tap()

        let pass = app.staticTexts["result_\(name)_pass"]
        let fail = app.staticTexts["result_\(name)_fail"]
        let passed = pass.waitForExistence(timeout: 120)

        if !passed {
            let failed = fail.waitForExistence(timeout: 5)
            if failed {
                let errorText = app.staticTexts["error_\(name)"]
                let message = errorText.exists ? errorText.label : "unknown error"
                XCTFail("Test \(name) failed: \(message)")
            } else {
                XCTFail("Test \(name) did not complete in time")
            }
        }
    }
}
