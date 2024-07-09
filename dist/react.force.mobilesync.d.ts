import { ExecErrorCallback, ExecSuccessCallback } from "./react.force.common";
import { StoreConfig } from "./react.force.smartstore";
import { SyncDownTarget, SyncEvent, SyncOptions, SyncStatus } from "./typings/mobilesync";
type SyncDownOverload = {
    (storeConfig: StoreConfig | boolean, target: SyncDownTarget, soupName: string, options: SyncOptions, syncName: string, successCB: ExecSuccessCallback<SyncEvent>, errorCB: ExecErrorCallback): void;
    (storeConfig: StoreConfig | boolean, target: SyncDownTarget, soupName: string, options: SyncOptions, successCB: ExecSuccessCallback<SyncEvent>, errorCB: ExecErrorCallback): void;
};
export declare const syncDown: SyncDownOverload;
export declare const reSync: (storeConfig: StoreConfig | boolean, syncIdOrName: string, successCB: ExecSuccessCallback<SyncEvent>, errorCB: ExecErrorCallback) => void;
export declare const cleanResyncGhosts: (storeConfig: StoreConfig | boolean, syncId: string, successCB: ExecSuccessCallback<unknown>, errorCB: ExecErrorCallback) => void;
type SyncUpOverload = {
    (storeConfig: StoreConfig | boolean, target: SyncDownTarget, soupName: string, options: SyncOptions, syncName: string, successCB: ExecSuccessCallback<SyncEvent>, errorCB: ExecErrorCallback): void;
    (storeConfig: StoreConfig | boolean, target: SyncDownTarget, soupName: string, options: SyncOptions, successCB: ExecSuccessCallback<SyncEvent>, errorCB: ExecErrorCallback): void;
};
export declare const syncUp: SyncUpOverload;
export declare const getSyncStatus: (storeConfig: StoreConfig | boolean, syncIdOrName: string, successCB: ExecSuccessCallback<SyncStatus>, errorCB: ExecErrorCallback) => void;
export declare const deleteSync: (storeConfig: StoreConfig | boolean, syncIdOrName: string, successCB: ExecSuccessCallback<unknown>, errorCB: ExecErrorCallback) => void;
export declare const MERGE_MODE: {
    OVERWRITE: string;
    LEAVE_IF_CHANGED: string;
};
export {};
