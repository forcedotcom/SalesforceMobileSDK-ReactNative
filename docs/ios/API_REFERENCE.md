# iOS Bridge API Reference

Complete reference for all iOS bridge classes and their mapping to JavaScript APIs.

## Table of Contents

- [SFOauthReactBridge](#sfoauthreactbridge)
- [SFNetReactBridge](#sfnetreactbridge)
- [SFSmartStoreReactBridge](#sfsmartstorereactbridge)
- [SFMobileSyncReactBridge](#sfmobilesyncreactbridge)
- [SFSDKReactLogger](#sfsdkreactlogger)
- [SalesforceReactSDKManager](#salesforcereactsdkmanager)

---

## SFOauthReactBridge

**Header**: `ios/SalesforceReact/SFOauthReactBridge.h`  
**Implementation**: `ios/SalesforceReact/SFOauthReactBridge.m`  
**JavaScript Module**: `oauth` (`react.force.oauth`)

### Purpose

Handles OAuth authentication and user session management.

### iOS SDK Dependencies

```objective-c
@import SalesforceSDKCore;

// Key classes used:
- SFUserAccountManager  // User account management
- SFOAuthCredentials    // OAuth token storage
- SFOAuthInfo          // OAuth flow info
```

### Exported Methods

#### getAuthCredentials:callback:

Retrieves the current user's OAuth credentials.

**Signature**:
```objective-c
RCT_EXPORT_METHOD(getAuthCredentials:(NSDictionary *)args 
                          callback:(RCTResponseSenderBlock)callback)
```

**Arguments**:
- `args`: Empty dictionary (reserved for future use)
- `callback`: Bridge callback with signature `(error, result)`

**Returns**:
- **Success**: `(nil, credentialsDict)` where credentialsDict matches the `UserAccount` type defined in `src/typings/oauth.ts`:
  ```objective-c
  @{
      @"accessToken": NSString,
      @"clientId": NSString,
      @"instanceUrl": NSString,
      @"loginUrl": NSString,
      @"orgId": NSString,
      @"refreshToken": NSString,
      @"userAgent": NSString,
      @"userId": NSString
  }
  ```
- **Error**: `(NSError, nil)` if no user is authenticated

**Implementation**:
```objective-c
SFOAuthCredentials *creds = 
    [SFUserAccountManager sharedInstance].currentUser.credentials;

if (creds) {
    NSDictionary *dict = @{
        @"accessToken": creds.accessToken,
        @"refreshToken": creds.refreshToken,
        // ... more fields
    };
    callback(@[[NSNull null], dict]);
} else {
    NSError *error = [NSError errorWithDomain:@"OAuth" ...];
    callback(@[error, [NSNull null]]);
}
```

**JavaScript Mapping**:
```typescript
oauth.getAuthCredentials(success, error);
```

---

#### authenticate:callback:

Initiates the OAuth 2.0 login flow.

**Signature**:
```objective-c
RCT_EXPORT_METHOD(authenticate:(NSDictionary *)args 
                      callback:(RCTResponseSenderBlock)callback)
```

**Arguments**:
- `args`: Empty dictionary (OAuth settings come from Connected App config)
- `callback`: Bridge callback

**Returns**:
- **Success**: `(nil, credentialsDict)` after successful authentication
- **Error**: `(NSError, nil)` if authentication fails or user cancels

**Implementation**:
```objective-c
__weak typeof(self) weakSelf = self;
dispatch_async(dispatch_get_main_queue(), ^{
    __strong typeof(weakSelf) strongSelf = weakSelf;
    
    [[SFUserAccountManager sharedInstance] 
        loginWithCompletion:^(SFOAuthInfo *authInfo, 
                              SFUserAccount *userAccount) {
        [strongSelf sendAuthCredentials:callback];
    } 
    failure:^(SFOAuthInfo *authInfo, NSError *error) {
        callback(@[error, [NSNull null]]);
    }];
});
```

**Notes**:
- Runs on main thread (presents UIWebView/SFSafariViewController)
- Blocks until user completes or cancels login
- Sets `[SFUserAccountManager sharedInstance].currentUser` on success

**JavaScript Mapping**:
```typescript
oauth.authenticate(success, error);
```

---

#### logoutCurrentUser:callback:

Logs out the current user and revokes OAuth tokens.

**Signature**:
```objective-c
RCT_EXPORT_METHOD(logoutCurrentUser:(NSDictionary *)args 
                          callback:(RCTResponseSenderBlock)callback)
```

**Arguments**:
- `args`: Empty dictionary
- `callback`: Bridge callback

**Returns**:
- **Success**: `(nil, "OK")` after logout completes
- **Error**: Generally doesn't fail

**Implementation**:
```objective-c
__block id observerRef;
id observer = [[NSNotificationCenter defaultCenter]
    addObserverForName:kSFNotificationUserDidLogout
    object:nil
    queue:[NSOperationQueue mainQueue]
    usingBlock:^(NSNotification *note) {
        callback(@[[NSNull null], @"OK"]);
        [[NSNotificationCenter defaultCenter] removeObserver:observerRef];
    }];
observerRef = observer;

dispatch_async(dispatch_get_main_queue(), ^{
    [[SFUserAccountManager sharedInstance] logout];
});
```

**Notes**:
- Observes `kSFNotificationUserDidLogout` notification
- Runs logout on main thread
- Clears OAuth tokens from iOS Keychain

**JavaScript Mapping**:
```typescript
oauth.logout(success, error);
```

---

## SFNetReactBridge

**Header**: `ios/SalesforceReact/SFNetReactBridge.h`  
**Implementation**: `ios/SalesforceReact/SFNetReactBridge.m`  
**JavaScript Module**: `net` (`react.force.net`)

### Purpose

Handles Salesforce REST API requests.

### iOS SDK Dependencies

```objective-c
@import SalesforceSDKCore;

// Key classes used:
- SFRestAPI       // REST client
- SFRestRequest   // Request builder
- SFRestMethod    // HTTP methods enum
```

### Exported Methods

#### sendRequest:callback:

Sends an arbitrary HTTP request to Salesforce.

**Signature**:
```objective-c
RCT_EXPORT_METHOD(sendRequest:(NSDictionary *)argsDict 
                    callback:(RCTResponseSenderBlock)callback)
```

**Arguments** (in argsDict):
```objective-c
@{
    @"method": @"GET" | @"POST" | @"PUT" | @"PATCH" | @"DELETE",
    @"endPoint": @"/services/data",  // Base endpoint
    @"path": @"/v66.0/sobjects/Account",  // Request path
    @"queryParams": @{...},  // Query/body parameters
    @"headerParams": @{...},  // Custom headers
    @"fileParams": @{...},  // File uploads
    @"returnBinary": @(BOOL),  // Return binary data
    @"doesNotRequireAuthentication": @(BOOL)  // Skip auth
}
```

**Returns**:
- **Success**: `(nil, responseDict)` - Parsed JSON response
- **Error**: `(NSError, nil)` - Network or API error

**Implementation Overview**:
```objective-c
// 1. Parse method
SFRestMethod method = [SFRestRequest sfRestMethodFromHTTPMethod:argsDict[@"method"]];

// 2. Build request
SFRestRequest *request = [SFRestRequest requestWithMethod:method
                                                     path:path
                                              queryParams:queryParams];

// 3. Handle file uploads
if (fileParams) {
    [request addPostFileData:fileData 
                   paramName:paramName 
                    fileName:fileName 
                    mimeType:mimeType 
                      params:queryParams];
}

// 4. Send request
[[SFRestAPI sharedInstance] send:request 
                        delegate:nil 
                   resultHandler:^(id response, NSError *error) {
    if (error) {
        callback(@[error, [NSNull null]]);
    } else {
        callback(@[[NSNull null], response]);
    }
}];
```

**Special Features**:

**File Upload**:
```objective-c
// fileParams format:
@{
    @"attachment": @{
        @"fileMimeType": @"image/jpeg",
        @"fileUrl": @"file:///path/to/image.jpg",
        @"fileName": @"profile.jpg"
    }
}
```

**Binary Response**:
```objective-c
if (returnBinary) {
    request.parseResponse = NO;
    // Response is returned as:
    @{
        @"encodedBody": @"base64-encoded-data",
        @"contentType": @"image/jpeg"
    }
}
```

**Custom Endpoint**:
```objective-c
[request setEndpoint:@"/services/apexrest"];
// Full URL: https://instance.salesforce.com/services/apexrest/MyAPI
```

**JavaScript Mapping**:
```typescript
net.sendRequest(endPoint, path, success, error, method, payload, headerParams, fileParams);
```

**iOS SDK REST API Features**:
- Automatic OAuth token refresh on 401
- Connection management and pooling
- Request/response logging
- Network activity indicator management
- Certificate pinning (if configured)

---

## SFSmartStoreReactBridge

**Header**: `ios/SalesforceReact/SFSmartStoreReactBridge.h`  
**Implementation**: `ios/SalesforceReact/SFSmartStoreReactBridge.m`  
**JavaScript Module**: `smartstore` (`react.force.smartstore`)

### Purpose

Provides access to encrypted SQLite database (SmartStore).

### iOS SDK Dependencies

```objective-c
@import SmartStore;

// Key classes used:
- SFSmartStore        // Database manager
- SFSoupSpec         // Soup definition
- SFSoupIndex        // Index specification
- SFQuerySpec        // Query specification
- SFStoreCursor      // Query results cursor
```

### Key Concepts

**Store Types**:
- **User Store**: Per-user database (default)
- **Global Store**: Shared across all users
- **Named Store**: Named database (user or global)

**Data Model**:
- **Soup**: Table/collection (like SQL table)
- **Entry**: JSON document (like SQL row)
- **Index**: Indexed field (like SQL index)
- **Cursor**: Paginated query results

### Exported Methods

#### registerSoup:callback:

Creates a soup with indexes.

**Signature**:
```objective-c
RCT_EXPORT_METHOD(registerSoup:(NSDictionary *)argsDict 
                      callback:(RCTResponseSenderBlock)callback)
```

**Arguments**:
```objective-c
@{
    @"isGlobalStore": @(BOOL),
    @"storeName": @"customStore" or nil,
    @"soupName": @"accounts",
    @"indexes": @[
        @{ @"path": @"Id", @"type": @"string" },
        @{ @"path": @"Name", @"type": @"string" },
        @{ @"path": @"LastModifiedDate", @"type": @"string" }
    ]
}
```

**Index Types**:
- `"string"` - String index
- `"integer"` - Integer index
- `"floating"` - Floating-point index
- `"full_text"` - Full-text search index
- `"json1"` - JSON1 virtual table

**Implementation**:
```objective-c
// 1. Get store
SFSmartStore *store = [self getStoreInArgsDict:argsDict];

// 2. Convert indexes
NSArray *indexSpecs = [self convertIndexSpecs:argsDict[@"indexes"]];

// 3. Register soup
NSError *error = nil;
BOOL success = [store registerSoup:soupName 
                    withIndexSpecs:indexSpecs 
                             error:&error];

// 4. Return result
if (success) {
    callback(@[[NSNull null], soupName]);
} else {
    callback(@[error, [NSNull null]]);
}
```

**JavaScript Mapping**:
```typescript
smartstore.registerSoup(isGlobalStore, soupName, indexSpecs, success, error);
```

---

#### querySoup:callback:

Queries a soup and returns a cursor.

**Signature**:
```objective-c
RCT_EXPORT_METHOD(querySoup:(NSDictionary *)argsDict 
                  callback:(RCTResponseSenderBlock)callback)
```

**Arguments**:
```objective-c
@{
    @"isGlobalStore": @(BOOL),
    @"storeName": @"customStore" or nil,
    @"soupName": @"accounts",
    @"querySpec": @{
        @"queryType": @"exact" | @"range" | @"like" | @"match",
        @"indexPath": @"Name",
        @"matchKey": @"Acme",  // For exact/match
        @"order": @"ascending" | @"descending",
        @"pageSize": @(10)
    }
}
```

**Query Types**:
- `exact`: Exact match on indexed field
- `range`: Range query (beginKey to endKey)
- `like`: SQL LIKE pattern matching
- `match`: Full-text search

**Implementation**:
```objective-c
// 1. Get store
SFSmartStore *store = [self getStoreInArgsDict:argsDict];

// 2. Build query spec
SFQuerySpec *querySpec = [self buildQuerySpec:argsDict[@"querySpec"]
                                     soupName:soupName];

// 3. Query soup
NSError *error = nil;
SFStoreCursor *cursor = [store querySoup:soupName 
                           withQuerySpec:querySpec 
                                pageIndex:0 
                                   error:&error];

// 4. Convert cursor to dictionary
if (cursor) {
    NSDictionary *cursorDict = [self cursorToDict:cursor];
    callback(@[[NSNull null], cursorDict]);
} else {
    callback(@[error, [NSNull null]]);
}
```

**Cursor Format**:
```objective-c
@{
    @"cursorId": @"<cursor-id>",
    @"totalEntries": @(100),
    @"totalPages": @(10),
    @"currentPageIndex": @(0),
    @"pageSize": @(10),
    @"currentPageOrderedEntries": @[
        @{ @"_soupEntryId": @(1), @"Name": @"Acme", ... },
        @{ @"_soupEntryId": @(2), @"Name": @"Global", ... }
    ]
}
```

**JavaScript Mapping**:
```typescript
smartstore.querySoup(isGlobalStore, soupName, querySpec, success, error);
```

---

#### runSmartQuery:callback:

Executes a Smart SQL query.

**Signature**:
```objective-c
RCT_EXPORT_METHOD(runSmartQuery:(NSDictionary *)argsDict 
                      callback:(RCTResponseSenderBlock)callback)
```

**Arguments**:
```objective-c
@{
    @"isGlobalStore": @(BOOL),
    @"storeName": @"customStore" or nil,
    @"querySpec": @{
        @"queryType": @"smart",
        @"smartSql": @"SELECT {accounts:Name}, COUNT(*) FROM {accounts} GROUP BY {accounts:Industry}",
        @"pageSize": @(50)
    }
}
```

**Smart SQL Syntax**:
- Use `{soupName:path}` for soup fields
- Standard SQL syntax (SELECT, WHERE, JOIN, GROUP BY, etc.)
- Query across multiple soups
- Aggregate functions (COUNT, SUM, AVG, etc.)

**Implementation**:
```objective-c
// 1. Get store
SFSmartStore *store = [self getStoreInArgsDict:argsDict];

// 2. Build smart query spec
SFQuerySpec *querySpec = [SFQuerySpec newSmartQuerySpec:smartSql 
                                               pageSize:pageSize];

// 3. Run query
NSError *error = nil;
SFStoreCursor *cursor = [store querySoup:nil  // No soup name for smart SQL
                           withQuerySpec:querySpec 
                                pageIndex:0 
                                   error:&error];

// 4. Return cursor
callback(@[[NSNull null], [self cursorToDict:cursor]]);
```

**JavaScript Mapping**:
```typescript
smartstore.runSmartQuery(isGlobalStore, querySpec, success, error);
```

---

#### upsertSoupEntries:callback:

Inserts or updates soup entries.

**Signature**:
```objective-c
RCT_EXPORT_METHOD(upsertSoupEntries:(NSDictionary *)argsDict 
                          callback:(RCTResponseSenderBlock)callback)
```

**Arguments**:
```objective-c
@{
    @"isGlobalStore": @(BOOL),
    @"storeName": @"customStore" or nil,
    @"soupName": @"accounts",
    @"entries": @[
        @{ @"Id": @"001xxx1", @"Name": @"Acme" },
        @{ @"Id": @"001xxx2", @"Name": @"Global" }
    ],
    @"externalIdPath": @"_soupEntryId"  // Default
}
```

**External ID**:
- Default: `_soupEntryId` (SmartStore internal ID)
- Custom: Any indexed field (e.g., `Id` for Salesforce ID)

**Implementation**:
```objective-c
// 1. Get store
SFSmartStore *store = [self getStoreInArgsDict:argsDict];

// 2. Upsert entries
NSError *error = nil;
NSArray *savedEntries = [store upsertEntries:entries 
                                      toSoup:soupName 
                             withExternalIdPath:externalIdPath 
                                          error:&error];

// 3. Return saved entries (now have _soupEntryId)
if (savedEntries) {
    callback(@[[NSNull null], savedEntries]);
} else {
    callback(@[error, [NSNull null]]);
}
```

**JavaScript Mapping**:
```typescript
smartstore.upsertSoupEntries(isGlobalStore, soupName, entries, success, error);
smartstore.upsertSoupEntriesWithExternalId(isGlobalStore, soupName, entries, externalIdPath, success, error);
```

---

#### Other SmartStore Methods

All follow similar patterns. Key methods:

- `removeSoup:callback:` - Delete soup
- `soupExists:callback:` - Check if soup exists
- `getSoupIndexSpecs:callback:` - Get soup indexes
- `clearSoup:callback:` - Remove all entries
- `removeFromSoup:callback:` - Delete specific entries
- `retrieveSoupEntries:callback:` - Get entries by IDs
- `moveCursorToPageIndex:callback:` - Navigate cursor
- `closeCursor:callback:` - Close cursor

---

## SFMobileSyncReactBridge

**Header**: `ios/SalesforceReact/SFMobileSyncReactBridge.h`  
**Implementation**: `ios/SalesforceReact/SFMobileSyncReactBridge.m`  
**JavaScript Module**: `mobilesync` (`react.force.mobilesync`)

### Purpose

Bidirectional data synchronization between SmartStore and Salesforce.

### iOS SDK Dependencies

```objective-c
@import MobileSync;

// Key classes used:
- SFMobileSyncManager    // Sync orchestration
- SFSyncDownTarget       // Sync down configuration
- SFSyncUpTarget         // Sync up configuration
- SFSyncState            // Sync status
- SFSyncOptions          // Merge mode, field list
```

### Sync Concepts

**Sync Down**: Download from Salesforce → SmartStore  
**Sync Up**: Upload from SmartStore → Salesforce  
**Merge Modes**:
- `OVERWRITE`: Server data always wins
- `LEAVE_IF_CHANGED`: Keep local changes (mark conflicts)

**Target Types**:
- `soql`: SOQL query
- `sosl`: SOSL search
- `mru`: Most Recently Used list
- `custom`: Custom implementation

### Exported Methods

#### syncDown:callback:

Downloads records from Salesforce to SmartStore.

**Signature**:
```objective-c
RCT_EXPORT_METHOD(syncDown:(NSDictionary *)argsDict 
                  callback:(RCTResponseSenderBlock)callback)
```

**Arguments**:
```objective-c
@{
    @"isGlobalStore": @(BOOL),
    @"storeName": @"customStore" or nil,
    @"target": @{
        @"type": @"soql",
        @"query": @"SELECT Id, Name FROM Account LIMIT 100"
    },
    @"soupName": @"accounts",
    @"options": @{
        @"mergeMode": @"OVERWRITE" | @"LEAVE_IF_CHANGED",
        @"fieldlist": @[@"Id", @"Name"] or nil
    },
    @"syncName": @"accounts-sync" or nil  // Optional
}
```

**Implementation**:
```objective-c
// 1. Get sync manager
SFMobileSyncManager *syncManager = [self getSyncManagerInArgsDict:argsDict];

// 2. Build sync target
SFSyncDownTarget *target = [self buildSyncDownTarget:argsDict[@"target"]];

// 3. Build options
SFSyncOptions *options = [self buildSyncOptions:argsDict[@"options"]];

// 4. Start sync
SFSyncState *syncState = [syncManager syncDownWithTarget:target 
                                                soupName:soupName 
                                                 options:options 
                                                syncName:syncName 
                                                onUpdate:^(SFSyncState *state) {
    // Progress callback (not currently exposed to JS)
}];

// 5. Return initial state
callback(@[[NSNull null], [self syncStateToDict:syncState]]);
```

**Sync State**:
```objective-c
@{
    @"_soupEntryId": @(1),
    @"name": @"accounts-sync",
    @"type": @"syncDown",
    @"target": @{...},
    @"soupName": @"accounts",
    @"options": @{...},
    @"status": @"RUNNING",
    @"progress": @(50),
    @"totalSize": @(100),
    @"maxTimeStamp": @(1234567890),
    @"startTime": @(1234567800),
    @"endTime": @(0)
}
```

**Status Values**:
- `NEW`: Created but not started
- `RUNNING`: In progress
- `DONE`: Completed successfully
- `STOPPED`: Manually stopped
- `FAILED`: Error occurred

**JavaScript Mapping**:
```typescript
mobilesync.syncDown(isGlobalStore, target, soupName, options, success, error);
mobilesync.syncDown(isGlobalStore, target, soupName, options, syncName, success, error);
```

---

#### syncUp:callback:

Uploads local changes from SmartStore to Salesforce.

**Signature**:
```objective-c
RCT_EXPORT_METHOD(syncUp:(NSDictionary *)argsDict 
                callback:(RCTResponseSenderBlock)callback)
```

**Arguments**:
```objective-c
@{
    @"isGlobalStore": @(BOOL),
    @"storeName": @"customStore" or nil,
    @"target": @{
        @"createFieldlist": @[@"Name", @"Industry"],
        @"updateFieldlist": @[@"Name", @"Industry", @"Phone"],
        @"maxBatchSize": @(200)
    },
    @"soupName": @"accounts",
    @"options": @{},
    @"syncName": @"accounts-sync-up" or nil
}
```

**Local Change Tracking**:

SmartStore tracks changes with special fields:
- `__local__`: True for locally created/modified records
- `__locally_created__`: True for new records
- `__locally_updated__`: True for modified records
- `__locally_deleted__`: True for deleted records

**Implementation**:
```objective-c
// 1. Get sync manager
SFMobileSyncManager *syncManager = [self getSyncManagerInArgsDict:argsDict];

// 2. Build sync target
SFSyncUpTarget *target = [self buildSyncUpTarget:argsDict[@"target"]];

// 3. Start sync
SFSyncState *syncState = [syncManager syncUpWithTarget:target 
                                              soupName:soupName 
                                               options:options 
                                              syncName:syncName 
                                              onUpdate:^(SFSyncState *state) {
    // Progress callback
}];

// 4. Return initial state
callback(@[[NSNull null], [self syncStateToDict:syncState]]);
```

**JavaScript Mapping**:
```typescript
mobilesync.syncUp(isGlobalStore, target, soupName, options, success, error);
mobilesync.syncUp(isGlobalStore, target, soupName, options, syncName, success, error);
```

---

#### reSync:callback:

Re-runs a named sync with its previous configuration.

**Implementation**:
```objective-c
// Find sync by name
SFSyncState *syncState = [syncManager getSyncStatus:syncName];

// Re-run sync
SFSyncState *newSyncState = [syncManager reSync:syncState.syncId 
                                       onUpdate:nil];
```

---

#### getSyncStatus:callback:

Gets the current status of a sync.

**Arguments**:
```objective-c
@{
    @"syncId": @(123) or nil,
    @"syncName": @"accounts-sync" or nil
}
```

**Returns**: Sync state dictionary

---

#### cleanResyncGhosts:callback:

Removes "ghost" records (locally deleted but not synced).

**Implementation**:
```objective-c
NSInteger count = [syncManager cleanResyncGhosts:syncId];
callback(@[[NSNull null], @(count)]);
```

---

## SFSDKReactLogger

**Header**: `ios/SalesforceReact/SFSDKReactLogger.h`  
**Implementation**: `ios/SalesforceReact/SFSDKReactLogger.m`

### Purpose

Logging wrapper for SDK bridge.

### Methods

```objective-c
@interface SFSDKReactLogger : NSObject

+ (void)d:(Class)cls format:(NSString *)format, ...;  // Debug
+ (void)i:(Class)cls format:(NSString *)format, ...;  // Info
+ (void)w:(Class)cls format:(NSString *)format, ...;  // Warning
+ (void)e:(Class)cls format:(NSString *)format, ...;  // Error

@end
```

### Usage

```objective-c
#import "SFSDKReactLogger.h"

[SFSDKReactLogger d:[self class] 
             format:@"Method called with args: %@", args];

[SFSDKReactLogger e:[self class] 
             format:@"Error occurred: %@", error];
```

### Implementation

Wraps `SFSDKLogger` from iOS SDK:

```objective-c
+ (void)d:(Class)cls format:(NSString *)format, ... {
    va_list args;
    va_start(args, format);
    NSString *message = [[NSString alloc] initWithFormat:format 
                                               arguments:args];
    va_end(args);
    
    [SFSDKLogger d:cls format:@"[RN] %@", message];
}
```

---

## SalesforceReactSDKManager

**Header**: `ios/SalesforceReact/SalesforceReactSDKManager.h`  
**Implementation**: `ios/SalesforceReact/SalesforceReactSDKManager.m`

### Purpose

SDK initialization and configuration for React Native apps.

### Inheritance

```objective-c
@interface SalesforceReactSDKManager : MobileSyncSDKManager
@end
```

Inherits from:
- `MobileSyncSDKManager` (MobileSync)
  - `SalesforceSDKManager` (Core)
    - `NSObject`

### Configuration

Used in React Native app's `AppDelegate.m`:

```objective-c
#import <SalesforceReact/SalesforceReactSDKManager.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application 
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // Initialize SDK
    [SalesforceReactSDKManager initializeSDK];
    
    // Configure Connected App
    [[SalesforceReactSDKManager sharedManager] 
        setConnectedAppId:@"<your-consumer-key>"];
    [[SalesforceReactSDKManager sharedManager] 
        setConnectedAppCallbackUri:@"<your-redirect-uri>"];
    
    // OAuth scopes
    [[SalesforceReactSDKManager sharedManager] 
        setOAuthScopes:@[@"web", @"api", @"refresh_token"]];
    
    // Launch actions
    [[SalesforceReactSDKManager sharedManager] 
        setLaunchActions:@[ action1, action2 ]];
    
    return YES;
}

@end
```

### Key Properties

From `SalesforceSDKManager`:

- `connectedAppId` - OAuth consumer key
- `connectedAppCallbackUri` - OAuth redirect URI
- `oauthScopes` - OAuth permission scopes
- `authenticateAtLaunch` - Auto-login on app launch
- `postLaunchAction` - Action after successful auth

### Methods

Inherited from `SalesforceSDKManager`:

```objective-c
// Initialization
+ (void)initializeSDK;
+ (instancetype)sharedManager;

// User agent
- (NSString *)userAgentString:(NSString *)qualifier;

// Launch
- (void)launch;

// Notifications
// kSFNotificationUserDidLogout
// kSFNotificationUserWillLogout
// kSFNotificationUserDidLogin
```

---

## Data Type Conversions

### JavaScript → Objective-C

| JavaScript | Objective-C |
|-----------|-------------|
| `{}` (object) | `NSDictionary` |
| `[]` (array) | `NSArray` |
| `"string"` | `NSString` |
| `123` (number) | `NSNumber` |
| `true`/`false` | `@(YES)`/`@(NO)` |
| `null` | `[NSNull null]` |
| `undefined` | `nil` or `[NSNull null]` |

### Objective-C → JavaScript

| Objective-C | JavaScript |
|-------------|-----------|
| `NSDictionary` | `{}` (object) |
| `NSArray` | `[]` (array) |
| `NSString` | `"string"` |
| `NSNumber` | `123` (number) |
| `@(YES)`/`@(NO)` | `true`/`false` |
| `[NSNull null]` | `null` |
| `nil` | `null` or omitted |

### Error Objects

**Objective-C NSError** → **JavaScript Error**:

```objective-c
// Objective-C
NSError *error = [NSError errorWithDomain:@"MyDomain"
                                     code:1001
                                 userInfo:@{
    NSLocalizedDescriptionKey: @"Something went wrong"
}];
callback(@[error, [NSNull null]]);
```

```javascript
// JavaScript
error.message  // "Something went wrong"
error.code     // 1001
error.domain   // "MyDomain"
```

---

## Complete Example

### Creating a New Bridge Method

**1. Add to header** (`SFOauthReactBridge.h`):
```objective-c
@interface SFOauthReactBridge : NSObject <RCTBridgeModule>
@end
```

**2. Implement in .m file** (`SFOauthReactBridge.m`):
```objective-c
RCT_EXPORT_METHOD(getUserInfo:(NSDictionary *)args 
                    callback:(RCTResponseSenderBlock)callback)
{
    [SFSDKReactLogger d:[self class] format:@"getUserInfo called"];
    
    SFUserAccount *user = [SFUserAccountManager sharedInstance].currentUser;
    
    if (user) {
        NSDictionary *userInfo = @{
            @"userName": user.userName ?: [NSNull null],
            @"email": user.email ?: [NSNull null],
            @"firstName": user.idData.firstName ?: [NSNull null],
            @"lastName": user.idData.lastName ?: [NSNull null]
        };
        callback(@[[NSNull null], userInfo]);
    } else {
        NSError *error = [NSError errorWithDomain:@"OAuth"
                                             code:1001
                                         userInfo:@{
            NSLocalizedDescriptionKey: @"No user logged in"
        }];
        callback(@[error, [NSNull null]]);
    }
}
```

**3. Add JavaScript wrapper** (`src/react.force.oauth.ts`):
```typescript
export const getUserInfo = (
  successCB: ExecSuccessCallback<UserInfo>,
  errorCB: ExecErrorCallback
): void => {
  exec(successCB, errorCB, "getUserInfo", {});
};
```

**4. Add TypeScript types** (`src/typings/oauth.ts`):
```typescript
export interface UserInfo {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
}
```

**5. Add tests** (`test/oauth.test.js`):
```javascript
function testGetUserInfo() {
  oauth.getUserInfo(
    (userInfo) => {
      assertEqual('Expected userName', typeof userInfo.userName, 'string');
      testDone();
    },
    testFailed
  );
}

registerTest(testGetUserInfo);
```

---

## Further Reading

- [iOS Implementation Overview](README.md) - Architecture and patterns
- [JavaScript API Reference](../javascript/API_REFERENCE.md) - JavaScript API
- [iOS SDK Documentation](https://forcedotcom.github.io/SalesforceMobileSDK-iOS) - Native iOS SDK
- [Testing Guide](../ios-tests/README.md) - Running tests
