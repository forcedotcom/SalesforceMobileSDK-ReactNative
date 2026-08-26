import { assert } from './assert';
import * as oauth from '../src/react.force.oauth';
import { registerSuite, registerTest, testDone } from './testRunner';

registerSuite('OAuth');

function testGetAuthCredentials() {
    oauth.getAuthCredentials(
        (creds) => {
            try {
                assert.containsAllKeys(creds, ["accessToken","instanceUrl","loginUrl","orgId","refreshToken","userAgent","userId"], 'Wrong keys in credentials');
                testDone();
            } catch (e) { testDone(e); }
        },
        (error) => { testDone(error); }
    );
}

registerTest(testGetAuthCredentials);
