# Salesforce Mobile SDK for React Native - Documentation

Welcome to the comprehensive documentation for the Salesforce Mobile SDK for React Native. This documentation covers the architecture, APIs, and implementation details of the `react-native-force` npm package.

## Documentation Structure

### Overview
- **[README.md](README.md)** - This file, providing navigation and overview
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture and bridge pattern

### JavaScript/TypeScript API
- **[javascript/README.md](javascript/README.md)** - Overview of all JavaScript modules
- **[javascript/API_REFERENCE.md](javascript/API_REFERENCE.md)** - Complete API documentation with examples

### iOS Implementation
- **[ios/README.md](ios/README.md)** - Overview of iOS bridge implementation
- **[ios/API_REFERENCE.md](ios/API_REFERENCE.md)** - iOS native classes and bridging details

### Testing
- **[ios-tests/README.md](ios-tests/README.md)** - iOS test app structure and running tests

## Quick Start

### For App Developers

If you're building a React Native app with Salesforce integration:

1. Start with the [JavaScript API Reference](javascript/API_REFERENCE.md) to learn the available APIs
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) to understand how the SDK works
3. Check the root [README.md](../README.md) for installation and setup instructions

### For SDK Contributors

If you're contributing to the SDK itself:

1. Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the three-layer architecture
2. Review [ios/README.md](ios/README.md) for iOS bridge implementation details
3. See [ios-tests/README.md](ios-tests/README.md) for testing guidelines
4. Check [../CLAUDE.md](../CLAUDE.md) for development standards and workflow

## Key Concepts

### React Native Bridge Pattern

This SDK uses React Native's native module bridge to connect JavaScript code with native iOS and Android implementations:

```
JavaScript/TypeScript API (src/)
        ↓
React Native Bridge (NativeModules)
        ↓
iOS Bridge (ios/SalesforceReact/) ← YOU ARE HERE (this repo)
        ↓
iOS SDK Libraries (SalesforceSDKCore, SmartStore, MobileSync)

Android Bridge (SalesforceMobileSDK-Android/libs/SalesforceReact/)
        ↓
Android SDK Libraries (SalesforceSDK, SmartStore, MobileSync)
```

### Module Organization

The SDK is organized into five main modules:

1. **OAuth** (`react.force.oauth`) - Authentication and user management
2. **Net** (`react.force.net`) - Salesforce REST API client
3. **SmartStore** (`react.force.smartstore`) - Encrypted on-device storage
4. **MobileSync** (`react.force.mobilesync`) - Data synchronization framework
5. **Utilities** (`react.force.util`, `react.force.log`, `react.force.common`) - Supporting utilities

### Data Flow Example

Here's how a typical API call flows through the system:

```typescript
// 1. JavaScript API call
import { net } from 'react-native-force';
const result = await net.query('SELECT Id, Name FROM Account LIMIT 10');

// 2. Bridge call via NativeModules
NativeModules.SFNetReactBridge.sendRequest(...)

// 3. iOS: SFNetReactBridge.m receives call
// 4. iOS: Calls SFRestAPI from SalesforceSDKCore
// 5. iOS: Returns result to JavaScript via callback

// 6. JavaScript: Promise resolves with result
console.log(result.records);
```

## npm Package Structure

The `react-native-force` package is published to npmjs with the following structure:

```
react-native-force/
├── dist/                    # Compiled JavaScript (from TypeScript)
├── src/                     # TypeScript source (included for source maps)
├── ios/SalesforceReact/     # iOS native bridge code
├── SalesforceReact.podspec  # CocoaPods specification
└── package.json             # npm package definition
```

### CocoaPods Integration

The iOS bridge is distributed via CocoaPods. The `SalesforceReact.podspec` declares dependencies on:
- `SalesforceSDKCommon` - Core SDK utilities
- `SalesforceAnalytics` - Analytics framework
- `SalesforceSDKCore` - OAuth, REST, and core features
- `SmartStore` - Encrypted storage
- `MobileSync` - Sync framework

### Android Integration

The Android bridge lives in a separate repository (`SalesforceMobileSDK-Android`) at `libs/SalesforceReact/`. It follows the same pattern as iOS but is written in Kotlin and uses Gradle for dependency management.

## Version Compatibility

| React Native SDK | React Native | iOS SDK | Android SDK | iOS Min | Android Min |
|-----------------|--------------|---------|-------------|---------|-------------|
| 14.0.0          | 0.81.5       | 14.0.0  | 14.0.0      | 18.0    | 28 (9.0)    |

See the [main README](../README.md) for the full version compatibility table.

## API Styles

### Callback-Based (Legacy)

```typescript
import { oauth } from 'react-native-force';

oauth.getAuthCredentials(
  (credentials) => {
    console.log('User:', credentials.userId);
  },
  (error) => {
    console.error('Error:', error);
  }
);
```

### Promise-Based (Recommended)

```typescript
import { oauth, forceUtil } from 'react-native-force';

const promisedGetAuth = forceUtil.promiser(oauth.getAuthCredentials);

try {
  const credentials = await promisedGetAuth();
  console.log('User:', credentials.userId);
} catch (error) {
  console.error('Error:', error);
}
```

Most modern React Native code uses the promise-based approach via the `promiser` utility.

## Common Use Cases

### Authentication
```typescript
// Get current user credentials
const credentials = await oauth.getAuthCredentials();

// Force login (shows OAuth flow)
const credentials = await oauth.authenticate();

// Logout
await oauth.logout();
```

### REST API Calls
```typescript
// Query records
const result = await net.query('SELECT Id, Name FROM Account LIMIT 10');

// Create a record
const newRecord = await net.create('Account', { Name: 'Acme Corp' });

// Update a record
await net.update('Account', recordId, { Phone: '555-1234' });

// Delete a record
await net.del('Account', recordId);
```

### Encrypted Storage (SmartStore)
```typescript
// Register a soup (table)
await smartstore.registerSoup(false, 'accounts', [
  { path: 'Id', type: 'string' },
  { path: 'Name', type: 'string' }
]);

// Store records
await smartstore.upsertSoupEntries(false, 'accounts', [
  { Id: '001', Name: 'Acme' }
]);

// Query records
const cursor = await smartstore.querySoup(false, 'accounts', querySpec);
```

### Data Synchronization (MobileSync)
```typescript
// Sync down from Salesforce
const syncDown = await mobilesync.syncDown(
  false,
  { type: 'soql', query: 'SELECT Id, Name FROM Account' },
  'accounts',
  { mergeMode: 'OVERWRITE' }
);

// Sync up local changes
const syncUp = await mobilesync.syncUp(
  false,
  { type: 'syncUp', soupName: 'accounts' },
  'accounts',
  {}
);
```

## TypeScript Support

The SDK is written in TypeScript and provides complete type definitions for all APIs. Import types from the main package:

```typescript
import { 
  oauth, 
  net, 
  smartstore, 
  mobilesync 
} from 'react-native-force';

import type { 
  UserAccount, 
  QuerySpec, 
  SyncOptions 
} from 'react-native-force';
```

## External Resources

- **Developer Guide**: https://developer.salesforce.com/docs/platform/mobile-sdk/guide
- **GitHub Repository**: https://github.com/forcedotcom/SalesforceMobileSDK-ReactNative
- **npm Package**: https://www.npmjs.com/package/react-native-force
- **iOS SDK Documentation**: https://forcedotcom.github.io/SalesforceMobileSDK-iOS
- **Android SDK Documentation**: https://forcedotcom.github.io/SalesforceMobileSDK-Android

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/forcedotcom/SalesforceMobileSDK-ReactNative/issues)
- **Questions**: [Salesforce Developer Community](https://developer.salesforce.com/forums)
- **Stack Overflow**: Tag questions with `salesforce-mobile-sdk`

## Next Steps

- **New to the SDK?** Start with [JavaScript API Reference](javascript/API_REFERENCE.md)
- **Understanding architecture?** Read [ARCHITECTURE.md](ARCHITECTURE.md)
- **Working on iOS bridge?** See [ios/README.md](ios/README.md)
- **Contributing?** Check [../CLAUDE.md](../CLAUDE.md) for guidelines
