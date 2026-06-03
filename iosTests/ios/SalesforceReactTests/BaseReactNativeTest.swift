/*
 * Copyright (c) 2026-present, salesforce.com, inc.
 * All rights reserved.
 * Redistribution and use of this software in source and binary forms, with or
 * without modification, are permitted provided that the following conditions
 * are met:
 * - Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * - Neither the name of salesforce.com, inc. nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission of salesforce.com, inc.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import XCTest

struct TestResult {
    let success: Bool
    let message: String?
}

class BaseReactNativeTest: XCTestCase {
    static var app: XCUIApplication!
    // Cache test results per suite: { suiteName: { testName: result } }
    static var testResults: [String: [String: TestResult]] = [:]

    // Subclasses must override to specify their suite name
    var suiteName: String {
        fatalError("Subclass must override suiteName property")
    }

    // Subclasses must override to provide list of test names in execution order
    var testNames: [String] {
        fatalError("Subclass must override testNames property")
    }

    // Subclasses can override to specify suite timeout in seconds (default: 15s)
    var suiteTimeoutSeconds: Double {
        return 15
    }

    // Subclasses can override to specify individual test timeout in seconds (default: 15s)
    var individualTestTimeoutSeconds: Double {
        return 15
    }

    override class func setUp() {
        super.setUp()

        app = XCUIApplication()

        // Instant login: pass credentials from shared/test/test_credentials.json
        let testBundle = Bundle(for: self)
        if let credsURL = testBundle.url(forResource: "test_credentials", withExtension: "json"),
           let credsData = try? Data(contentsOf: credsURL),
           let credsString = String(data: credsData, encoding: .utf8)?
            .replacingOccurrences(of: "\n", with: "")
            .replacingOccurrences(of: "\r", with: "") {
            app.launchArguments = ["-creds", credsString]
        }
        app.launch()
        XCTAssertTrue(app.descendants(matching: .any).matching(identifier: "testList").firstMatch.waitForExistence(timeout: 30),
                      "Test list did not appear")
    }

    override func setUp() {
        super.setUp()
        continueAfterFailure = false

        // Check if we should use batch execution (default: false, individual execution)
        // Set -DuseBatchExecution=true in CI or when running full suite
        let useBatchExecution = ProcessInfo.processInfo.environment["useBatchExecution"] == "true"

        if useBatchExecution {
            // Batch mode: Run suite if not already run
            if Self.testResults[suiteName] == nil {
                runSuiteAndCollectResults()
            }
        }
        // Otherwise, individual tests will run via fallback in runTest()
    }

    var app: XCUIApplication {
        return BaseReactNativeTest.app
    }

    /// Run all tests in the suite at once and collect results
    private func runSuiteAndCollectResults() {
        let runSuiteId = "runSuite_\(suiteName)"
        let runButton = app.descendants(matching: .any).matching(identifier: runSuiteId).firstMatch

        // Scroll to button if needed
        if !runButton.exists {
            runButton.scrollToElement()
        }

        XCTAssertTrue(runButton.waitForExistence(timeout: 10),
                      "Run All button not found: \(runSuiteId) - bundle may be stale or suite not registered")

        runButton.tap()

        // Wait for suite completion by checking for last test result
        if let lastTestName = testNames.last {
            let lastPassId = "result_\(lastTestName)_pass"
            let lastFailId = "result_\(lastTestName)_fail"
            let lastPassElement = app.descendants(matching: .any).matching(identifier: lastPassId).firstMatch
            let lastFailElement = app.descendants(matching: .any).matching(identifier: lastFailId).firstMatch

            let completed = lastPassElement.waitForExistence(timeout: suiteTimeoutSeconds) || lastFailElement.waitForExistence(timeout: 5)
            XCTAssertTrue(completed, "Suite \(suiteName) did not complete within \(Int(suiteTimeoutSeconds)) seconds")
        }

        // Collect all test results from UI
        var results: [String: TestResult] = [:]
        for testName in testNames {
            let passId = "result_\(testName)_pass"
            let failId = "result_\(testName)_fail"
            let passElement = app.descendants(matching: .any).matching(identifier: passId).firstMatch
            let failElement = app.descendants(matching: .any).matching(identifier: failId).firstMatch

            if passElement.exists {
                results[testName] = TestResult(success: true, message: nil)
            } else if failElement.exists {
                let errorId = "error_\(testName)"
                let errorElement = app.descendants(matching: .any).matching(identifier: errorId).firstMatch
                let message = errorElement.exists ? errorElement.label : "unknown error"
                results[testName] = TestResult(success: false, message: message)
            } else {
                // Test did not run or result not visible
                results[testName] = TestResult(success: false, message: "No result found for test")
            }
        }

        Self.testResults[suiteName] = results
    }

    func runTest(_ name: String) {
        // Check if we have a cached result from batch execution
        if let result = Self.testResults[suiteName]?[name] {
            // Use cached result from batch execution
            XCTAssertTrue(result.success, "\(name) failed: \(result.message ?? "unknown error")")
        } else {
            // No cached result - run individual test
            runTestIndividually(name)
        }
    }

    /// Fallback method to run a single test individually (old approach)
    private func runTestIndividually(_ name: String) {
        let runId = "run_\(name)"
        let element = app.descendants(matching: .any).matching(identifier: runId).firstMatch

        // Scroll to the button if it's not immediately visible
        if !element.exists {
            element.scrollToElement()
        }

        XCTAssertTrue(element.waitForExistence(timeout: 10), "Button not found: \(runId)")
        element.tap()

        let passId = "result_\(name)_pass"
        let failId = "result_\(name)_fail"
        let passElement = app.descendants(matching: .any).matching(identifier: passId).firstMatch
        let failElement = app.descendants(matching: .any).matching(identifier: failId).firstMatch

        let passed = passElement.waitForExistence(timeout: individualTestTimeoutSeconds)

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

extension XCUIElement {
    func scrollToElement() {
        while !self.isHittable {
            let startCoord = self.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5))
            startCoord.press(forDuration: 0.01, thenDragTo: startCoord.withOffset(CGVector(dx: 0, dy: -50)))
        }
    }
}
