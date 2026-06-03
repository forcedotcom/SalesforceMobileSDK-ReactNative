# SalesforceReactTests
Tests for Salesforce Mobile SDK React Native iOS modules.

## Test Credentials

Tests require Salesforce org credentials. Copy `shared/test/test_credentials.json.sample` to `shared/test/test_credentials.json` (at the repo root) and fill in your values. The `prepareios.js` script copies this file into the iOS test app at build time.

## Running Tests

1. Set up the test workspace: `./prepareios.js`
2. Start the Metro bundler: `npm start`
3. Open the workspace: `open ios/SalesforceReactTestApp.xcworkspace` and run the tests (Cmd+U)

See `docs/ios-tests/README.md` for detailed documentation.

See `docs/ios-tests/README.md` for detailed documentation.
