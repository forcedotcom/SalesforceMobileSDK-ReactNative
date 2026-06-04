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

registerTest(testPassing);
registerTest(testAsyncPassing);
