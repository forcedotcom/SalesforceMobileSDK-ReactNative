# Android Tests

UI-driven tests for the React Native bridge using UIAutomator.

## Test Execution Modes

The test framework supports two execution modes:

### Individual Test Execution (Default)

When running a single test from Android Studio (e.g., right-click → Run), only that specific test executes. This is the default behavior and is ideal for:
- Local development
- Debugging specific test failures
- Quick iteration on a single test

**Usage**: Just run the test normally from Android Studio. No configuration needed.

### Batch Execution Mode

When running the full test suite (e.g., in CI), all tests in a suite run together via the "Run All" button, and results are cached. This is much faster for running the entire suite.

**Usage**: Set the system property `useBatchExecution=true`:

```bash
# Command line
./gradlew connectedAndroidTest -DuseBatchExecution=true

# Or in build.gradle.kts testInstrumentationRunnerArguments
android {
    defaultConfig {
        testInstrumentationRunnerArguments["useBatchExecution"] = "true"
    }
}
```

## Test Structure

Each test suite extends `BaseReactNativeTest` and provides:

- `suiteName`: Must match the JavaScript suite name (e.g., "Net", "OAuth", "MobileSync")
- `testNames`: List of test names in execution order
- `suiteTimeoutMs`: Timeout for running the entire suite (batch mode)
- `individualTestTimeoutMs`: Timeout for running a single test (individual mode)

Example:

```kotlin
class ReactNetTest : BaseReactNativeTest() {
    override val suiteName = "Net"
    override val suiteTimeoutMs: Long = 30_000
    override val individualTestTimeoutMs: Long = 30_000
    
    override val testNames = listOf(
        "testGetApiVersion",
        "testVersions",
        // ...
    )
    
    @Test fun testGetApiVersion() = runTest("testGetApiVersion")
    @Test fun testVersions() = runTest("testVersions")
    // ...
}
```

## Timeouts

Default timeouts:
- **OAuth, Harness, SmartStore**: 15 seconds
- **Net**: 30 seconds  
- **MobileSync**: 60 seconds

These can be customized per suite by overriding `suiteTimeoutMs` and `individualTestTimeoutMs`.

## How It Works

### Batch Execution Mode (`useBatchExecution=true`)
1. Activity launches once per test class (`@ClassRule`)
2. First test's `setUp()` taps "Run All" button for the suite
3. Framework waits for all tests to complete
4. Results are scraped from UI and cached
5. Each individual test method checks its cached result

### Individual Execution Mode (default)
1. Activity launches once per test class (`@ClassRule`)
2. Test's `setUp()` does nothing (no batch execution)
3. Test method runs and calls `runTest()`
4. Since no cached result exists, `runTestIndividually()` executes
5. Framework taps the individual test button and waits for result

## Authentication

Tests use instant authentication via `TestAuthenticationActivity`:
- Credentials are loaded from `assets/test_credentials.json`
- `ActivityScenarioRule` launches `TestAuthenticationActivity` with credentials
- Activity authenticates and launches the main React Native activity
- Tests interact with the running React Native app via UIAutomator

## Running Tests

### From Android Studio
- Right-click on a test class or method → Run
- Uses individual execution mode by default

### From Command Line (Batch Mode)
```bash
cd androidTests
./gradlew connectedAndroidTest -DuseBatchExecution=true
```

### CI Configuration
Set the system property in your CI script:
```bash
./gradlew connectedAndroidTest -DuseBatchExecution=true
```
