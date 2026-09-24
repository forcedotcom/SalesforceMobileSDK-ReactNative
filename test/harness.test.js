import { assert } from './assert';
import { oauth } from 'react-native-force';
import { registerSuite, registerTest, testDone } from './testRunner';

registerSuite('Harness');

function testPassing() {
    assert(true, "testPassing should have succeeded");
    testDone();
}

function testAsyncPassing() {
    oauth.getAuthCredentials(
        (creds) => { testDone(); },
        (error) => { testDone(error); }
    );
}

function testExpectedFailureDiagnostic() {
    testDone(new Error('Expected harness JS failure diagnostic'));
}

registerTest(testPassing);
registerTest(testAsyncPassing);
// This test is invoked only by the iOS XCTest regression that expects failure.
// Excluding it keeps interactive Run All and Android's headless suite green.
registerTest(testExpectedFailureDiagnostic, { excludeFromRunAll: true });
