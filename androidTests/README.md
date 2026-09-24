# Android Tests

Headless instrumentation tests for the React Native bridge.

## Test Credentials

Tests require Salesforce org credentials. Copy `shared/test/test_credentials.json.sample` to `shared/test/test_credentials.json` (at the repo root) and fill in your values. The `prepareandroid.js` script copies this file into the Android test app at build time.

## Running Tests

### From Android Studio
1. Set up the test app: `./prepareandroid.js`
2. Open the project in Android Studio: `androidTests/android/`
3. Right-click on a test class or method → Run

### From Command Line
```bash
cd androidTests/android
./gradlew connectedDebugAndroidTest
```

## Test Structure

Each test class extends `BaseReactNativeTest` and maps its JUnit methods to the
shared JavaScript test names.

Example:

```kotlin
class ReactNetTest : BaseReactNativeTest() {
    @Test fun testGetApiVersion() = runTest("testGetApiVersion")
    @Test fun testVersions() = runTest("testVersions")
    // ...
}
```

## Timeouts

Every headless test has a 30-second JavaScript timeout. The Android collector
independently fails after 30 seconds without a new result, even if a blocking
native call prevents the JavaScript timeout from running. Its 45-minute overall
ceiling remains as a final guard for a suite that continues to make progress.
The collector values can be overridden with the `progressTimeoutMs` and
`maxRunMs` instrumentation arguments.

## How It Works

1. The first JUnit test launches the app and authenticates from `test_credentials.json`.
2. `HeadlessTestApp` runs the shared JavaScript tests sequentially.
3. Each JavaScript result and the final summary are written to logcat sentinels.
4. The Android collector reads finite logcat snapshots and caches all results.
5. Each JUnit method asserts its corresponding cached result.

## Authentication

Tests use instant authentication via `TestAuthenticationActivity`:
- Credentials are loaded from `assets/test_credentials.json`
- The headless collector launches `TestAuthenticationActivity` with credentials as an intent extra
- Activity authenticates and launches the main React Native activity
- The JavaScript suite reports results through logcat; no UI interaction is required

## Result Protocol

The JavaScript test app emits `SFTESTBEGIN::`, one `SFTESTRESULT::` JSON line per
test, and `SFTESTDONE::` when the suite completes. The instrumentation collector
uses finite `logcat -d` snapshots so Android 12L cannot retain the final buffered
line in a long-lived logcat pipe.

See `docs/android-tests/README.md` for detailed documentation.
