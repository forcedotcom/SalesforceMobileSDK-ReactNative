export declare type SyncMethod = "cleanResyncGhosts" | "deleteSync" | "getSyncStatus" | "reSync" | "syncDown" | "syncUp";
export interface SyncEvent {
    soupName: string;
    options: SyncOptions;
    isGlobalStore: boolean;
    error: string;
    maxTimeStamp: number;
    _soupEntryId: number;
    type: string;
    progress: number;
    endTime: number;
    target: SyncDownTarget;
    totalSize: number;
    storeName: string;
    startTime: number;
    status: "NEW" | "STOPPED" | "RUNNING" | "DONE" | "FAILED";
    name: string;
}
export declare type SyncDownTarget = {
    type: "soql" | "sosl" | "mru" | "custom";
    query: string;
    modificationDateFieldName?: string;
    iOSImpl?: string;
    idFieldName?: string;
};
export declare type SyncUpTarget = {
    createFieldlist?: string[];
    maxBatchSize?: number;
    updateFieldlist?: string[];
};
export declare type SyncOptions = {
    mergeMode?: "OVERWRITE" | "LEAVE_IF_CHANGED";
    fieldlist?: string[];
};
export interface SyncStatus {
    _soupEntryId: number;
    endTime: number;
    error: string;
    maxTimeStamp: number;
    name: string;
    options: SyncOptions;
    progress: number;
    soupName: string;
    startTime: number;
    status: "NEW" | "STOPPED" | "RUNNING" | "DONE" | "FAILED";
    target: SyncDownTarget;
    totalSize: number;
    type: string;
}
