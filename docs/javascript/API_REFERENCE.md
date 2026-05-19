# JavaScript/TypeScript API Reference

Complete API documentation for all Salesforce Mobile SDK for React Native modules.

## Table of Contents

- [OAuth Module](#oauth-module)
- [Net Module](#net-module)
- [SmartStore Module](#smartstore-module)
- [MobileSync Module](#mobilesync-module)
- [ForceUtil Module](#forceutil-module)
- [ForceLog Module](#forcelog-module)
- [ForceCommon Module](#forcecommon-module)

---

## OAuth Module

**Import**: `import { oauth } from 'react-native-force'`

Authentication and user session management.

### Types

#### UserAccount

Defined in `src/typings/oauth.ts`:

```typescript
type UserAccount = {
  accessToken: string;      // OAuth access token
  clientId: string;         // Connected App client ID
  instanceUrl: string;      // Instance URL (e.g., https://na1.salesforce.com)
  loginUrl: string;         // Login server URL (e.g., https://login.salesforce.com)
  orgId: string;            // Salesforce org ID (18-char)
  refreshToken: string;     // OAuth refresh token
  userAgent: string;        // SDK user agent string
  userId: string;           // Salesforce user ID (18-char)
};
```

### Methods

#### authenticate()

Initiates the OAuth 2.0 login flow. Shows the Salesforce login screen and prompts the user to log in.

**Signature**:
```typescript
function authenticate(
  success: (credentials: UserAccount) => void,
  error: (error: Error) => void
): void
```

**Parameters**:
- `success` - Callback invoked with user credentials after successful authentication
- `error` - Callback invoked if authentication fails

**Returns**: void (callbacks provide result)

**Example (callback)**:
```typescript
import { oauth } from 'react-native-force';

oauth.authenticate(
  (credentials) => {
    console.log('Logged in:', credentials.userId);
    console.log('Instance:', credentials.instanceUrl);
  },
  (error) => {
    console.error('Login failed:', error.message);
  }
);
```

**Example (promise)**:
```typescript
import { oauth, forceUtil } from 'react-native-force';

const authenticate = forceUtil.promiser(oauth.authenticate);

try {
  const credentials = await authenticate();
  console.log('Logged in:', credentials.userId);
} catch (error) {
  console.error('Login failed:', error);
}
```

**Use Cases**:
- Force login when user is not authenticated
- Switch to different user
- Re-authenticate after logout

**Notes**:
- Requires Connected App (External Client App) configuration
- Opens system browser or web view for login
- Supports custom login domains and My Domain

---

#### getAuthCredentials()

Retrieves the current user's authentication credentials without triggering login.

**Signature**:
```typescript
function getAuthCredentials(
  success: (credentials: UserAccount) => void,
  error: (error: Error) => void
): void
```

**Parameters**:
- `success` - Callback invoked with current user credentials
- `error` - Callback invoked if no user is authenticated

**Returns**: void (callbacks provide result)

**Example (callback)**:
```typescript
import { oauth } from 'react-native-force';

oauth.getAuthCredentials(
  (credentials) => {
    console.log('Access token:', credentials.accessToken);
    console.log('User ID:', credentials.userId);
    console.log('Org ID:', credentials.orgId);
  },
  (error) => {
    console.error('Not authenticated:', error.message);
    // Trigger login
    oauth.authenticate(successCB, errorCB);
  }
);
```

**Example (promise)**:
```typescript
import { oauth, forceUtil } from 'react-native-force';

const getAuthCredentials = forceUtil.promiser(oauth.getAuthCredentials);

try {
  const credentials = await getAuthCredentials();
  console.log('User:', credentials.userId);
  console.log('Instance:', credentials.instanceUrl);
} catch (error) {
  console.error('Not authenticated');
  // Trigger login
  await forceUtil.promiser(oauth.authenticate)();
}
```

**Use Cases**:
- Check if user is logged in
- Get access token for API calls
- Get instance URL for REST requests
- Display user info in UI

**Notes**:
- Does not trigger login flow
- Fails if no user is authenticated
- Access tokens are automatically refreshed by the SDK

---

#### logout()

Logs out the current user and clears all OAuth tokens.

**Signature**:
```typescript
function logout(
  success: () => void,
  error: (error: Error) => void
): void
```

**Parameters**:
- `success` - Callback invoked after successful logout
- `error` - Callback invoked if logout fails

**Returns**: void (callbacks provide result)

**Example (callback)**:
```typescript
import { oauth } from 'react-native-force';

oauth.logout(
  () => {
    console.log('Logged out successfully');
    // Navigate to login screen
  },
  (error) => {
    console.error('Logout failed:', error.message);
  }
);
```

**Example (promise)**:
```typescript
import { oauth, forceUtil } from 'react-native-force';

const logout = forceUtil.promiser(oauth.logout);

try {
  await logout();
  console.log('Logged out successfully');
  // Navigate to login screen
} catch (error) {
  console.error('Logout failed:', error);
}
```

**Use Cases**:
- Logout button functionality
- Switch user
- Clear session after inactivity

**Notes**:
- Revokes OAuth tokens on Salesforce server
- Clears local token storage
- Triggers app restart/reload in some configurations

---

## Net Module

**Import**: `import { net } from 'react-native-force'`

Salesforce REST API client for making HTTP requests to Salesforce.

### Configuration

#### setApiVersion()

Sets the Salesforce API version to use for all REST requests.

**Signature**:
```typescript
function setApiVersion(version: string): void
```

**Parameters**:
- `version` - API version string (e.g., 'v66.0')

**Example**:
```typescript
import { net } from 'react-native-force';

net.setApiVersion('v66.0');
```

**Default**: `'v66.0'`

#### getApiVersion()

Gets the current Salesforce API version.

**Signature**:
```typescript
function getApiVersion(): string
```

**Returns**: Current API version string

**Example**:
```typescript
import { net } from 'react-native-force';

const version = net.getApiVersion();
console.log('API version:', version); // 'v66.0'
```

### Core Methods

#### sendRequest()

Sends an arbitrary HTTP request to Salesforce.

**Signature**:
```typescript
function sendRequest<T>(
  endPoint: string,
  path: string,
  success: (response: T) => void,
  error: (error: Error) => void,
  method?: HttpMethod,
  payload?: Record<string, unknown> | null,
  headerParams?: Record<string, unknown> | null,
  fileParams?: unknown,
  returnBinary?: boolean,
  doesNotRequireAuthentication?: boolean
): void
```

**Parameters**:
- `endPoint` - Base endpoint (e.g., '/services/data')
- `path` - Request path (e.g., '/v66.0/sobjects/Account')
- `success` - Success callback
- `error` - Error callback
- `method` - HTTP method ('GET', 'POST', 'PUT', 'PATCH', 'DELETE') [default: 'GET']
- `payload` - Request body/query parameters [default: {}]
- `headerParams` - Additional HTTP headers [default: {}]
- `fileParams` - File upload parameters [default: {}]
- `returnBinary` - Return binary data (base64 encoded) [default: false]
- `doesNotRequireAuthentication` - Skip authentication [default: false]

**Example**:
```typescript
import { net, forceUtil } from 'react-native-force';

const sendRequest = forceUtil.promiser(net.sendRequest);

// Custom API call
const response = await sendRequest(
  '/services/apexrest',
  '/MyCustomAPI/process',
  'POST',
  { data: 'value' },
  { 'Content-Type': 'application/json' }
);
```

### Metadata Operations

#### versions()

Lists all available Salesforce API versions.

**Signature**:
```typescript
function versions<T>(
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const versions = forceUtil.promiser(net.versions);
const result = await versions();
console.log('Available versions:', result);
// [{ version: '66.0', label: 'Summer 23', url: '/services/data/v66.0' }, ...]
```

#### resources()

Lists available resources for the configured API version.

**Signature**:
```typescript
function resources<T>(
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const resources = forceUtil.promiser(net.resources);
const result = await resources();
console.log('Available resources:', result);
// { sobjects: '/services/data/v66.0/sobjects/', query: '...', ... }
```

#### describeGlobal()

Lists all available SObjects and their metadata.

**Signature**:
```typescript
function describeGlobal<T>(
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const describeGlobal = forceUtil.promiser(net.describeGlobal);
const result = await describeGlobal();
console.log('SObjects:', result.sobjects.map(obj => obj.name));
// ['Account', 'Contact', 'Opportunity', ...]
```

#### metadata()

Retrieves metadata for a specific SObject.

**Signature**:
```typescript
function metadata<T>(
  objectType: string,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const metadata = forceUtil.promiser(net.metadata);
const meta = await metadata('Account');
console.log('Account metadata:', meta);
// { objectDescribe: {...}, recentItems: [...] }
```

#### describe()

Completely describes an SObject, including all fields and relationships.

**Signature**:
```typescript
function describe<T>(
  objectType: string,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const describe = forceUtil.promiser(net.describe);
const desc = await describe('Account');
console.log('Fields:', desc.fields.map(f => f.name));
console.log('Record types:', desc.recordTypeInfos);
```

#### describeLayout()

Fetches the layout configuration for an SObject and record type.

**Signature**:
```typescript
function describeLayout<T>(
  objectType: string,
  recordTypeId: string,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const describeLayout = forceUtil.promiser(net.describeLayout);
const layout = await describeLayout('Account', '012000000000000AAA');
console.log('Layout sections:', layout.detailLayoutSections);
```

### CRUD Operations

#### create()

Creates a new record.

**Signature**:
```typescript
function create<T>(
  objectType: string,
  fields: Record<string, unknown>,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Parameters**:
- `objectType` - SObject type (e.g., 'Account', 'Contact')
- `fields` - Field values to set
- `success` - Success callback receives `{ id: '001xxx...', success: true, errors: [] }`
- `error` - Error callback

**Example**:
```typescript
const create = forceUtil.promiser(net.create);

const result = await create('Account', {
  Name: 'Acme Corporation',
  Industry: 'Technology',
  AnnualRevenue: 5000000,
  BillingCity: 'San Francisco'
});

console.log('Created account:', result.id);
```

#### retrieve()

Retrieves a record by ID with optional field list.

**Signature (with field list)**:
```typescript
function retrieve<T>(
  objectType: string,
  id: string,
  fieldList: string[],
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Signature (all fields)**:
```typescript
function retrieve<T>(
  objectType: string,
  id: string,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Example (with fields)**:
```typescript
const retrieve = forceUtil.promiser(net.retrieve);

const account = await retrieve(
  'Account',
  '001xx000003DGb2AAG',
  ['Id', 'Name', 'Industry', 'AnnualRevenue']
);

console.log('Account:', account.Name);
```

**Example (all fields)**:
```typescript
const account = await retrieve('Account', '001xx000003DGb2AAG');
console.log('Full account:', account);
```

#### update()

Updates an existing record.

**Signature**:
```typescript
function update<T>(
  objectType: string,
  id: string,
  fields: Record<string, unknown>,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const update = forceUtil.promiser(net.update);

await update('Account', '001xx000003DGb2AAG', {
  Phone: '555-1234',
  Industry: 'Healthcare',
  AnnualRevenue: 7500000
});

console.log('Account updated');
```

#### del()

Deletes a record. (Note: `del` not `delete` because `delete` is a reserved keyword)

**Signature**:
```typescript
function del<T>(
  objectType: string,
  id: string,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const del = forceUtil.promiser(net.del);

await del('Account', '001xx000003DGb2AAG');
console.log('Account deleted');
```

#### upsert()

Creates or updates a record using an external ID field.

**Signature**:
```typescript
function upsert<T>(
  objectType: string,
  externalIdField: string,
  externalId: string,
  fields: Record<string, unknown>,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Parameters**:
- `objectType` - SObject type
- `externalIdField` - External ID field name (e.g., 'ExternalId__c')
- `externalId` - External ID value (creates if empty, updates if exists)
- `fields` - Field values
- `success` - Success callback
- `error` - Error callback

**Example (create)**:
```typescript
const upsert = forceUtil.promiser(net.upsert);

// Create (externalId is empty)
const result = await upsert(
  'Account',
  'ExternalId__c',
  '', // Empty = create
  {
    ExternalId__c: 'EXT-12345',
    Name: 'Acme Corp',
    Industry: 'Technology'
  }
);

console.log('Created:', result.id);
```

**Example (update)**:
```typescript
// Update (externalId exists)
await upsert(
  'Account',
  'ExternalId__c',
  'EXT-12345', // Existing ID = update
  {
    Phone: '555-5678',
    Industry: 'Manufacturing'
  }
);

console.log('Updated account with external ID EXT-12345');
```

### Query Operations

#### query()

Executes a SOQL query.

**Signature**:
```typescript
function query<T>(
  soql: string,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Response Type**:
```typescript
interface QueryResponse<T> {
  totalSize: number;
  done: boolean;
  records: T[];
  nextRecordsUrl?: string;
}
```

**Example**:
```typescript
const query = forceUtil.promiser(net.query);

interface Account {
  Id: string;
  Name: string;
  Industry: string;
  AnnualRevenue: number;
}

interface QueryResult {
  totalSize: number;
  done: boolean;
  records: Account[];
}

const result: QueryResult = await query(
  `SELECT Id, Name, Industry, AnnualRevenue 
   FROM Account 
   WHERE Industry = 'Technology' 
   ORDER BY AnnualRevenue DESC 
   LIMIT 10`
);

console.log(`Found ${result.totalSize} accounts`);
result.records.forEach(account => {
  console.log(`${account.Name}: $${account.AnnualRevenue}`);
});
```

**SOQL Features**:
- Standard SOQL syntax
- Relationship queries (e.g., `Account.Owner.Name`)
- Aggregate functions (COUNT, SUM, AVG, etc.)
- Date literals (TODAY, LAST_N_DAYS:7, etc.)
- Query more than 2000 records using `queryMore()`

#### queryMore()

Retrieves the next page of query results.

**Signature**:
```typescript
function queryMore<T>(
  url: string,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Parameters**:
- `url` - The `nextRecordsUrl` from previous query result

**Example**:
```typescript
const query = forceUtil.promiser(net.query);
const queryMore = forceUtil.promiser(net.queryMore);

// Initial query
let result = await query('SELECT Id, Name FROM Account');
const allRecords = [...result.records];

// Fetch remaining pages
while (!result.done && result.nextRecordsUrl) {
  result = await queryMore(result.nextRecordsUrl);
  allRecords.push(...result.records);
}

console.log(`Total records fetched: ${allRecords.length}`);
```

#### search()

Executes a SOSL (Salesforce Object Search Language) search.

**Signature**:
```typescript
function search<T>(
  sosl: string,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const search = forceUtil.promiser(net.search);

const results = await search(
  `FIND {Acme} 
   IN ALL FIELDS 
   RETURNING Account(Id, Name), Contact(Id, Name, Email)`
);

console.log('Accounts found:', results.searchRecords[0].length);
console.log('Contacts found:', results.searchRecords[1].length);
```

### Collection Operations

Collection operations allow batch processing of multiple records in a single API call.

#### collectionCreate()

Creates up to 2000 records in one request.

**Signature**:
```typescript
function collectionCreate<T>(
  allOrNone: boolean,
  records: Array<Record<string, unknown>>,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Parameters**:
- `allOrNone` - If true, rolls back all records if any fail
- `records` - Array of records with `attributes.type` field

**Example**:
```typescript
const collectionCreate = forceUtil.promiser(net.collectionCreate);

const results = await collectionCreate(
  true, // allOrNone
  [
    { attributes: { type: 'Account' }, Name: 'Account 1', Industry: 'Tech' },
    { attributes: { type: 'Account' }, Name: 'Account 2', Industry: 'Finance' },
    { attributes: { type: 'Contact' }, FirstName: 'John', LastName: 'Doe' }
  ]
);

results.forEach((result, index) => {
  if (result.success) {
    console.log(`Record ${index} created:`, result.id);
  } else {
    console.error(`Record ${index} failed:`, result.errors);
  }
});
```

#### collectionUpdate()

Updates up to 200 records in one request.

**Signature**:
```typescript
function collectionUpdate<T>(
  allOrNone: boolean,
  records: Array<Record<string, unknown>>,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const collectionUpdate = forceUtil.promiser(net.collectionUpdate);

await collectionUpdate(
  false, // Don't roll back all on error
  [
    { attributes: { type: 'Account' }, Id: '001xxx1', Phone: '555-1111' },
    { attributes: { type: 'Account' }, Id: '001xxx2', Phone: '555-2222' }
  ]
);
```

#### collectionUpsert()

Upserts up to 200 records in one request.

**Signature**:
```typescript
function collectionUpsert<T>(
  allOrNone: boolean,
  objectType: string,
  externalIdField: string,
  records: Array<Record<string, unknown>>,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const collectionUpsert = forceUtil.promiser(net.collectionUpsert);

await collectionUpsert(
  true,
  'Account',
  'ExternalId__c',
  [
    { ExternalId__c: 'EXT-001', Name: 'Account 1' },
    { ExternalId__c: 'EXT-002', Name: 'Account 2' }
  ]
);
```

#### collectionRetrieve()

Retrieves up to 2000 records in one request.

**Signature**:
```typescript
function collectionRetrieve<T>(
  objectType: string,
  ids: Array<string>,
  fields: Array<string>,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const collectionRetrieve = forceUtil.promiser(net.collectionRetrieve);

const records = await collectionRetrieve(
  'Account',
  ['001xxx1', '001xxx2', '001xxx3'],
  ['Id', 'Name', 'Industry']
);

records.forEach(record => {
  console.log(`${record.Name}: ${record.Industry}`);
});
```

#### collectionDelete()

Deletes up to 200 records in one request.

**Signature**:
```typescript
function collectionDelete<T>(
  allOrNone: boolean,
  ids: Array<string>,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const collectionDelete = forceUtil.promiser(net.collectionDelete);

await collectionDelete(
  false, // Don't roll back all on error
  ['001xxx1', '001xxx2', '001xxx3']
);

console.log('Records deleted');
```

### File Operations

#### getAttachment()

Downloads an attachment as base64-encoded data.

**Signature**:
```typescript
function getAttachment<T>(
  id: string,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Response**:
```typescript
interface AttachmentResponse {
  encodedBody: string;  // Base64-encoded file content
  contentType: string;  // MIME type
}
```

**Example**:
```typescript
const getAttachment = forceUtil.promiser(net.getAttachment);

const attachment = await getAttachment('00Pxx000000xxxx');
console.log('Content type:', attachment.contentType);

// Decode base64
const binaryData = atob(attachment.encodedBody);
// Use binaryData...
```

---

## SmartStore Module

**Import**: `import { smartstore } from 'react-native-force'`

Encrypted SQLite database for secure on-device storage.

### Key Concepts

- **Soup**: A table/collection in the database
- **Entry**: A JSON document stored in a soup (like a row)
- **Index**: Indexed field for querying (like database indexes)
- **Cursor**: Paginated query results
- **Store**: User-specific or global database

### Types

#### StoreConfig

```typescript
class StoreConfig {
  storeName?: string;      // Named store (optional)
  isGlobalStore?: boolean; // Global vs user-specific
}
```

#### SoupIndexSpec

```typescript
class SoupIndexSpec {
  path: string;  // JSON path to index (e.g., 'Name', 'Account.Owner.Id')
  type: string;  // Index type: 'string', 'integer', 'floating', 'full_text', 'json1'
}
```

**Index Types**:
- `'string'` - String index (default)
- `'integer'` - Integer index for numeric values
- `'floating'` - Floating-point index for decimals
- `'full_text'` - Full-text search index
- `'json1'` - JSON1 virtual table (for complex queries)

#### QuerySpec

```typescript
class QuerySpec {
  queryType: QuerySpecType;      // 'exact', 'range', 'like', 'smart', 'match'
  indexPath?: string;            // Index to query against
  matchKey?: string;             // For 'exact' and 'match' queries
  likeKey?: string;              // For 'like' queries
  beginKey?: string;             // For 'range' queries (start)
  endKey?: string;               // For 'range' queries (end)
  smartSql?: string;             // For 'smart' queries (Smart SQL)
  orderPath?: string;            // Field to order by
  order: StoreOrder;             // 'ascending' or 'descending'
  pageSize: number;              // Results per page [default: 10]
  selectPaths?: string[];        // Fields to return (null = all)
}
```

#### StoreCursor

```typescript
class StoreCursor<T> {
  cursorId?: string;                      // Unique cursor ID
  pageSize: number;                       // Results per page
  totalEntries: number;                   // Total matching entries
  totalPages: number;                     // Total pages
  currentPageIndex: number;               // Current page (0-based)
  currentPageOrderedEntries: T[];         // Current page results
}
```

### Query Builder Functions

#### buildAllQuerySpec()

Creates a query that returns all soup entries.

**Signature**:
```typescript
function buildAllQuerySpec(
  path: string,
  order: StoreOrder,
  pageSize: number,
  selectPaths?: string[]
): QuerySpec
```

**Example**:
```typescript
const querySpec = smartstore.buildAllQuerySpec(
  'Name',        // Order by Name
  'ascending',   // Ascending order
  50,            // 50 results per page
  ['Id', 'Name', 'Industry'] // Only return these fields
);
```

#### buildExactQuerySpec()

Creates a query that matches an exact value.

**Signature**:
```typescript
function buildExactQuerySpec(
  path: string,
  matchKey: string,
  pageSize: number,
  order: StoreOrder,
  orderPath?: string,
  selectPaths?: string[]
): QuerySpec
```

**Example**:
```typescript
const querySpec = smartstore.buildExactQuerySpec(
  'Industry',    // Query against Industry field
  'Technology',  // Exact match
  25,            // 25 results per page
  'ascending',   // Order
  'Name'         // Order by Name field
);
```

#### buildRangeQuerySpec()

Creates a query that matches a range of values.

**Signature**:
```typescript
function buildRangeQuerySpec(
  path: string,
  beginKey: string,
  endKey: string,
  order: StoreOrder,
  pageSize: number,
  orderPath?: string,
  selectPaths?: string[]
): QuerySpec
```

**Example**:
```typescript
// Find accounts with annual revenue between 1M and 10M
const querySpec = smartstore.buildRangeQuerySpec(
  'AnnualRevenue',
  '1000000',  // Begin
  '10000000', // End
  'descending',
  20
);
```

#### buildLikeQuerySpec()

Creates a query using LIKE pattern matching.

**Signature**:
```typescript
function buildLikeQuerySpec(
  path: string,
  likeKey: string,
  order: StoreOrder,
  pageSize: number,
  orderPath?: string,
  selectPaths?: string[]
): QuerySpec
```

**Example**:
```typescript
// Find accounts with 'Corp' in the name
const querySpec = smartstore.buildLikeQuerySpec(
  'Name',
  '%Corp%',  // SQL LIKE pattern
  'ascending',
  10
);
```

#### buildMatchQuerySpec()

Creates a full-text search query.

**Signature**:
```typescript
function buildMatchQuerySpec(
  path: string | null,  // null = search all full-text indexed fields
  matchKey: string,
  order: StoreOrder,
  pageSize: number,
  orderPath?: string,
  selectPaths?: string[]
): QuerySpec
```

**Example**:
```typescript
// Full-text search across all indexed fields
const querySpec = smartstore.buildMatchQuerySpec(
  null,         // Search all full-text fields
  'technology', // Search term
  'ascending',
  20
);
```

#### buildSmartQuerySpec()

Creates a Smart SQL query.

**Signature**:
```typescript
function buildSmartQuerySpec(
  smartSql: string,
  pageSize: number
): QuerySpec
```

**Example**:
```typescript
const querySpec = smartstore.buildSmartQuerySpec(
  `SELECT {accounts:Name}, {accounts:Industry}, COUNT(*) as count
   FROM {accounts}
   WHERE {accounts:Industry} = 'Technology'
   GROUP BY {accounts:Industry}`,
  50
);
```

**Smart SQL Features**:
- Use `{soupName:path}` syntax for soup fields
- Standard SQL operations (JOIN, GROUP BY, HAVING, etc.)
- Query across multiple soups
- Aggregate functions

### Soup Management

#### registerSoup()

Creates a new soup with indexes.

**Signature**:
```typescript
function registerSoup(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  indexSpecs: SoupIndexSpec[],
  success: (soupName: string) => void,
  error: (error: Error) => void
): void
```

**Parameters**:
- `storeConfig` - Store configuration or boolean for isGlobalStore
- `soupName` - Soup name
- `indexSpecs` - Array of index specifications
- `success` - Success callback
- `error` - Error callback

**Example**:
```typescript
const registerSoup = forceUtil.promiser(smartstore.registerSoup);

await registerSoup(
  false, // User-specific store
  'accounts',
  [
    new smartstore.SoupIndexSpec('Id', 'string'),
    new smartstore.SoupIndexSpec('Name', 'string'),
    new smartstore.SoupIndexSpec('Industry', 'string'),
    new smartstore.SoupIndexSpec('AnnualRevenue', 'integer'),
    new smartstore.SoupIndexSpec('LastModifiedDate', 'string'),
    new smartstore.SoupIndexSpec('Description', 'full_text') // Full-text search
  ]
);

console.log('Soup registered');
```

**Notes**:
- Idempotent: safe to call multiple times
- Cannot change indexes after creation (use `alterSoup` instead)
- Index all fields you plan to query

#### removeSoup()

Deletes a soup and all its data.

**Signature**:
```typescript
function removeSoup(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  success: () => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const removeSoup = forceUtil.promiser(smartstore.removeSoup);

await removeSoup(false, 'accounts');
console.log('Soup removed');
```

#### soupExists()

Checks if a soup exists.

**Signature**:
```typescript
function soupExists(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  success: (exists: boolean) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const soupExists = forceUtil.promiser(smartstore.soupExists);

const exists = await soupExists(false, 'accounts');
if (!exists) {
  // Register soup
  await registerSoup(...);
}
```

#### getSoupIndexSpecs()

Retrieves the index specifications for a soup.

**Signature**:
```typescript
function getSoupIndexSpecs(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  success: (specs: SoupIndexSpec[]) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const getSoupIndexSpecs = forceUtil.promiser(smartstore.getSoupIndexSpecs);

const indexes = await getSoupIndexSpecs(false, 'accounts');
indexes.forEach(index => {
  console.log(`${index.path}: ${index.type}`);
});
```

#### alterSoup()

Modifies the indexes on an existing soup.

**Signature**:
```typescript
function alterSoup(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  indexSpecs: SoupIndexSpec[],
  reIndexData: boolean,
  success: (soupName: string) => void,
  error: (error: Error) => void
): void
```

**Parameters**:
- `reIndexData` - If true, re-indexes existing data (slow for large soups)

**Example**:
```typescript
const alterSoup = forceUtil.promiser(smartstore.alterSoup);

// Add a new index
await alterSoup(
  false,
  'accounts',
  [
    new smartstore.SoupIndexSpec('Id', 'string'),
    new smartstore.SoupIndexSpec('Name', 'string'),
    new smartstore.SoupIndexSpec('Phone', 'string') // New index
  ],
  true // Re-index existing data
);
```

#### reIndexSoup()

Re-indexes specific paths in a soup.

**Signature**:
```typescript
function reIndexSoup(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  paths: string,
  success: (soupName: string) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const reIndexSoup = forceUtil.promiser(smartstore.reIndexSoup);

await reIndexSoup(false, 'accounts', 'Name,Industry');
```

#### clearSoup()

Removes all entries from a soup without deleting the soup.

**Signature**:
```typescript
function clearSoup<T>(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  success: (response: T) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const clearSoup = forceUtil.promiser(smartstore.clearSoup);

await clearSoup(false, 'accounts');
console.log('All entries removed from accounts soup');
```

### Entry Operations

#### upsertSoupEntries()

Inserts or updates soup entries.

**Signature**:
```typescript
function upsertSoupEntries<T>(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  entries: Array<{ [key: string]: any }>,
  success: (entries: T) => void,
  error: (error: Error) => void
): void
```

**Parameters**:
- `entries` - Array of objects to upsert. Objects with `_soupEntryId` are updated, others are inserted.

**Example**:
```typescript
const upsertSoupEntries = forceUtil.promiser(smartstore.upsertSoupEntries);

const entries = await upsertSoupEntries(
  false,
  'accounts',
  [
    { Id: '001xxx1', Name: 'Acme Corp', Industry: 'Technology' },
    { Id: '001xxx2', Name: 'Global Inc', Industry: 'Finance' }
  ]
);

// Entries now have _soupEntryId
entries.forEach(entry => {
  console.log(`Saved entry ${entry._soupEntryId}: ${entry.Name}`);
});
```

#### upsertSoupEntriesWithExternalId()

Inserts or updates entries using a custom external ID field.

**Signature**:
```typescript
function upsertSoupEntriesWithExternalId<T>(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  entries: Array<{ [key: string]: any }>,
  externalIdPath: string,
  success: (entries: T) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const upsertWithExtId = forceUtil.promiser(smartstore.upsertSoupEntriesWithExternalId);

await upsertWithExtId(
  false,
  'accounts',
  [
    { Id: '001xxx1', Name: 'Updated Name' }
  ],
  'Id' // Use Salesforce Id as external ID
);
```

#### retrieveSoupEntries()

Retrieves specific soup entries by their soup entry IDs.

**Signature**:
```typescript
function retrieveSoupEntries<T>(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  entryIds: string[],
  success: (entries: T[]) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const retrieveSoupEntries = forceUtil.promiser(smartstore.retrieveSoupEntries);

const entries = await retrieveSoupEntries(
  false,
  'accounts',
  ['1', '2', '3'] // Soup entry IDs
);

entries.forEach(entry => {
  console.log(entry.Name);
});
```

#### removeFromSoup()

Removes entries from a soup.

**Signature (by IDs)**:
```typescript
function removeFromSoup(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  entryIds: string[],
  success: () => void,
  error: (error: Error) => void
): void
```

**Signature (by QuerySpec)**:
```typescript
function removeFromSoup(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  querySpec: QuerySpec,
  success: () => void,
  error: (error: Error) => void
): void
```

**Example (by IDs)**:
```typescript
const removeFromSoup = forceUtil.promiser(smartstore.removeFromSoup);

await removeFromSoup(
  false,
  'accounts',
  ['1', '2', '3']
);
```

**Example (by query)**:
```typescript
const querySpec = smartstore.buildExactQuerySpec('Industry', 'Technology', 100);
await removeFromSoup(false, 'accounts', querySpec);
console.log('Removed all Technology accounts');
```

### Query Operations

#### querySoup()

Queries a soup and returns a cursor.

**Signature**:
```typescript
function querySoup<T>(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  querySpec: QuerySpec,
  success: (cursor: StoreCursor<T>) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const querySoup = forceUtil.promiser(smartstore.querySoup);

interface Account {
  Id: string;
  Name: string;
  Industry: string;
}

const querySpec = smartstore.buildExactQuerySpec('Industry', 'Technology', 20);
const cursor = await querySoup<Account>(false, 'accounts', querySpec);

console.log(`Found ${cursor.totalEntries} technology accounts`);
console.log(`Page ${cursor.currentPageIndex + 1} of ${cursor.totalPages}`);

cursor.currentPageOrderedEntries.forEach(account => {
  console.log(`${account.Name}: ${account.Industry}`);
});
```

#### runSmartQuery()

Executes a Smart SQL query.

**Signature**:
```typescript
function runSmartQuery<T>(
  storeConfig: StoreConfig | boolean,
  querySpec: QuerySpec,
  success: (cursor: StoreCursor<T>) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const runSmartQuery = forceUtil.promiser(smartstore.runSmartQuery);

const querySpec = smartstore.buildSmartQuerySpec(
  `SELECT {accounts:Name}, {accounts:Industry}, {accounts:AnnualRevenue}
   FROM {accounts}
   WHERE {accounts:AnnualRevenue} > 1000000
   ORDER BY {accounts:AnnualRevenue} DESC`,
  50
);

const cursor = await runSmartQuery(false, querySpec);
console.log(`Found ${cursor.totalEntries} high-revenue accounts`);
```

### Cursor Operations

#### moveCursorToPageIndex()

Moves cursor to a specific page.

**Signature**:
```typescript
function moveCursorToPageIndex<T>(
  storeConfig: StoreConfig | boolean,
  cursor: StoreCursor<T>,
  newPageIndex: number,
  success: (cursor: StoreCursor<T>) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const moveCursorToPageIndex = forceUtil.promiser(smartstore.moveCursorToPageIndex);

// Get page 3
const newCursor = await moveCursorToPageIndex(false, cursor, 2); // 0-based
console.log(`Page ${newCursor.currentPageIndex + 1}`);
```

#### moveCursorToNextPage()

Moves cursor to next page.

**Signature**:
```typescript
function moveCursorToNextPage<T>(
  storeConfig: StoreConfig | boolean,
  cursor: StoreCursor<T>,
  success: (cursor: StoreCursor<T>) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const moveCursorToNextPage = forceUtil.promiser(smartstore.moveCursorToNextPage);

if (cursor.currentPageIndex < cursor.totalPages - 1) {
  const nextCursor = await moveCursorToNextPage(false, cursor);
  console.log('Next page:', nextCursor.currentPageOrderedEntries);
}
```

#### moveCursorToPreviousPage()

Moves cursor to previous page.

**Signature**:
```typescript
function moveCursorToPreviousPage<T>(
  storeConfig: StoreConfig | boolean,
  cursor: StoreCursor<T>,
  success: (cursor: StoreCursor<T>) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const moveCursorToPreviousPage = forceUtil.promiser(smartstore.moveCursorToPreviousPage);

if (cursor.currentPageIndex > 0) {
  const prevCursor = await moveCursorToPreviousPage(false, cursor);
  console.log('Previous page:', prevCursor.currentPageOrderedEntries);
}
```

#### closeCursor()

Closes a cursor and releases resources.

**Signature**:
```typescript
function closeCursor<T>(
  storeConfig: StoreConfig | boolean,
  cursor: StoreCursor<T>,
  success: () => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const closeCursor = forceUtil.promiser(smartstore.closeCursor);

await closeCursor(false, cursor);
console.log('Cursor closed');
```

### Store Operations

#### getAllStores()

Lists all user-specific stores.

**Signature**:
```typescript
function getAllStores(
  success: (stores: StoreConfig[]) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const getAllStores = forceUtil.promiser(smartstore.getAllStores);

const stores = await getAllStores();
stores.forEach(store => {
  console.log('Store:', store.storeName || 'default');
});
```

#### getAllGlobalStores()

Lists all global stores.

**Signature**:
```typescript
function getAllGlobalStores(
  success: (stores: StoreConfig[]) => void,
  error: (error: Error) => void
): void
```

#### removeStore()

Removes a store and all its soups.

**Signature**:
```typescript
function removeStore(
  storeConfig: StoreConfig | boolean,
  success: () => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const removeStore = forceUtil.promiser(smartstore.removeStore);

await removeStore({ storeName: 'myStore', isGlobalStore: false });
```

#### removeAllStores()

Removes all user-specific stores.

**Signature**:
```typescript
function removeAllStores(
  success: () => void,
  error: (error: Error) => void
): void
```

#### removeAllGlobalStores()

Removes all global stores.

**Signature**:
```typescript
function removeAllGlobalStores(
  success: () => void,
  error: (error: Error) => void
): void
```

#### getDatabaseSize()

Gets the database size in bytes.

**Signature**:
```typescript
function getDatabaseSize(
  storeConfig: StoreConfig | boolean,
  success: (size: number) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const getDatabaseSize = forceUtil.promiser(smartstore.getDatabaseSize);

const size = await getDatabaseSize(false);
console.log(`Database size: ${(size / 1024 / 1024).toFixed(2)} MB`);
```

---

## MobileSync Module

**Import**: `import { mobilesync } from 'react-native-force'`

Bidirectional data synchronization between SmartStore and Salesforce.

### Types

#### SyncDownTarget

```typescript
interface SyncDownTarget {
  type: 'soql' | 'sosl' | 'mru' | 'custom';
  query: string;                          // SOQL query or SOSL search
  modificationDateFieldName?: string;     // For delta syncs
  iOSImpl?: string;                       // Custom target iOS class
  idFieldName?: string;                   // Custom ID field
}
```

#### SyncUpTarget

```typescript
interface SyncUpTarget {
  createFieldlist?: string[];   // Fields to include in creates
  updateFieldlist?: string[];   // Fields to include in updates
  maxBatchSize?: number;        // Max records per batch [default: 200]
}
```

#### SyncOptions

```typescript
interface SyncOptions {
  mergeMode?: 'OVERWRITE' | 'LEAVE_IF_CHANGED';
  fieldlist?: string[];  // Fields to sync (null = all)
}
```

**Merge Modes**:
- `'OVERWRITE'` - Server data always overwrites local changes
- `'LEAVE_IF_CHANGED'` - Local changes preserved (conflicts marked)

#### SyncEvent

```typescript
interface SyncEvent {
  _soupEntryId: number;
  name: string;
  type: string;
  target: SyncDownTarget;
  soupName: string;
  options: SyncOptions;
  status: 'NEW' | 'STOPPED' | 'RUNNING' | 'DONE' | 'FAILED';
  progress: number;        // 0-100
  totalSize: number;       // Total records
  maxTimeStamp: number;
  startTime: number;
  endTime: number;
  error: string;
  isGlobalStore: boolean;
  storeName: string;
}
```

#### SyncStatus

Same as `SyncEvent`, represents sync status.

### Sync Operations

#### syncDown()

Downloads records from Salesforce to SmartStore.

**Signature (anonymous sync)**:
```typescript
function syncDown(
  storeConfig: StoreConfig | boolean,
  target: SyncDownTarget,
  soupName: string,
  options: SyncOptions,
  success: (sync: SyncEvent) => void,
  error: (error: Error) => void
): void
```

**Signature (named sync)**:
```typescript
function syncDown(
  storeConfig: StoreConfig | boolean,
  target: SyncDownTarget,
  soupName: string,
  options: SyncOptions,
  syncName: string,
  success: (sync: SyncEvent) => void,
  error: (error: Error) => void
): void
```

**Example (SOQL sync)**:
```typescript
const syncDown = forceUtil.promiser(mobilesync.syncDown);

const sync = await syncDown(
  false, // User store
  {
    type: 'soql',
    query: `SELECT Id, Name, Industry, AnnualRevenue, LastModifiedDate 
            FROM Account 
            WHERE LastModifiedDate > LAST_N_DAYS:30`
  },
  'accounts',
  {
    mergeMode: mobilesync.MERGE_MODE.OVERWRITE,
    fieldlist: null // Sync all fields
  },
  'accounts-sync' // Named sync (optional)
);

console.log(`Synced ${sync.totalSize} accounts`);
console.log(`Status: ${sync.status}`);
```

**Example (MRU sync)**:
```typescript
// Sync most recently used records
const sync = await syncDown(
  false,
  {
    type: 'mru',
    sobjectType: 'Account'
  },
  'accounts',
  { mergeMode: 'OVERWRITE' }
);
```

**Example (with progress tracking)**:
```typescript
// Note: Progress callbacks require custom implementation
// since the bridge callback doesn't support progress events directly
const syncDown = forceUtil.promiser(mobilesync.syncDown);

const sync = await syncDown(
  false,
  {
    type: 'soql',
    query: 'SELECT Id, Name FROM Account'
  },
  'accounts',
  { mergeMode: 'OVERWRITE' }
);

// Poll for progress
const getSyncStatus = forceUtil.promiser(mobilesync.getSyncStatus);
while (sync.status === 'RUNNING') {
  const status = await getSyncStatus(false, sync.name);
  console.log(`Progress: ${status.progress}%`);
  await forceUtil.timeoutPromiser(1000);
}
```

#### syncUp()

Uploads local changes from SmartStore to Salesforce.

**Signature (anonymous sync)**:
```typescript
function syncUp(
  storeConfig: StoreConfig | boolean,
  target: SyncUpTarget,
  soupName: string,
  options: SyncOptions,
  success: (sync: SyncEvent) => void,
  error: (error: Error) => void
): void
```

**Signature (named sync)**:
```typescript
function syncUp(
  storeConfig: StoreConfig | boolean,
  target: SyncUpTarget,
  soupName: string,
  options: SyncOptions,
  syncName: string,
  success: (sync: SyncEvent) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const syncUp = forceUtil.promiser(mobilesync.syncUp);

const sync = await syncUp(
  false,
  {
    createFieldlist: ['Name', 'Industry', 'Phone'],
    updateFieldlist: ['Name', 'Industry', 'Phone', 'AnnualRevenue'],
    maxBatchSize: 200
  },
  'accounts',
  {},
  'accounts-sync-up'
);

console.log(`Uploaded ${sync.totalSize} changes`);
```

**Local Change Tracking**:

MobileSync tracks local changes by detecting records with special flags:
- `__local__` - Indicates a locally created record
- `__locally_updated__` - Indicates a locally modified record
- `__locally_deleted__` - Indicates a locally deleted record

**Example (marking records for sync)**:
```typescript
const upsertSoupEntries = forceUtil.promiser(smartstore.upsertSoupEntries);

// Create new record (will be synced up)
await upsertSoupEntries(false, 'accounts', [
  {
    __local__: true,
    __locally_created__: true,
    Name: 'New Account',
    Industry: 'Technology'
  }
]);

// Update existing record (will be synced up)
await upsertSoupEntries(false, 'accounts', [
  {
    Id: '001xxx1',
    __locally_updated__: true,
    Name: 'Updated Name'
  }
]);

// Mark for deletion (will be synced up as deletion)
await upsertSoupEntries(false, 'accounts', [
  {
    Id: '001xxx2',
    __locally_deleted__: true
  }
]);
```

#### reSync()

Re-runs a named sync using its previous configuration.

**Signature**:
```typescript
function reSync(
  storeConfig: StoreConfig | boolean,
  syncIdOrName: string | number,
  success: (sync: SyncEvent) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const reSync = forceUtil.promiser(mobilesync.reSync);

// Re-run by name
await reSync(false, 'accounts-sync');

// Re-run by ID
await reSync(false, 123);
```

#### getSyncStatus()

Gets the current status of a sync.

**Signature**:
```typescript
function getSyncStatus(
  storeConfig: StoreConfig | boolean,
  syncIdOrName: string | number,
  success: (status: SyncStatus) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const getSyncStatus = forceUtil.promiser(mobilesync.getSyncStatus);

const status = await getSyncStatus(false, 'accounts-sync');
console.log(`Status: ${status.status}`);
console.log(`Progress: ${status.progress}%`);
console.log(`Total: ${status.totalSize}`);

if (status.status === 'FAILED') {
  console.error('Error:', status.error);
}
```

#### deleteSync()

Deletes a sync configuration.

**Signature**:
```typescript
function deleteSync(
  storeConfig: StoreConfig | boolean,
  syncIdOrName: string | number,
  success: () => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const deleteSync = forceUtil.promiser(mobilesync.deleteSync);

await deleteSync(false, 'accounts-sync');
console.log('Sync deleted');
```

#### cleanResyncGhosts()

Removes "ghost" records (locally deleted records that were deleted on server).

**Signature**:
```typescript
function cleanResyncGhosts(
  storeConfig: StoreConfig | boolean,
  syncId: number,
  success: (count: number) => void,
  error: (error: Error) => void
): void
```

**Example**:
```typescript
const cleanResyncGhosts = forceUtil.promiser(mobilesync.cleanResyncGhosts);

const count = await cleanResyncGhosts(false, 123);
console.log(`Cleaned ${count} ghost records`);
```

**Use Case**: After a sync down with `LEAVE_IF_CHANGED` merge mode, server-deleted records remain locally. Use this to clean them up.

### Constants

#### MERGE_MODE

```typescript
const MERGE_MODE = {
  OVERWRITE: 'OVERWRITE',
  LEAVE_IF_CHANGED: 'LEAVE_IF_CHANGED'
} as const;
```

**Example**:
```typescript
import { mobilesync } from 'react-native-force';

const sync = await syncDown(
  false,
  target,
  'accounts',
  {
    mergeMode: mobilesync.MERGE_MODE.OVERWRITE
  }
);
```

### Complete Sync Example

```typescript
import { oauth, net, smartstore, mobilesync, forceUtil } from 'react-native-force';

async function syncAccountsExample() {
  // 1. Register soup (if needed)
  const soupExists = await forceUtil.promiser(smartstore.soupExists)(false, 'accounts');
  
  if (!soupExists) {
    await forceUtil.promiser(smartstore.registerSoup)(
      false,
      'accounts',
      [
        new smartstore.SoupIndexSpec('Id', 'string'),
        new smartstore.SoupIndexSpec('Name', 'string'),
        new smartstore.SoupIndexSpec('Industry', 'string'),
        new smartstore.SoupIndexSpec('LastModifiedDate', 'string')
      ]
    );
  }
  
  // 2. Sync down from Salesforce
  const syncDown = await forceUtil.promiser(mobilesync.syncDown)(
    false,
    {
      type: 'soql',
      query: `SELECT Id, Name, Industry, Phone, LastModifiedDate 
              FROM Account 
              WHERE Industry = 'Technology'
              ORDER BY LastModifiedDate DESC
              LIMIT 500`
    },
    'accounts',
    {
      mergeMode: mobilesync.MERGE_MODE.LEAVE_IF_CHANGED
    },
    'accounts-initial-sync'
  );
  
  console.log(`Downloaded ${syncDown.totalSize} accounts`);
  
  // 3. Make local changes
  const entries = await forceUtil.promiser(smartstore.querySoup)(
    false,
    'accounts',
    smartstore.buildAllQuerySpec('Name', 'ascending', 10)
  );
  
  const modifiedEntry = entries.currentPageOrderedEntries[0];
  modifiedEntry.__locally_updated__ = true;
  modifiedEntry.Phone = '555-9999';
  
  await forceUtil.promiser(smartstore.upsertSoupEntries)(
    false,
    'accounts',
    [modifiedEntry]
  );
  
  // 4. Sync up local changes
  const syncUp = await forceUtil.promiser(mobilesync.syncUp)(
    false,
    {
      updateFieldlist: ['Phone']
    },
    'accounts',
    {},
    'accounts-sync-up'
  );
  
  console.log(`Uploaded ${syncUp.totalSize} changes`);
  
  // 5. Re-sync to get latest
  await forceUtil.promiser(mobilesync.reSync)(false, 'accounts-initial-sync');
  console.log('Re-sync complete');
}
```

---

## ForceUtil Module

**Import**: `import { forceUtil } from 'react-native-force'`

Utilities for promise conversion and timing.

### Methods

#### promiser()

Converts a callback-based function to a promise-returning function.

**Signature**:
```typescript
function promiser(func: Function): (...args: any[]) => Promise<any>
```

**Example**:
```typescript
import { oauth, net, smartstore, forceUtil } from 'react-native-force';

// Create promise wrappers
const getAuth = forceUtil.promiser(oauth.getAuthCredentials);
const query = forceUtil.promiser(net.query);
const querySoup = forceUtil.promiser(smartstore.querySoup);

// Use with async/await
const credentials = await getAuth();
const accounts = await query('SELECT Id, Name FROM Account');
const cursor = await querySoup(false, 'accounts', querySpec);
```

#### promiserNoRejection()

Converts a callback-based function to a promise that never rejects.

**Signature**:
```typescript
function promiserNoRejection(func: Function): (...args: any[]) => Promise<any>
```

**Use Case**: When you want to handle both success and error in `.then()` rather than `.catch()`.

**Example**:
```typescript
const logout = forceUtil.promiserNoRejection(oauth.logout);

const result = await logout();
// Result contains either success or error response
```

#### timeoutPromiser()

Creates a promise that resolves after a specified delay.

**Signature**:
```typescript
function timeoutPromiser(millis: number): Promise<void>
```

**Example**:
```typescript
// Wait 2 seconds
await forceUtil.timeoutPromiser(2000);
console.log('2 seconds elapsed');

// Timeout pattern
const query = forceUtil.promiser(net.query);

try {
  const result = await Promise.race([
    query('SELECT Id FROM Account'),
    forceUtil.timeoutPromiser(10000).then(() => {
      throw new Error('Query timeout after 10 seconds');
    })
  ]);
} catch (error) {
  console.error(error);
}
```

---

## ForceLog Module

**Import**: `import { forceLog } from 'react-native-force'`

Logging configuration and console wrapper.

### Methods

#### setLogLevel()

Sets the SDK log level.

**Signature**:
```typescript
function setLogLevel(level: LogLevel): void
```

**Log Levels**:
- `'debug'` - All logs (verbose)
- `'info'` - Info, warn, error
- `'warn'` - Warn and error only
- `'error'` - Error only

**Example**:
```typescript
import { forceLog } from 'react-native-force';

// Development
forceLog.setLogLevel('debug');

// Production
forceLog.setLogLevel('error');
```

#### getLogLevel()

Gets the current log level.

**Signature**:
```typescript
function getLogLevel(): string
```

**Example**:
```typescript
const level = forceLog.getLogLevel();
console.log('Current log level:', level);
```

### SDK Console

#### sdkConsole

Wrapped console object for SDK logging.

**Interface**:
```typescript
interface SDKConsole {
  debug(message?: unknown, ...optionalParams: unknown[]): void;
  info(message?: unknown, ...optionalParams: unknown[]): void;
  warn(message?: unknown, ...optionalParams: unknown[]): void;
  error(message?: unknown, ...optionalParams: unknown[]): void;
  log(message?: unknown, ...optionalParams: unknown[]): void;
}
```

**Example**:
```typescript
import { forceLog } from 'react-native-force';

const { sdkConsole } = forceLog;

sdkConsole.debug('Debug message');
sdkConsole.info('Info message');
sdkConsole.warn('Warning message');
sdkConsole.error('Error message');
sdkConsole.log('Always logged');
```

**Notes**:
- `warn` and `error` use `console.log` instead of `console.warn`/`console.error` to avoid yellow/red boxes in React Native
- `log` is always enabled regardless of log level

---

## Internal: react.force.common

`react.force.common` is **not exported from `react-native-force`**. It is an internal helper module used by the public modules (oauth, net, smartstore, etc.) to dispatch calls to the right native bridge module.

It exports `exec()`, `safeJSONparse()`, and the `ExecSuccessCallback<T>` / `ExecErrorCallback` types but applications should use the higher-level public modules instead.

---

## Complete Examples

### Authentication Flow

```typescript
import { oauth, forceUtil } from 'react-native-force';

const getAuth = forceUtil.promiser(oauth.getAuthCredentials);
const authenticate = forceUtil.promiser(oauth.authenticate);
const logout = forceUtil.promiser(oauth.logout);

async function checkAuth() {
  try {
    const credentials = await getAuth();
    console.log('Logged in as:', credentials.userId);
    return credentials;
  } catch (error) {
    console.log('Not authenticated, prompting login');
    return await authenticate();
  }
}

async function logoutUser() {
  await logout();
  console.log('Logged out');
}
```

### CRUD Operations

```typescript
import { net, forceUtil } from 'react-native-force';

const create = forceUtil.promiser(net.create);
const retrieve = forceUtil.promiser(net.retrieve);
const update = forceUtil.promiser(net.update);
const del = forceUtil.promiser(net.del);
const query = forceUtil.promiser(net.query);

async function crudExample() {
  // Create
  const newAccount = await create('Account', {
    Name: 'Acme Corp',
    Industry: 'Technology',
    AnnualRevenue: 5000000
  });
  console.log('Created:', newAccount.id);
  
  // Retrieve
  const account = await retrieve('Account', newAccount.id, [
    'Id', 'Name', 'Industry'
  ]);
  console.log('Retrieved:', account.Name);
  
  // Update
  await update('Account', newAccount.id, {
    Phone: '555-1234'
  });
  console.log('Updated');
  
  // Query
  const results = await query(
    `SELECT Id, Name FROM Account WHERE Id = '${newAccount.id}'`
  );
  console.log('Query results:', results.records);
  
  // Delete
  await del('Account', newAccount.id);
  console.log('Deleted');
}
```

### SmartStore with Offline Support

```typescript
import { net, smartstore, forceUtil } from 'react-native-force';
import NetInfo from '@react-native-community/netinfo';

const query = forceUtil.promiser(net.query);
const registerSoup = forceUtil.promiser(smartstore.registerSoup);
const soupExists = forceUtil.promiser(smartstore.soupExists);
const upsertSoupEntries = forceUtil.promiser(smartstore.upsertSoupEntries);
const querySoup = forceUtil.promiser(smartstore.querySoup);

async function getAccounts() {
  // Ensure soup exists
  const exists = await soupExists(false, 'accounts');
  if (!exists) {
    await registerSoup(false, 'accounts', [
      new smartstore.SoupIndexSpec('Id', 'string'),
      new smartstore.SoupIndexSpec('Name', 'string'),
      new smartstore.SoupIndexSpec('Industry', 'string')
    ]);
  }
  
  // Check network
  const netInfo = await NetInfo.fetch();
  
  if (netInfo.isConnected) {
    // Online: fetch from Salesforce
    const result = await query(
      'SELECT Id, Name, Industry FROM Account LIMIT 100'
    );
    
    // Cache in SmartStore
    await upsertSoupEntries(false, 'accounts', result.records);
    
    return result.records;
  } else {
    // Offline: read from SmartStore
    const querySpec = smartstore.buildAllQuerySpec('Name', 'ascending', 100);
    const cursor = await querySoup(false, 'accounts', querySpec);
    return cursor.currentPageOrderedEntries;
  }
}
```

### Full Sync Example

```typescript
import { smartstore, mobilesync, forceUtil } from 'react-native-force';

const registerSoup = forceUtil.promiser(smartstore.registerSoup);
const syncDown = forceUtil.promiser(mobilesync.syncDown);
const syncUp = forceUtil.promiser(mobilesync.syncUp);
const querySoup = forceUtil.promiser(smartstore.querySoup);
const upsertSoupEntries = forceUtil.promiser(smartstore.upsertSoupEntries);

async function fullSyncExample() {
  // 1. Setup
  await registerSoup(false, 'accounts', [
    new smartstore.SoupIndexSpec('Id', 'string'),
    new smartstore.SoupIndexSpec('Name', 'string'),
    new smartstore.SoupIndexSpec('Industry', 'string'),
    new smartstore.SoupIndexSpec('LastModifiedDate', 'string')
  ]);
  
  // 2. Initial sync down
  const syncDownResult = await syncDown(
    false,
    {
      type: 'soql',
      query: 'SELECT Id, Name, Industry, LastModifiedDate FROM Account LIMIT 500'
    },
    'accounts',
    { mergeMode: mobilesync.MERGE_MODE.LEAVE_IF_CHANGED },
    'accounts-sync'
  );
  
  console.log(`Downloaded ${syncDownResult.totalSize} accounts`);
  
  // 3. Make local changes
  const querySpec = smartstore.buildExactQuerySpec('Industry', 'Technology', 10);
  const cursor = await querySoup(false, 'accounts', querySpec);
  
  const modifiedRecords = cursor.currentPageOrderedEntries.map(record => ({
    ...record,
    __locally_updated__: true,
    Phone: '555-UPDATED'
  }));
  
  await upsertSoupEntries(false, 'accounts', modifiedRecords);
  
  // 4. Sync up changes
  const syncUpResult = await syncUp(
    false,
    { updateFieldlist: ['Phone'] },
    'accounts',
    {},
    'accounts-sync-up'
  );
  
  console.log(`Uploaded ${syncUpResult.totalSize} changes`);
}
```

---

## Error Handling Patterns

### Network Errors

```typescript
try {
  const result = await query('SELECT Id FROM Account');
} catch (error) {
  if (error.status === 401) {
    // Unauthorized - token expired (SDK auto-refreshes)
  } else if (error.status === 404) {
    // Not found
  } else if (error.status >= 500) {
    // Server error
  } else {
    // Other error
  }
}
```

### SmartStore Errors

```typescript
try {
  await registerSoup(false, 'accounts', indexes);
} catch (error) {
  if (error.message.includes('already exists')) {
    // Soup already registered
  } else {
    // Other error
  }
}
```

### Sync Errors

```typescript
const getSyncStatus = forceUtil.promiser(mobilesync.getSyncStatus);

const status = await getSyncStatus(false, 'my-sync');
if (status.status === 'FAILED') {
  console.error('Sync failed:', status.error);
  // Handle error or retry
}
```

---

## Further Reading

- [Module Overview](README.md) - Overview of all modules
- [Architecture](../ARCHITECTURE.md) - Understanding the bridge pattern
- [iOS Implementation](../ios/README.md) - iOS bridge details
- [Main README](../../README.md) - Getting started
