# CLAUDE.md — Salesforce Mobile SDK for React Native

---

## About This Project

The Salesforce Mobile SDK for React Native provides JavaScript/TypeScript bindings and native bridge modules that enable React Native applications to integrate with the Salesforce platform. This repo contains:

- **JavaScript/TypeScript libraries** (`src/`) - The public API exposed to React Native apps
- **iOS bridge code** (`ios/SalesforceReact/`) - Objective-C modules that bridge to iOS SDK
- **iOS tests** (`iosTests/`) - XCTest suite for iOS bridge functionality
- **JavaScript tests** (`test/`) - Test suite for JavaScript API

**Key constraint**: This is a **public SDK**. Every change is visible to external developers. Backward compatibility, deprecation cycles, and semver discipline are non-negotiable.

## Architecture

This repository is part of a cross-platform architecture:

```
React Native App
  └── react-native-force (this repo)
       ├── JavaScript/TypeScript API (src/)
       ├── iOS Bridge (ios/SalesforceReact/)
       │    └── depends on → SalesforceMobileSDK-iOS libraries
       └── Android Bridge → SalesforceMobileSDK-Android/libs/SalesforceReact
            └── depends on → SalesforceMobileSDK-Android libraries
```

**Important**: The Android bridge code lives in `SalesforceMobileSDK-Android/libs/SalesforceReact`, NOT in this repo. This repo only contains iOS bridge code and shared JavaScript/TypeScript.

## Repository Structure

```
SalesforceMobileSDK-ReactNative/
├── src/                          # TypeScript source - public API
│   ├── index.ts                  # Main export
│   ├── react.force.oauth.ts      # OAuth/Authentication
│   ├── react.force.net.ts        # REST API client
│   ├── react.force.smartstore.ts # SmartStore (encrypted storage)
│   ├── react.force.mobilesync.ts # MobileSync (sync framework)
│   ├── react.force.util.ts       # Utilities
│   ├── react.force.log.ts        # Logging
│   ├── react.force.test.ts       # Test harness utilities
│   └── typings/                  # TypeScript type definitions
├── ios/SalesforceReact/          # iOS bridge modules (Objective-C)
│   ├── SFOauthReactBridge.m      # OAuth bridge
│   ├── SFNetReactBridge.m        # REST client bridge
│   ├── SFSmartStoreReactBridge.m # SmartStore bridge
│   ├── SFMobileSyncReactBridge.m # MobileSync bridge
│   ├── SFSDKReactLogger.m        # Logging bridge
│   └── SalesforceReactSDKManager.m # SDK manager
├── iosTests/                     # iOS test application
│   ├── ios/                      # Xcode project with XCTest tests
│   └── prepareios.js             # Test setup script
├── test/                         # JavaScript test suite
│   ├── alltests.js               # Test entry point
│   ├── oauth.test.js             # OAuth tests
│   ├── net.test.js               # REST API tests
│   ├── smartstore.test.js        # SmartStore tests
│   ├── mobilesync.test.js        # MobileSync tests
│   └── harness.test.js           # Test infrastructure
├── dist/                         # Compiled TypeScript output
├── package.json                  # npm package definition
├── SalesforceReact.podspec       # CocoaPods spec for iOS
└── tsconfig.json                 # TypeScript configuration
```

## Dependency Relationships

### iOS Dependencies (via CocoaPods)
The `SalesforceReact.podspec` declares dependencies on iOS SDK libraries:
- `SalesforceSDKCommon`
- `SalesforceAnalytics`
- `SalesforceSDKCore`
- `SmartStore`
- `MobileSync`

These are pulled from the `SalesforceMobileSDK-iOS` repository via CocoaPods (published to `SalesforceMobileSDK-iOS-Specs`).

### Android Dependencies (via Gradle)
The Android bridge in `SalesforceMobileSDK-Android/libs/SalesforceReact` depends on:
- `MobileSync` library (which transitively includes SmartStore and SalesforceSDK)
- `react-android` from Facebook

### JavaScript Dependencies
React Native templates depend on this package via npm:
```json
"dependencies": {
  "react-native-force": "git+https://github.com/forcedotcom/SalesforceMobileSDK-ReactNative.git#dev"
}
```

## Module Architecture

Each JavaScript module follows this pattern:

1. **JavaScript API** (`src/react.force.*.ts`): Public-facing TypeScript API
2. **Native Bridge**: Calls to native modules via React Native's `NativeModules`
3. **iOS Implementation** (`ios/SalesforceReact/SF*Bridge.m`): Objective-C code that calls iOS SDK
4. **Android Implementation** (`../Android/libs/SalesforceReact/src/`): Kotlin code that calls Android SDK

Example data flow for a REST API call:
```
JS: net.sendRequest(...)
  → NativeModules.SFNetReactBridge.sendRequest(...)
    → iOS: SFNetReactBridge.m calls RestClient from SalesforceSDKCore
    → Android: NetReactBridge.kt calls RestClient from SalesforceSDK
  ← Native bridge returns promise/callback
← JS: Returns promise to app
```

## Build & Test Setup

### Prerequisites
- **Node.js**: 20+ (see `package.json` engines)
- **TypeScript**: Installed via devDependencies
- **iOS Development**: Xcode 15+, macOS
- **Android Development**: For Android bridge testing, see Android repo

### Build JavaScript/TypeScript

```bash
# Install dependencies
npm install

# Compile TypeScript to dist/
npm run build

# Prepare for publishing (runs build automatically)
npm run prepublish
```

### iOS Bridge Testing

The `iosTests/` directory contains an Xcode project that runs XCTest tests against the iOS bridge:

```bash
cd iosTests

# Setup test workspace (installs dependencies, generates test bundle)
./prepareios.js

# Start Metro bundler (required for React Native tests)
npm start

# In another terminal, open workspace and run tests
open ios/SalesforceReactTestApp.xcworkspace
# Run tests in Xcode (Cmd+U)
```

**Test structure**:
- `iosTests/ios/SalesforceReactTests/*.m` - XCTest test classes
- Tests load JavaScript test suite from `test/` via React Native bridge
- Tests verify that JavaScript API correctly calls iOS native modules

### JavaScript Test Suite

The `test/` directory contains the shared test suite used by both iOS and Android:

```bash
# Tests are bundled into iOS/Android test apps
# See iosTests/README.md for iOS testing
# See Android repo for Android testing
```

**Test files**:
- `alltests.js` - Entry point that imports all tests
- `*.test.js` - Test modules for each SDK feature
- Tests use a custom test harness (`harness.test.js`) that bridges to native test frameworks

## Code Standards

### General Rules (Both Platforms)
- **Public API changes require a deprecation cycle**. Deprecate in release N, remove no earlier than release N+2 (next major).
- **No hardcoded secrets, tokens, or PII in source**. Not even in test fixtures.
- **Never log PII, refresh tokens, or full request/response bodies**.
- **Compiler warnings are bugs**. Fix all warnings before submitting a PR.
- **Maintain cross-platform parity**: Changes to JavaScript API must be reflected in both iOS and Android bridges.

### TypeScript/JavaScript Standards
- **TypeScript for all new code**. Use strict type checking.
- **Export types**: All public types should be exported from `typings/`
- **Promises preferred** over callbacks for async operations
- **ESLint**: Follow `.eslintrc.yml` configuration
- **Formatting**: Use Prettier (`.prettierrc.yaml`)
- **Naming**:
  - Functions/variables: `camelCase`
  - Types/Interfaces: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`

### iOS Bridge Standards (Objective-C)
- **Objective-C** for iOS bridge code (matches existing codebase)
- **RCT macros**: Use `RCT_EXPORT_MODULE()` and `RCT_EXPORT_METHOD()` for React Native bridging
- **Thread safety**: Bridge methods are called on the React Native bridge thread
- **Error handling**: Return errors via React Native promises/callbacks
- **Memory management**: Follow ARC conventions
- **No direct UI work on bridge thread**: Dispatch to main queue when needed

### Android Bridge Standards (Kotlin)
See `SalesforceMobileSDK-Android/CLAUDE.md` for Android-specific standards. Key points:
- **Kotlin for all new code** in Android bridge
- **Coroutines preferred** for async operations
- Follow Android SDK conventions

## Testing Standards

### JavaScript Tests
- **Test framework**: Custom harness that bridges to native XCTest (iOS) and AndroidX Test (Android)
- **Naming**: `test_given[Precondition]_when[Action]_then[Expected]`
- **Coverage**: All public API methods must have tests
- **Test data cleanup**: Clean up soups, accounts, and cached data after each test
- **Async operations**: Use proper promise handling, no hardcoded delays

### iOS Bridge Tests
- **Framework**: XCTest
- **Test pattern**: Objective-C test class loads JavaScript tests via React Native
- **Requires**: Connected to Salesforce org (uses test_credentials.json)
- **Run location**: `iosTests/ios/SalesforceReactTests/`

### Android Bridge Tests
- **Framework**: AndroidX Test with JUnit
- **Location**: `SalesforceMobileSDK-Android/libs/SalesforceReact` (separate repo)
- **Run command**: `./gradlew :libs:SalesforceReact:connectedAndroidTest`

### What to Test for Each Module

**OAuth (react.force.oauth)**:
- User authentication flow
- Token refresh
- Logout
- Multi-user account management
- User info retrieval

**REST API (react.force.net)**:
- Request construction (GET, POST, PUT, PATCH, DELETE)
- Response parsing
- Error handling (401→refresh, 403, network errors)
- File upload/download
- Batch requests

**SmartStore (react.force.smartstore)**:
- Soup CRUD operations
- Index management
- Smart SQL queries
- Encryption (database is always encrypted)
- Concurrent access

**MobileSync (react.force.mobilesync)**:
- Sync down (SOQL, MRU, layout, metadata targets)
- Sync up (create, update, delete)
- Conflict resolution
- Sync status tracking
- Clean ghosts (remove server-deleted records)

## Cross-Platform Change Workflow

When making changes that affect the public API:

1. **Modify TypeScript API** in `src/`
2. **Update iOS bridge** in `ios/SalesforceReact/`
3. **Update Android bridge** in `SalesforceMobileSDK-Android/libs/SalesforceReact/`
4. **Update type definitions** in `src/typings/`
5. **Add tests** in `test/` (shared by both platforms)
6. **Run iOS tests** via `iosTests/`
7. **Run Android tests** in Android repo
8. **Update React Native templates** if needed (in Templates repo)

**Important**: A complete feature requires changes in multiple repos:
- This repo (JavaScript + iOS bridge)
- Android repo (Android bridge)
- Templates repo (if template updates needed)

## Code Review Checklist

When reviewing PRs:

- [ ] **Both platforms updated**: iOS bridge and Android bridge both implement the change
- [ ] **Type safety**: TypeScript types are exported and accurate
- [ ] **Backward compatibility**: No breaking changes without deprecation cycle
- [ ] **Tests included**: JavaScript tests cover new functionality
- [ ] **iOS tests pass**: Run iosTests suite
- [ ] **Android tests pass**: Verify in Android repo
- [ ] **Documentation**: JSDoc comments on public APIs
- [ ] **Templates work**: Test with ReactNativeTemplate if API changed
- [ ] **No console warnings**: No ESLint or TypeScript compiler warnings
- [ ] **Build succeeds**: `npm run build` completes successfully

## Agent Behavior Guidelines

### Do
- Always run TypeScript compilation (`npm run build`) before committing JavaScript changes
- Test changes on both iOS and Android platforms
- Check that templates still work after API changes (use `test_template.sh` in Templates repo)
- Reference the iOS and Android repo CLAUDE.md files when working on bridge code
- Run iosTests to verify iOS bridge changes
- Maintain type definitions when adding/modifying APIs

### Don't
- Don't modify `package.json` version field manually (managed by release process)
- Don't modify `SalesforceReact.podspec` without updating iOS SDK dependencies
- Don't add new native dependencies without flagging for human review
- Don't create breaking changes without deprecation cycle
- Don't merge without verifying both iOS and Android bridges work
- Don't modify React Native version without consulting team (affects templates)

### Escalation — Stop and Flag for Human Review
- Any change to OAuth flow or token handling
- Any new public API or modification to existing API signature
- Dependency version bumps (React Native, iOS SDK, Android SDK)
- Changes affecting template generation
- Build system changes (tsconfig, package.json scripts, podspec)
- Removal of any previously deprecated API

## Key Domain Concepts

Understanding these concepts is essential:

- **Native Bridge**: React Native's mechanism for calling native iOS/Android code from JavaScript via `NativeModules`
- **Bridge Module**: A native class that exports methods to JavaScript (e.g., `SFOauthReactBridge`)
- **Promise-based APIs**: Modern async pattern used throughout (replaces older callback pattern)
- **External Client App or Connected App (legacy)**: Required Salesforce OAuth configuration (defined in templates, not in this library)
- **SmartStore Soup**: Encrypted on-device storage table (SQLCipher-backed)
- **Sync Target**: MobileSync abstraction for defining what/how to sync
- **Test Harness**: Custom bridge between JavaScript tests and native test frameworks

## Release & Distribution

### npm Package
- **Package name**: `react-native-force`
- **Current version**: See `package.json`
- **Registry**: npmjs.org (published manually by maintainers)
- **Release timing**: Coordinated with iOS and Android SDK releases

### Release Process
1. Version bump in `package.json` (coordinated with Package repo release script)
2. Run `npm run build` to compile TypeScript
3. Update `SalesforceReact.podspec` version
4. Tag release in git
5. Publish to npmjs via `npm publish`
6. Update React Native templates to reference new version

### Template Integration
React Native templates depend on this package:
- `ReactNativeTemplate` - Basic template
- `ReactNativeTypeScriptTemplate` - TypeScript template
- `ReactNativeDeferredTemplate` - Deferred login template
- `MobileSyncExplorerReactNative` - Sample app

Templates specify dependency in `package.json`:
```json
"dependencies": {
  "react-native-force": "git+https://github.com/forcedotcom/SalesforceMobileSDK-ReactNative.git#dev"
}
```

## Related Documentation

- **Mobile SDK Development Guide**: https://developer.salesforce.com/docs/platform/mobile-sdk/guide
- **iOS SDK**: See `SalesforceMobileSDK-iOS/CLAUDE.md`
- **Android SDK**: See `SalesforceMobileSDK-Android/CLAUDE.md`
- **Templates**: See `SalesforceMobileSDK-Templates/TESTING.md`
- **npm Package**: https://www.npmjs.com/package/react-native-force
- **GitHub Repo**: https://github.com/forcedotcom/SalesforceMobileSDK-ReactNative
