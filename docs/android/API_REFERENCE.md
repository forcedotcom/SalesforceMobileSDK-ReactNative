# Android Bridge API Reference

Complete API documentation for the Android native bridge classes in the Salesforce Mobile SDK for React Native.

## Table of Contents

- [Bridge Modules](#bridge-modules) — `SFOauthReactBridge`, `SFNetReactBridge`, `SFSmartStoreReactBridge`, `SFMobileSyncReactBridge`
- [App Layer](#app-layer) — `SalesforceReactSDKManager`, `SalesforceReactPackage`
- [UI Layer](#ui-layer) — `SalesforceReactActivity`, `SalesforceReactActivityDelegate`
- [Utilities](#utilities) — `ReactBridgeHelper`, `SalesforceReactLogger`
- [Common Patterns](#common-patterns)

---

## Bridge Modules

All bridge modules extend `ReactContextBaseJavaModule`, implement `TurboModule`, and live in `android/src/main/java/com/salesforce/androidsdk/reactnative/bridge/`.

### SalesforceOauthReactBridge

**Module name**: `"SFOauthReactBridge"` | **File**: `SalesforceOauthReactBridge.kt`

Delegates all calls to the current `SalesforceReactActivity`. Uses a retry mechanism (up to 5×, 500ms apart) to wait for the activity to be available.

| Method | Description |
|--------|-------------|
| `authenticate(args: ReadableMap, callback: Callback)` | Initiates OAuth flow or returns cached credentials. Returns full credentials JSON: `accessToken`, `instanceUrl`, `orgId`, `userId`, and user fields. |
| `getAuthCredentials(args: ReadableMap, callback: Callback)` | Returns current credentials without triggering OAuth. Fails if not authenticated. |
| `logoutCurrentUser(args: ReadableMap, callback: Callback)` | Logs out the current user and clears local data. |

---

### SalesforceNetReactBridge

**Module name**: `"SFNetReactBridge"` | **File**: `SalesforceNetReactBridge.kt`

`open class` — `getRestClient()` is `protected open` for testability.

#### `sendRequest(args: ReadableMap, callback: Callback)`

Sends an authenticated REST request. Args fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `method` | String | Yes | HTTP method: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD` |
| `path` | String | Yes | Resource path (e.g. `/v60.0/sobjects/Account`) |
| `endPoint` | String | No | API endpoint; defaults to the standard REST endpoint |
| `queryParams` | Object | No | For GET/DELETE/HEAD: appended to URL. For POST/PUT/PATCH: sent as body. |
| `headerParams` | Object | No | Additional HTTP headers |
| `fileParams` | Object | No | Files for multipart/form-data upload. Each entry: `{ fileMimeType, fileUrl, fileName }` |
| `returnBinary` | Boolean | No | If true, returns `{ contentType, encodedBody }` (Base64) instead of a string |
| `doesNotRequireAuthentication` | Boolean | No | If true, sends without OAuth token |

**Auto-handles**: token refresh on 401 (retries once), non-2xx errors return `{ headers, statusCode, body }`.

---

### SmartStoreReactBridge

**Module name**: `"SFSmartStoreReactBridge"` | **File**: `SmartStoreReactBridge.kt`

All methods accept `isGlobalStore` (Boolean, optional) and `storeName` (String, optional) in `args` to select the target store.

#### Store Management

| Method | Description |
|--------|-------------|
| `registerSoup(args, callback)` | Creates a soup with the given index specs. Index types: `string`, `integer`, `floating`, `full_text`, `json1`. |
| `removeSoup(args, callback)` | Drops a soup and all its entries. |
| `clearSoup(args, callback)` | Deletes all entries but keeps the soup structure. |
| `soupExists(args, callback)` | Returns `"true"` or `"false"` string. |
| `alterSoup(args, callback)` | Modifies indexes; optionally re-indexes existing data. |
| `reIndexSoup(args, callback)` | Re-indexes specific paths. |
| `getSoupIndexSpecs(args, callback)` | Returns current index specs for a soup. |
| `getDatabaseSize(args, callback)` | Returns database size in bytes as a string. |

#### Entry Operations

| Method | Description |
|--------|-------------|
| `upsertSoupEntries(args, callback)` | Inserts or updates entries in a transaction. Supports custom `externalIdPath` for matching. |
| `retrieveSoupEntries(args, callback)` | Fetches entries by `_soupEntryId` array. |
| `removeFromSoup(args, callback)` | Deletes entries by ID array or QuerySpec. |

#### Query Operations

| Method | Description |
|--------|-------------|
| `querySoup(args, callback)` | Queries via QuerySpec (exact/range/like/all). Rejects smart SQL (use `runSmartQuery`). Returns a cursor. |
| `runSmartQuery(args, callback)` | Executes Smart SQL across soups. Syntax: `{soupName:fieldPath}`. Rejects non-smart queries. Returns a cursor. |
| `moveCursorToPageIndex(args, callback)` | Navigates a cursor to the given page index. |
| `closeCursor(args, callback)` | Releases cursor resources. Must be called when done. |

**Cursor object structure**:
```json
{
    "cursorId": "...",
    "totalEntries": 100,
    "currentPageIndex": 0,
    "totalPages": 10,
    "pageSize": 10,
    "currentPageOrderedEntries": [...]
}
```

#### Multi-Store Management

| Method | Description |
|--------|-------------|
| `getAllStores(args, callback)` | Lists all user-scoped stores. |
| `getAllGlobalStores(args, callback)` | Lists all global stores. |
| `removeStore(args, callback)` | Removes an entire named store. |
| `removeAllStores(args, callback)` | Removes all user-scoped stores. |
| `removeAllGlobalStores(args, callback)` | Removes all global stores. |

---

### MobileSyncReactBridge

**Module name**: `"SFMobileSyncReactBridge"` | **File**: `MobileSyncReactBridge.kt`

Callbacks are invoked only on terminal states (`DONE` or `FAILED`).

| Method | Description |
|--------|-------------|
| `syncDown(args, callback)` | Syncs from Salesforce to SmartStore. Target types: `soql`, `sosl`, `mru`, `metadata`, `layout`. Options: `{ mergeMode: 'OVERWRITE' \| 'LEAVE_IF_CHANGED' }`. |
| `syncUp(args, callback)` | Syncs local changes to Salesforce. Target types: `syncUp`, `batchSyncUp`, `advancedSyncUp`. |
| `getSyncStatus(args, callback)` | Returns sync state by `syncId` or `syncName`. |
| `reSync(args, callback)` | Re-runs a previous sync by `syncId` or `syncName`. |
| `deleteSync(args, callback)` | Deletes a sync record by `syncId` or `syncName`. |
| `cleanResyncGhosts(args, callback)` | Removes locally cached records that were deleted on the server. Runs async via `CleanResyncGhostsCallback`. |
| `resetSyncManager(args, callback)` | Resets the SyncManager instance. |

**Sync state object**:
```json
{
    "_id": 1,
    "type": "syncDown",
    "target": { "type": "soql", "query": "..." },
    "options": { "mergeMode": "OVERWRITE" },
    "soupName": "accounts",
    "status": "DONE",
    "progress": 100,
    "totalSize": 50,
    "maxTimeStamp": 1700000000000,
    "error": null,
    "name": "syncDownAccounts"
}
```

---

## App Layer

### SalesforceReactSDKManager

**Package**: `com.salesforce.androidsdk.reactnative.app` | **Extends**: `MobileSyncSDKManager` | **File**: `SalesforceReactSDKManager.java`

Singleton that initializes the React Native SDK environment and registers bridge modules.

| Method | Description |
|--------|-------------|
| `initReactNative(Context, Class<Activity>)` | Main initializer. Call in `Application.onCreate()`. |
| `initReactNative(Context, Class<Activity>, Class<Activity>)` | Overload with custom login activity. |
| `getInstance()` | Returns singleton; throws `RuntimeException` if not initialized. |
| `getReactPackage()` | Returns `SalesforceReactPackage` containing all four bridge modules. |
| `getAppType()` | Returns `"ReactNative"`. |
| `getDevActions(Activity)` | Returns dev actions map including "React Native Dev Support". |

### SalesforceReactPackage

**File**: `SalesforceReactPackage.kt` | **Extends**: `BaseReactPackage`

Registers all four TurboModules and their codegen metadata.

| Method | Description |
|--------|-------------|
| `getModule(name, reactContext)` | Maps `"SFOauthReactBridge"`, `"SFNetReactBridge"`, `"SFSmartStoreReactBridge"`, `"SFMobileSyncReactBridge"` to instances. |
| `getReactModuleInfoProvider()` | Declares all four modules as TurboModules (`isTurboModule = true`). |
| `createNativeModules(reactContext)` | Legacy fallback for composite build classloader edge cases. |

---

## UI Layer

> `SalesforceReactActivity` and `SalesforceReactActivityDelegate` live in the `SalesforceMobileSDK-Android` repo (`libs/SalesforceReact/`), not this repo. They are listed here for completeness as they are called by the bridge modules.

### SalesforceReactActivity

**Extends**: `ReactActivity` | **Implements**: `SalesforceActivityInterface` | **File**: `SalesforceReactActivity.java` (Android repo)

Base activity for React Native apps. Manages OAuth flow, pending auth callbacks, and React Native lifecycle.

| Method | Description |
|--------|-------------|
| `shouldAuthenticate()` | Override to control auth requirement. Default: `true`. |
| `onErrorAuthenticateOffline()` | Override for custom offline error handling. |
| `authenticate(Callback)` | Called by `SFOauthReactBridge`. Triggers OAuth or returns cached credentials. |
| `getAuthCredentials(Callback)` | Called by `SFOauthReactBridge`. Returns current credentials. |
| `logout(Callback)` | Called by `SFOauthReactBridge`. Logs out and clears data. |
| `getRestClient()` | Returns authenticated `RestClient` or null. |
| `buildClientManager()` | Returns `ClientManager` instance. |
| `showReactDevOptionsDialog()` | Shows React Native dev options (debug builds only). |
| `onResume(RestClient)` | Override to act after successful authentication. |
| `onLogoutComplete()` | Override for post-logout cleanup. |
| `onUserSwitched()` | Called on multi-user account switch. |
| `createReactActivityDelegate()` | Returns `SalesforceReactActivityDelegate`. |

**Pending callback mechanism**: Both `authenticatedRestClient()` callback and `onResume()` check and atomically clear `pendingAuthCallback`. Whichever fires first invokes it; the other sees null and is a no-op. This handles the race between OAuth completion and activity lifecycle.

### SalesforceReactActivityDelegate

**Extends**: `ReactActivityDelegate` | **File**: `SalesforceReactActivityDelegate.java` (Android repo)

Thin subclass of `ReactActivityDelegate`. In bridgeless mode, no `loadApp()` gating is needed.

---

## Utilities

### ReactBridgeHelper

**File**: `ReactBridgeHelper.java` | Utility class, no instantiation.

Type conversion between React Native and Java types.

#### Callback Invocation

| Method | Description |
|--------|-------------|
| `invokeSuccess(Callback, JSONObject)` | Serialize JSONObject and invoke callback. |
| `invokeSuccess(Callback, JSONArray)` | Serialize JSONArray and invoke callback. |
| `invokeSuccess(Callback, String)` | Invoke with string value. |
| `invokeSuccess(Callback, boolean)` | Invoke with boolean value. |
| `invokeSuccess(Callback, int)` | Invoke with int value. |
| `invokeSuccess(Callback)` | Invoke with no value (void). |
| `invokeError(Callback, String)` | Invoke with error string: `callback.invoke(error)`. |

#### Type Conversion

| Method | Description |
|--------|-------------|
| `toJavaMap(ReadableMap)` | Converts to `Map<String, Object>`. |
| `toJavaStringStringMap(ReadableMap)` | Converts to `Map<String, String>`. |
| `toJavaStringMapMap(ReadableMap)` | Converts to `Map<String, Map<String, String>>`. |
| `toJavaList(ReadableArray)` | Converts to `List<Object>`. |
| `toJavaStringList(ReadableArray)` | Converts to `List<String>`. |

### SalesforceReactLogger

**File**: `SalesforceReactLogger.java` | Static utility wrapping `SalesforceLogger` for component `"SalesforceReact"`.

| Method | Description |
|--------|-------------|
| `e(tag, message)` / `e(tag, message, Throwable)` | Log at ERROR level. |
| `w(tag, message)` / `w(tag, message, Throwable)` | Log at WARN level. |
| `i(tag, message)` / `i(tag, message, Throwable)` | Log at INFO level. |
| `d(tag, message)` / `d(tag, message, Throwable)` | Log at DEBUG level. |
| `v(tag, message)` / `v(tag, message, Throwable)` | Log at VERBOSE level. |
| `setLogLevel(SalesforceLogger.Level)` | Set minimum log level: `VERBOSE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `OFF`. |

---

## Common Patterns

### Callback Serialization

All results pass through `ReactBridgeHelper.invokeSuccess()` which serializes to string. JavaScript calls `JSON.parse(result)` to deserialize. This is required because the React Native bridge serializes all callback arguments.

### Store Selection

Every SmartStore bridge method reads two optional args fields:

- `isGlobalStore` (Boolean) — `true` for global store, `false`/omitted for user-scoped store
- `storeName` (String) — named store; omit to use the default store

### Error Handling

All bridge methods wrap operations in try/catch. On exception: `ReactBridgeHelper.invokeError(callback, e.toString())`. The JavaScript `exec()` function then calls `errorCB(safeJSONparse(error))`.

### JavaScript Usage Example

```typescript
import { oauth, net, smartstore, mobilesync } from 'react-native-force';

// Authenticate (Promise-based via forceUtil.promiser)
const credentials = await oauth.authenticate();

// REST call
const result = await net.query('SELECT Id, Name FROM Account LIMIT 10');

// SmartStore
await smartstore.registerSoup(false, 'accounts', [
    { path: 'Id', type: 'string' },
    { path: 'Name', type: 'string' }
]);
await smartstore.upsertSoupEntries(false, 'accounts', result.records);

// MobileSync
await mobilesync.syncDown(
    false,
    { type: 'soql', query: 'SELECT Id, Name FROM Account' },
    'accounts',
    { mergeMode: 'OVERWRITE' }
);
```

---

## Related Documentation

- [Android Bridge Overview](README.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md) — Cross-platform bridge architecture
- [JavaScript API Reference](../javascript/API_REFERENCE.md)
- [iOS API Reference](../ios/API_REFERENCE.md) — Equivalent iOS implementation
- [android-tests/README.md](../android-tests/README.md) — Android test infrastructure
- [Android Javadoc](https://forcedotcom.github.io/SalesforceMobileSDK-Android/index.html)
