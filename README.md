[![Tests](https://github.com/forcedotcom/SalesforceMobileSDK-ReactNative/actions/workflows/nightly.yaml/badge.svg)](https://github.com/forcedotcom/SalesforceMobileSDK-ReactNative/actions/workflows/nightly.yaml)

# Salesforce Mobile SDK for React Native

JavaScript/TypeScript libraries and native bridge modules that enable React Native applications to integrate with the Salesforce platform.

## Overview

This repository provides the `react-native-force` npm package, which includes:

- **JavaScript/TypeScript API** - Modern, Promise-based interface to Salesforce Mobile SDK features
- **iOS Native Bridge** - Objective-C modules that bridge to iOS Mobile SDK libraries (`ios/SalesforceReact/`)
- **Android Native Bridge** - Kotlin modules that bridge to Android Mobile SDK libraries (`android/`)
- **Type Definitions** - Full TypeScript support for type-safe development

## Features

The SDK provides access to core Salesforce Mobile SDK functionality:

### Authentication (OAuth)
- OAuth 2.0 user authentication
- Token management and refresh
- Multi-user support
- Logout and session management
- User info and identity APIs

### REST API Client
- Salesforce REST API requests (GET, POST, PUT, PATCH, DELETE)
- Batch request support
- File upload and download
- Custom endpoint support
- Automatic token refresh on 401

### SmartStore (Encrypted Storage)
- Encrypted SQLite database (SQLCipher)
- JSON document storage (soups)
- Indexing and querying
- Smart SQL support
- Multi-user data isolation

### MobileSync (Data Synchronization)
- Bidirectional sync between device and Salesforce
- SOQL-based sync down
- Sync up with conflict detection
- MRU (Most Recently Used) sync
- Layout and metadata sync
- Sync status tracking

## Installation

This package is typically installed automatically when creating a new app using the Salesforce Mobile SDK CLI tools. See the [Getting Started](#getting-started) section for the recommended approach.

For manual installation in an existing React Native project:

```bash
npm install react-native-force
```

**Note**: Manual installation requires additional native setup steps. We strongly recommend using the CLI tools instead.

## Getting Started

### Prerequisites

- **Node.js**: ^22.13.0, ^24.3.0, or >=26.0.0
- **React Native**: 0.87.0 (see `package.json` for current version)
- **iOS Development**: Xcode 16.1+, macOS (for iOS builds)
- **Android Development**: Android Studio, Java 17+ (for Android builds)

### Creating a New App

The easiest way to create a Salesforce Mobile SDK React Native app is using the force CLI tools from the [SalesforceMobileSDK-Package](https://github.com/forcedotcom/SalesforceMobileSDK-Package) repository:

```bash
# Install CLI tools globally
npm install -g @salesforce/cli-mobile-sdk

# Create a new React Native app
forcereactnative create
    --platform ios,android
    --appname MyApp
    --packagename com.mycompany.myapp
    --organization "My Company"
```

This will generate a complete React Native application with:
- iOS and Android native projects pre-configured
- Salesforce Mobile SDK dependencies installed
- Sample code demonstrating SDK usage
- External Client App configuration template

### Template Options

Several templates are available in the [Templates repository](https://github.com/forcedotcom/SalesforceMobileSDK-Templates):

- **ReactNativeTemplate** - Basic JavaScript template with navigation
- **ReactNativeTypeScriptTemplate** - TypeScript template with type safety
- **ReactNativeDeferredTemplate** - Deferred authentication template
- **MobileSyncExplorerReactNative** - Full-featured sample app demonstrating all SDK features

## API Usage

### Import the SDK

```typescript
import {
  oauth,
  net,
  smartstore,
  mobilesync,
} from 'react-native-force';
```

### Authentication

```typescript
// Get current user info
const userInfo = await oauth.getAuthCredentials();
console.log(`Logged in as ${userInfo.userName}`);

// Logout
await oauth.logout();
```

### REST API Requests

```typescript
// Query records
const response = await net.query('SELECT Id, Name FROM Account LIMIT 10');
console.log(`Found ${response.totalSize} accounts`);

// Create a record
const newAccount = await net.create('Account', {
  Name: 'Acme Corp',
  Industry: 'Technology'
});

// Update a record
await net.update('Account', newAccount.id, {
  Phone: '555-1234'
});

// Delete a record
await net.del('Account', newAccount.id);
```

### SmartStore (Encrypted Storage)

```typescript
// Register a soup (table)
await smartstore.registerSoup(
  false, // isGlobalStore
  'accounts',
  [
    { path: 'Id', type: 'string' },
    { path: 'Name', type: 'string' }
  ]
);

// Save records to soup
await smartstore.upsertSoupEntries(
  false,
  'accounts',
  [
    { Id: '001xx000003DGb2AAG', Name: 'Acme' },
    { Id: '001xx000003DGb3AAG', Name: 'Global Corp' }
  ]
);

// Query soup
const results = await smartstore.querySoup(
  false,
  'accounts',
  {
    queryType: 'exact',
    indexPath: 'Name',
    matchKey: 'Acme'
  }
);
```

### MobileSync (Data Synchronization)

```typescript
// Sync down accounts from Salesforce
const syncDown = await mobilesync.syncDown(
  false, // isGlobalStore
  {
    type: 'soql',
    query: 'SELECT Id, Name FROM Account LIMIT 100'
  },
  'accounts',
  (progress) => {
    console.log(`Sync progress: ${progress.progress}%`);
  }
);

// Sync up local changes
const syncUp = await mobilesync.syncUp(
  false,
  {
    type: 'syncUp',
    soupName: 'accounts'
  },
  'accounts',
  (progress) => {
    console.log(`Sync up progress: ${progress.progress}%`);
  }
);
```

## Architecture

### Multi-Repository Structure

This package is part of a larger SDK ecosystem:

```
┌─────────────────────────────────────────────────┐
│  React Native App                               │
│  └── react-native-force (npm package)           │
└─────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐      ┌────────────────────┐
│ iOS Bridge    │      │ Android Bridge     │
│ (this repo)   │      │ (this repo)        │
│               │      │                    │
│ Objective-C   │      │ Kotlin             │
│ modules in    │      │ modules in         │
│ ios/          │      │ android/           │
│ SalesforceReact│      │                    │
└───────┬───────┘      └────────┬───────────┘
        │                       │
        ▼                       ▼
┌───────────────┐      ┌────────────────────┐
│ iOS SDK       │      │ Android SDK        │
│ Libraries     │      │ Libraries          │
│               │      │                    │
│ - SalesforceSDKCore  │ - SalesforceSDK   │
│ - SmartStore  │      │ - SmartStore       │
│ - MobileSync  │      │ - MobileSync       │
└───────────────┘      └────────────────────┘
```

### Bridge Locations
**This repository** contains both platform bridges:
- TypeScript/JavaScript source code (`src/`)
- iOS bridge code (`ios/SalesforceReact/`)
- Android bridge code (`android/`)
- iOS tests (`iosTests/`)
- Android tests (`androidTests/`)

## Development

### Building from Source

For the React Native 0.87 upgrade, use a Node version allowed by `package.json`
and align the bridge, native test apps and generated templates on React Native
0.87.0 and React 19.2.3. Mobile SDK's deployment minimums remain iOS 18 and
Android API 31.

Android uses AGP 9 with `android.builtInKotlin=false` and
`android.newDsl=false`, as required by the React Native Gradle integration.
These properties retain the Kotlin plugin and legacy Android DSL used by
React Native and the SDK's Gradle plugins. Keep them until those plugins support
the replacement APIs. The template Jest configuration uses
`@react-native/jest-preset`; the preset is no longer provided by `react-native`.
See the [upstream 0.87 template](https://github.com/react-native-community/template/tree/0.87-stable/template)
for the matching toolchain configuration.

```bash
# Clone the repository
git clone https://github.com/forcedotcom/SalesforceMobileSDK-ReactNative.git
cd SalesforceMobileSDK-ReactNative

# Install dependencies
npm install

# Compile TypeScript to JavaScript
npm run build
```

The compiled output will be in the `dist/` directory.
`npm run typecheck` checks all library sources, including TurboModule specs,
without emitting files. `npm run build:dist` emits the JavaScript, declarations
and source maps consumed by apps. `npm run build` runs both steps. Packing the
package also builds and verifies its contents before creating the archive.

### Running Tests

The Mobile SDK React Native templates and test apps support Hermes on both
platforms. Keep `hermesEnabled=true` on Android; disabling it fails configuration
before producing an app with a missing runtime. iOS enables Hermes in the
Podfile. JavaScriptCore is outside this configuration's supported test matrix;
it requires separate community runtime integration, not a Gradle switch alone.
See React Native's [Hermes documentation](https://reactnative.dev/docs/0.87/hermes).

#### JavaScript Tests
The test suite in `test/` is executed through native test runners:

```bash
# iOS tests
cd iosTests
./prepareios.js
npm start  # Start Metro bundler
# Open ios/SalesforceReactTestApp.xcworkspace in Xcode and run tests
```

#### Android Tests
```bash
cd androidTests
./prepareandroid.js
cd android
./gradlew :app:connectedDebugAndroidTest
```

### Code Structure

```
src/
├── index.ts                     # Main exports
├── react.force.oauth.ts         # OAuth/Authentication
├── react.force.net.ts           # REST API client
├── react.force.smartstore.ts    # SmartStore (storage)
├── react.force.mobilesync.ts    # MobileSync (sync)
├── react.force.util.ts          # Utilities
├── react.force.log.ts           # Logging
├── react.force.test.ts          # Test harness
└── typings/                     # TypeScript definitions
    ├── oauth.ts
    ├── smartstore.ts
    └── mobilesync.ts

ios/SalesforceReact/
├── SFOauthReactBridge.{h,mm}     # OAuth bridge
├── SFNetReactBridge.{h,mm}       # REST API bridge
├── SFSmartStoreReactBridge.{h,mm} # SmartStore bridge
├── SFMobileSyncReactBridge.{h,mm} # MobileSync bridge
└── SalesforceReactSDKManager.{h,m} # SDK configuration

test/
├── alltests.js                  # Test entry point
├── oauth.test.js                # OAuth tests
├── net.test.js                  # REST API tests
├── smartstore.test.js           # SmartStore tests
└── mobilesync.test.js           # MobileSync tests
```

## Documentation

### Developer Documentation
- **Mobile SDK Developer Guide**: https://developer.salesforce.com/docs/platform/mobile-sdk/guide
- **iOS SDK Documentation**: https://forcedotcom.github.io/SalesforceMobileSDK-iOS
- **Android SDK Documentation**: https://forcedotcom.github.io/SalesforceMobileSDK-Android

### Repository Documentation
- **CLAUDE.md**: Comprehensive guide for AI-assisted development (see CLAUDE.md in this repo)
- **iOS SDK**: See [SalesforceMobileSDK-iOS](https://github.com/forcedotcom/SalesforceMobileSDK-iOS)
- **Android SDK**: See [SalesforceMobileSDK-Android](https://github.com/forcedotcom/SalesforceMobileSDK-Android)
- **Templates**: See [SalesforceMobileSDK-Templates](https://github.com/forcedotcom/SalesforceMobileSDK-Templates)

### API Reference
The TypeScript definitions in `src/typings/` provide inline documentation for all APIs. For detailed usage examples, see the sample templates or the MobileSyncExplorerReactNative app.

## Version Compatibility

| React Native SDK | React Native | iOS SDK | Android SDK | iOS Min | Android Min |
|-----------------|--------------|---------|-------------|---------|-------------|
| dev141          | 0.87.0       | dev141  | dev141      | 18.0    | 31 (12.0)   |
| 14.0.0          | 0.85.3       | 14.0.0  | 14.0.0      | 18.0    | 31 (12.0)   |
| 13.2.0          | 0.81.5       | 13.2.0  | 13.2.0      | 17.0    | 28 (9.0)    |
| 13.1.0          | 0.79.3       | 13.1.0  | 13.1.0      | 17.0    | 28 (9.0)    |
| 13.0.0          | 0.74.7       | 13.0.0  | 13.0.0      | 17.0    | 28 (9.0)    |

See [release notes](https://github.com/forcedotcom/SalesforceMobileSDK-ReactNative/releases) for detailed version history and migration guides.

## Contributing

Contributions are welcome! Please:

1. Read the [CLAUDE.md](CLAUDE.md) file for development guidelines
2. Follow the existing code style (enforced by ESLint and Prettier)
3. Write tests for new functionality
4. Verify changes work on both iOS and Android
5. Submit a pull request with a clear description

### Before Submitting
- Run `npm run build` to ensure TypeScript compiles
- Run the test suite on both platforms
- Test with at least one React Native template
- Update type definitions if adding/modifying APIs

## Support

- **Issues**: [GitHub Issues](https://github.com/forcedotcom/SalesforceMobileSDK-ReactNative/issues)
- **Questions**: [Salesforce Developer Community](https://developer.salesforce.com/forums)
- **Stack Overflow**: Tag questions with `salesforce-mobile-sdk`

## License

Salesforce Mobile SDK License. See [LICENSE](LICENSE) file for details.

## Security

Please report security vulnerabilities to [security@salesforce.com](mailto:security@salesforce.com). See [SECURITY.md](SECURITY.md) for more information.

## Related Repositories

- **iOS SDK**: https://github.com/forcedotcom/SalesforceMobileSDK-iOS
- **Android SDK**: https://github.com/forcedotcom/SalesforceMobileSDK-Android
- **Templates**: https://github.com/forcedotcom/SalesforceMobileSDK-Templates
- **Package/CLI Tools**: https://github.com/forcedotcom/SalesforceMobileSDK-Package
- **Cordova Plugin**: https://github.com/forcedotcom/SalesforceMobileSDK-CordovaPlugin
- **iOS Hybrid**: https://github.com/forcedotcom/SalesforceMobileSDK-iOS-Hybrid
- **Shared Resources**: https://github.com/forcedotcom/SalesforceMobileSDK-Shared

## Code of Conduct

This project follows the Salesforce open source [Code of Conduct](CODE_OF_CONDUCT.md).
