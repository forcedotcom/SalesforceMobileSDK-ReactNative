# Tests for Salesforce Mobile SDK react native modules

## Running the tests
To run the tests on iOS:
- clone the https://github.com/forcedotcom/SalesforceMobileSDK-iOS repo
- run `./install.sh`
- in `XCode` run the tests under `SalesforceReactTests`

To run the tests on Android:
- clone the https://github.com/forcedotcom/SalesforceMobileSDK-Android repo
- run `./install.sh`
- in `Android Studio` run the tests of `SalesforceReactTest`

## Writing new tests
On the JavaScript side:
- each test needs to be "registered": if you write a `testXYZ()`, make sure to call `registerTest(testXYZ);`.
- within the test, make sure to call `testDone()` when the test completes.
- if you write a new suite of tests, make sure to add it to `alltest.js`.

On the iOS side:
- if you added a `testXYZ()` to an existing JavaScript suite, add `RCT_TEST(XYZ)` the corresponding Objective-C test file.
- if you write a new suite of tests, create a new subclass of `ReactTestCase` (see existing subclasses for examples).

On the Android side:
- if you added a `testXYZ()` to an existing JavaScript suite, add `testXYZ` to the list returned by `@Parameterized.Parameters(name = "{0}") public static List<String> data()` in the corresponding Java test file.
- if you write a new suite of tests, create a new subclass of `ReactTestCase` (see existing subclasses for examples).
