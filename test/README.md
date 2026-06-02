# Tests for Salesforce Mobile SDK react native modules

## Test Credentials

Both iOS and Android tests require Salesforce org credentials. A single source file at `shared/test/test_credentials.json` (gitignored) is used by both platforms:

1. Copy `shared/test/test_credentials.json.sample` to `shared/test/test_credentials.json`
2. Fill in your Salesforce org credentials

The `prepareios.js` and `prepareandroid.js` scripts copy this file into the appropriate location for each platform at build time.

## Running the tests

To run the tests on iOS:
- From `iosTests/`, run `./prepareios.js`
- Start the Metro bundler with `npm start`
- Open `ios/SalesforceReactTestApp.xcworkspace` in Xcode and run the tests (Cmd+U)

To run the tests on Android:
- From `androidTests/`, run `./prepareandroid.js`
- Run `cd android && ./gradlew :app:connectedDebugAndroidTest` (requires a connected emulator or device)

See `iosTests/README.md` and `docs/android-tests/README.md` for detailed setup instructions.

## Writing new tests
On the JavaScript side:
- each test needs to be "registered": if you write a `testXYZ()`, make sure to call `registerTest(testXYZ);`.
- within the test, make sure to call `testDone()` when the test completes.
- if you write a new suite of tests, make sure to add it to `alltests.js`.

On the iOS side:
- if you added a `testXYZ()` to an existing JavaScript suite, add `RCT_TEST(XYZ)` to the corresponding Objective-C test file.
- if you write a new suite of tests, create a new subclass of `ReactTestCase` (see existing subclasses for examples).

On the Android side:
- if you added a `testXYZ()` to an existing JavaScript suite, add `testXYZ` to the list returned by `@Parameterized.Parameters(name = "{0}") public static List<String> data()` in the corresponding Kotlin test file.
- if you write a new suite of tests, create a new subclass of `ReactTestCase` (see existing subclasses for examples).
