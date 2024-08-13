export interface SDKConsole {
    error(message?: unknown, ...optionalParams: unknown[]): void;
    info(message?: unknown, ...optionalParams: unknown[]): void;
    log(message?: unknown, ...optionalParams: unknown[]): void;
    warn(message?: unknown, ...optionalParams: unknown[]): void;
    debug(message?: unknown, ...optionalParams: unknown[]): void;
}
export declare type ModuleIOSName = "SFOauthReactBridge" | "SFNetReactBridge" | "SFMobileSyncReactBridge" | "SFSmartStoreReactBridge";
export declare type ModuleAndroidName = "SalesforceOauthReactBridge" | "SalesforceNetReactBridge" | "MobileSyncReactBridge" | "SmartStoreReactBridge";
export declare type StoreOrder = "ascending" | "descending" | undefined;
export declare type QuerySpecType = "exact" | "range" | "like" | "smart" | "match";
export declare type LogLevel = "debug" | "info" | "warn" | "error";
export declare type HttpMethod = "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
