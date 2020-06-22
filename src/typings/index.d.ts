export interface SDKConsole {
  error(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  log(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  debug(message?: any, ...optionalParams: any[]): void;
}

export type ModuleIOSName =
  | "SFOauthReactBridge"
  | "SFNetReactBridge"
  | "SFMobileSyncReactBridge";

export type ModuleAndroidName =
  | "SalesforceOauthReactBridge"
  | "SalesforceNetReactBridge"
  | "MobileSyncReactBridge";

export type StoreOrder = "ascending" | "descending" | undefined;
export type QuerySpecType = "exact" | "range" | "like" | "smart" | "match";
export type LogLevel = "debug" | "info" | "warn" | "error";
export type HttpMethod = "POST" | "GET" | "PUT" | "PATCH" | "DELETE";

export interface SyncDownTarget {
  type: "soql" | "sosl" | "mru" | "custom";
  query: string;
  modificationDateFieldName?: string;
  iOSImpl?: string;
  idFieldName?: string;
}

export interface SyncDownOptions {
  mergeMode?: "OVERWRITE" | "LEAVE_IF_CHANGED";
  fieldlist?: Array<string>;
}
