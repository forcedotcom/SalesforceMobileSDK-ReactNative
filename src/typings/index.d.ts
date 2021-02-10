export interface SDKConsole {
  error(message?: unknown, ...optionalParams: unknown[]): void;
  info(message?: unknown, ...optionalParams: unknown[]): void;
  log(message?: unknown, ...optionalParams: unknown[]): void;
  warn(message?: unknown, ...optionalParams: unknown[]): void;
  debug(message?: unknown, ...optionalParams: unknown[]): void;
}

export type ModuleIOSName =
  | "SFOauthReactBridge"
  | "SFNetReactBridge"
  | "SFMobileSyncReactBridge"
  | "SFSmartStoreReactBridge";

export type ModuleAndroidName =
  | "SalesforceOauthReactBridge"
  | "SalesforceNetReactBridge"
  | "MobileSyncReactBridge"
  | "SmartStoreReactBridge";

export type StoreOrder = "ascending" | "descending" | undefined;
export type QuerySpecType = "exact" | "range" | "like" | "smart" | "match";
export type LogLevel = "debug" | "info" | "warn" | "error";
export type HttpMethod = "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
