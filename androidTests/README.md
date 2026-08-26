# Android Tests

UI-driven tests for the React Native bridge using UIAutomator.

## Test Credentials

Tests require Salesforce org credentials. Copy `shared/test/test_credentials.json.sample` to `shared/test/test_credentials.json` (at the repo root) and fill in your values. The `prepareandroid.js` script copies this file into the Android test app at build time.

## Running Tests

### From Android Studio
1. Set up the test app: `./prepareandroid.js`
2. Start the Metro bundler: `npm start`
3. Open the project in Android Studio: `androidTests/android/`
4. Right-click on a test class or method → Run

### From Command Line
```bash
cd androidTests
./gradlew connectedAndroidTest
```

## Test Structure

Each test class extends `BaseReactNativeTest` and provides:

- `testTimeoutMs`: Timeout for each test (optional, default: 15s)

Example:

```kotlin
class ReactNetTest : BaseReactNativeTest() {
    override val testTimeoutMs: Long = 30_000
    
    @Test fun testGetApiVersion() = runTest("testGetApiVersion")
    @Test fun testVersions() = runTest("testVersions")
    // ...
}
```

## Timeouts

Default timeouts:
- **OAuth, Harness, SmartStore**: 15 seconds (default)
- **Net**: 30 seconds  
- **MobileSync**: 60 seconds

Override `testTimeoutMs` to customize per test class.

## How It Works

1. Each test method triggers the activity to launch via `@Rule`
2. `runTest()` waits for the React Native app to load
3. Taps the individual test button in the UI (testID: `run_{testName}`)
4. Waits for the test result element to appear (testID: `result_{testName}_pass` or `result_{testName}_fail`)
5. Asserts the result

## Authentication

Tests use instant authentication via `TestAuthenticationActivity`:
- Credentials are loaded from `assets/test_credentials.json`
- `ActivityScenarioRule` launches `TestAuthenticationActivity` with credentials as an intent extra
- Activity authenticates and launches the main React Native activity
- Tests interact with the running React Native app via UIAutomator

## Test IDs

The JavaScript test app must expose these accessibility identifiers:
- `testList`: The ScrollView containing all test buttons
- `run_{testName}`: Button to run individual test
- `result_{testName}_pass`: Success indicator
- `result_{testName}_fail`: Failure indicator  
- `error_{testName}`: Error message text (if test fails)

See `docs/android-tests/README.md` for detailed documentation.
