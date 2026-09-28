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

class BaseReactNativeTest: XCTestCase {
    private enum ReactNativeTestOutcome {
        case passed
        case failed(String)
        case timedOut
    }

    static var app: XCUIApplication!

    // Subclasses can override to specify test timeout in seconds (default: 15s)
    var testTimeoutSeconds: Double {
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
        XCTAssertTrue(app.descendants(matching: .any).matching(identifier: "testList").firstMatch.waitForExistence(timeout: 60),
                      "Test list did not appear")
    }

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
    }

    var app: XCUIApplication {
        return BaseReactNativeTest.app
    }

    private func executeTest(_ name: String) -> ReactNativeTestOutcome {
        let runId = "run_\(name)"
        let element = app.descendants(matching: .any).matching(identifier: runId).firstMatch

        // Scroll to the button if it's not immediately visible
        if !element.exists {
            element.scrollToElement()
        }

        guard element.waitForExistence(timeout: 10) else {
            XCTFail("Button not found: \(runId)")
            return .timedOut
        }
        element.tap()

        let passId = "result_\(name)_pass"
        let failId = "result_\(name)_fail"
        let passElement = app.descendants(matching: .any).matching(identifier: passId).firstMatch
        let failElement = app.descendants(matching: .any).matching(identifier: failId).firstMatch

        let deadline = Date().addingTimeInterval(testTimeoutSeconds)
        while Date() < deadline && !passElement.exists && !failElement.exists {
            RunLoop.current.run(until: Date().addingTimeInterval(0.25))
        }

        if passElement.exists {
            return .passed
        }

        if failElement.exists {
            return .failed(failureMessage(for: name))
        }

        return .timedOut
    }

    private func failureMessage(for name: String) -> String {
        let messageId = "error_message_\(name)"
        let messageElement = app.descendants(matching: .any).matching(identifier: messageId).firstMatch
        guard messageElement.waitForExistence(timeout: 2) else { return "unknown error" }

        // React Native can expose testID on a container while placing the Text's
        // accessibility label on a descendant static-text node.
        let staticText = messageElement.descendants(matching: .staticText).firstMatch
        if staticText.exists && !staticText.label.isEmpty && staticText.label != messageId {
            return staticText.label
        }
        if !messageElement.label.isEmpty && messageElement.label != messageId {
            return messageElement.label
        }
        if let value = messageElement.value as? String, !value.isEmpty && value != messageId {
            return value
        }
        return "unknown error"
    }

    func runTest(_ name: String) {
        switch executeTest(name) {
        case .passed:
            print("[SalesforceReactTests] \(name) passed")
        case .failed(let message):
            print("[SalesforceReactTests] \(name) failed: \(message)")
            XCTFail("Test \(name) failed: \(message)")
        case .timedOut:
            print("[SalesforceReactTests] \(name) timed out after \(testTimeoutSeconds) seconds")
            XCTFail("Test \(name) did not complete in time")
        }
    }

    func runTestExpectingFailure(_ name: String, expectedMessage: String) {
        switch executeTest(name) {
        case .failed(let message):
            XCTAssertEqual(message, expectedMessage)
            print("[SalesforceReactTests] \(name) recovered expected failure: \(message)")
        case .passed:
            XCTFail("Test \(name) unexpectedly passed")
        case .timedOut:
            XCTFail("Test \(name) did not report its expected failure in time")
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
