# Android Bridge Implementation

This document covers the Android native bridge implementation of the Salesforce Mobile SDK for React Native. The Android bridge lives in this repository at `android/`, written in Kotlin as TurboModules (New Architecture, bridgeless mode).

## Overview

The Android bridge exposes four TurboModule bridge classes and supporting app/UI layer classes. Together they provide:

- **OAuth Authentication**: Complete Salesforce OAuth2 flow with automatic token management
- **SmartStore**: Encrypted local data storage (SQLCipher-backed) with SQL-like querying
- **MobileSync**: Bidirectional data synchronization between device and Salesforce cloud
- **REST API**: Authenticated REST calls to Salesforce APIs

## Bridge Architecture

```
JavaScript/TypeScript API (src/)
        ↓
TurboModuleRegistry (codegen specs in src/specs/)
        ↓
Android Bridge (android/ — this repo)
  ├── SFOauthReactBridge.kt
  ├── SFNetReactBridge.kt
  ├── SFSmartStoreReactBridge.kt
  ├── SFMobileSyncReactBridge.kt
  └── ReactBridgeHelper.java (type conversion utility)
        ↓
App/UI Layer (SalesforceMobileSDK-Android repo)
  ├── SalesforceReactSDKManager
  └── SalesforceReactActivity
        ↓
Android SDK Libraries (SalesforceSDK, SmartStore, MobileSync)
```

All four bridge modules:
- Extend `ReactContextBaseJavaModule` (backward compatibility)
- Implement `TurboModule` interface
- Use the unified single-callback pattern matching iOS: `callback(null, result)` for success, `callback(errorMessage)` for error
- Module names use the `SF*` prefix (e.g. `"SFOauthReactBridge"`) — unified with iOS

## Directory Structure

```
android/src/main/java/com/salesforce/androidsdk/reactnative/
├── app/
│   ├── SalesforceReactSDKManager.java   # SDK init, ReactPackage, lifecycle
│   ├── SalesforceReactPackage.kt        # Registers all four TurboModules
│   └── SalesforceReactUpgradeManager.java
├── bridge/
│   ├── SalesforceOauthReactBridge.kt    # OAuth/credentials bridge
│   ├── SalesforceNetReactBridge.kt      # REST API bridge
│   ├── SmartStoreReactBridge.kt         # SmartStore bridge
│   ├── MobileSyncReactBridge.kt         # MobileSync bridge
│   └── ReactBridgeHelper.java           # ReadableMap/Array ↔ Java conversion
├── ui/
│   ├── SalesforceReactActivity.java     # Base activity (in Android repo)
│   └── SalesforceReactActivityDelegate.java
└── util/
    └── SalesforceReactLogger.java
```

> **Note**: `SalesforceReactActivity` and `SalesforceReactSDKManager` live in the `SalesforceMobileSDK-Android` repo (`libs/SalesforceReact/`). The bridge modules (`SF*Bridge`) are in this repo (`android/`).

## Gradle Integration

The Android bridge is distributed as an Android library module via React Native autolinking. It declares dependencies on:
- `MobileSync` (transitively pulls in SmartStore → SalesforceSDK → SalesforceAnalytics)
- React Native (`react-android`)

## Initialization

Initialize in your `Application` class:

```java
public class MainApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        SalesforceReactSDKManager.initReactNative(
            getApplicationContext(),
            MainActivity.class
        );
    }
}
```

Extend `SalesforceReactActivity` in your main activity:

```java
public class MainActivity extends SalesforceReactActivity {
    @Override
    protected String getMainComponentName() {
        return "YourAppName";
    }

    @Override
    public boolean shouldAuthenticate() {
        return true;
    }
}
```

## Bridge Callback Pattern

All bridge methods use a single-callback pattern aligned with iOS:

```kotlin
// Success
ReactBridgeHelper.invokeSuccess(callback, resultJsonObject)

// Error
ReactBridgeHelper.invokeError(callback, errorMessage)
```

JavaScript reads this via the `exec()` utility in `react-native-force`:

```typescript
module[methodName](args, (error, result) => {
    if (error) errorCB(safeJSONparse(error));
    else successCB(safeJSONparse(result));
});
```

## Authentication Flow

The OAuth bridge delegates to `SalesforceReactActivity`, which manages pending callbacks across the activity lifecycle:

1. JS calls `SFOauthReactBridge.authenticate()`
2. Bridge stores `pendingAuthCallback` on the activity
3. Activity starts OAuth flow (login screen if needed)
4. On OAuth completion, `onResume()` or `authenticatedRestClient()` fires — whichever runs first invokes the pending callback
5. Credentials JSON is returned to JS

The `withActivity()` helper in `SalesforceOauthReactBridge` retries up to 5× (500ms apart) if `SalesforceReactActivity` is not yet the current activity.

## SmartStore Multi-Store Support

`SmartStoreReactBridge` resolves the target store from each call's `args`:

- `isGlobalStore=true` → `SmartStoreSDKManager.getGlobalSmartStore(storeName)`
- `isGlobalStore=false` → `SmartStoreSDKManager.getSmartStore(storeName, account, communityId)`

Default store is used when `storeName` is omitted.

## Threading Model

| Thread | Responsibility |
|--------|---------------|
| Main thread | Activity lifecycle, UI updates, React Native bridge dispatch |
| Background threads | REST API calls, OAuth flow, MobileSync operations |
| Database thread | SmartStore queries and writes |

SmartStore uses `synchronized(smartStore.getDatabase())` blocks with transactions. Cursor management uses a `synchronized static Map<SQLiteDatabase, SparseArray<StoreCursor>>`.

## TurboModule Codegen

TypeScript codegen specs live in `react-native-force/src/specs/`:
- `NativeSFOauthReactBridge.ts`
- `NativeSFNetReactBridge.ts`
- `NativeSFSmartStoreReactBridge.ts`
- `NativeSFMobileSyncReactBridge.ts`

Generated Java specs are in `android/generated/source/codegen/java/com/facebook/fbreact/specs/`.

## Logging

Use `SalesforceReactLogger` for consistent logging:

```java
SalesforceReactLogger.i(TAG, "Info message");
SalesforceReactLogger.e(TAG, "Error message", exception);
```

Log levels: `VERBOSE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `OFF`.

## Related Documentation

- [API Reference](API_REFERENCE.md) — All bridge classes and methods
- [ARCHITECTURE.md](../ARCHITECTURE.md) — Cross-platform bridge architecture
- [android-tests/README.md](../android-tests/README.md) — Android test infrastructure
- [Android Javadoc](https://forcedotcom.github.io/SalesforceMobileSDK-Android/index.html)
- [iOS Bridge](../ios/README.md) — Equivalent iOS implementation
