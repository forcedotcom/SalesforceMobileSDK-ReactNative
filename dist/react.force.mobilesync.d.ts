import { ExecErrorCallback, ExecSuccessCallback } from "./react.force.common";
import { StoreConfig } from "./react.force.smartstore";
import { SyncDownTarget, SyncEvent, SyncOptions, SyncStatus, SyncUpTarget } from "./typings/mobilesync";
type SyncDownOverload = {
    (storeConfig: StoreConfig | boolean, target: SyncDownTarget, soupName: string, options: SyncOptions, syncName: string, successCB: ExecSuccessCallback<SyncEvent>, errorCB: ExecErrorCallback): void;
    (storeConfig: StoreConfig | boolean, target: SyncDownTarget, soupName: string, options: SyncOptions, successCB: ExecSuccessCallback<SyncEvent>, errorCB: ExecErrorCallback): void;
};
export declare const syncDown: SyncDownOverload;
export declare const reSync: (storeConfig: StoreConfig | boolean, syncIdOrName: string | number, successCB: ExecSuccessCallback<SyncEvent>, errorCB: ExecErrorCallback) => void;
export declare const cleanResyncGhosts: (storeConfig: StoreConfig | boolean, syncId: number, successCB: ExecSuccessCallback<unknown>, errorCB: ExecErrorCallback) => void;
type SyncUpOverload = {
    (storeConfig: StoreConfig | boolean, target: SyncUpTarget, soupName: string, options: SyncOptions, syncName: string, successCB: ExecSuccessCallback<SyncEvent>, errorCB: ExecErrorCallback): void;
    (storeConfig: StoreConfig | boolean, target: SyncUpTarget, soupName: string, options: SyncOptions, successCB: ExecSuccessCallback<SyncEvent>, errorCB: ExecErrorCallback): void;
};
export declare const syncUp: SyncUpOverload;
export declare const getSyncStatus: (storeConfig: StoreConfig | boolean, syncIdOrName: string, successCB: ExecSuccessCallback<SyncStatus>, errorCB: ExecErrorCallback) => void;
export declare const deleteSync: (storeConfig: StoreConfig | boolean, syncIdOrName: string | number, successCB: ExecSuccessCallback<unknown>, errorCB: ExecErrorCallback) => void;
export declare const MERGE_MODE: {
    readonly OVERWRITE: "OVERWRITE";
    readonly LEAVE_IF_CHANGED: "LEAVE_IF_CHANGED";
};
export {};
