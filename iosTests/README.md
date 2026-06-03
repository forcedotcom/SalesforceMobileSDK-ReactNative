# SalesforceReactTests
Tests for Salesforce Mobile SDK React Native iOS modules.

## Test Credentials

Tests require Salesforce org credentials. Copy `shared/test/test_credentials.json.sample` to `shared/test/test_credentials.json` (at the repo root) and fill in your values. The `prepareios.js` script copies this file into the iOS test app at build time.

## Running Tests

1. Set up the test workspace: `./prepareios.js`
2. Start the Metro bundler: `npm start`
3. Open the workspace: `open ios/SalesforceReactTestApp.xcworkspace` and run the tests (Cmd+U)

See `docs/ios-tests/README.md` for detailed documentation.

## Test Execution Modes

The test framework supports two execution modes:

### Individual Test Execution (Default)
When running a single test from Xcode, only that specific test executes. This is ideal for local development and debugging.

**Usage**: Just run the test normally from Xcode.

### Batch Execution Mode (CI)
When running the full test suite (e.g., in CI), all tests in a suite run together via the "Run All" button for better performance.

**Usage**: Set environment variable `useBatchExecution=true`:
- **Xcode**: Edit Scheme → Test → Arguments → Environment Variables → Add `useBatchExecution` = `true`
- **Command line**: `xcodebuild test ... useBatchExecution=true`

For more details, see `docs/ios-tests/README.md`.
