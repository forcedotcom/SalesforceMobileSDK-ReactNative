import { ExecErrorCallback, ExecSuccessCallback } from "./react.force.common";
import { QuerySpecType, StoreOrder } from "./typings";
export declare class StoreConfig {
    storeName?: string;
    isGlobalStore?: boolean;
    constructor(storeName: string, isGlobalStore: boolean);
}
export declare class SoupIndexSpec {
    path: string;
    type: string;
    constructor(path: string, type: string);
}
export declare class QuerySpec {
    queryType: QuerySpecType;
    indexPath?: string;
    matchKey?: string;
    likeKey?: string;
    beginKey?: string;
    endKey?: string;
    smartSql?: string;
    orderPath?: string;
    order: StoreOrder;
    pageSize: number;
    selectPaths?: string[];
    constructor(path?: string);
}
export declare class StoreCursor<T> {
    cursorId?: string;
    pageSize: number;
    totalEntries: number;
    totalPages: number;
    currentPageIndex: number;
    currentPageOrderedEntries: T[];
    constructor();
}
export declare const buildAllQuerySpec: (path: string, order: StoreOrder, pageSize: number, selectPaths?: string[]) => QuerySpec;
export declare const buildExactQuerySpec: (path: string, matchKey: string, pageSize: number, order: StoreOrder, orderPath?: string, selectPaths?: string[]) => QuerySpec;
export declare const buildRangeQuerySpec: (path: string, beginKey: string, endKey: string, order: StoreOrder, pageSize: number, orderPath?: string, selectPaths?: string[]) => QuerySpec;
export declare const buildLikeQuerySpec: (path: string, likeKey: string, order: StoreOrder, pageSize: number, orderPath?: string, selectPaths?: string[]) => QuerySpec;
export declare const buildMatchQuerySpec: (path: string, matchKey: string, order: StoreOrder, pageSize: number, orderPath?: string, selectPaths?: string[]) => QuerySpec;
export declare const buildSmartQuerySpec: (smartSql: string, pageSize: number) => QuerySpec;
export declare const getDatabaseSize: (storeConfig: StoreConfig | boolean, successCB: ExecSuccessCallback<number>, errorCB: ExecErrorCallback) => void;
export declare const registerSoup: (storeConfig: StoreConfig | boolean, soupName: string, indexSpecs: SoupIndexSpec[], successCB: ExecSuccessCallback<string>, errorCB: ExecErrorCallback) => void;
export declare const removeSoup: (storeConfig: StoreConfig | boolean, soupName: string, successCB: ExecSuccessCallback<"OK">, errorCB: ExecErrorCallback) => void;
export declare const getSoupIndexSpecs: (storeConfig: StoreConfig | boolean, soupName: string, successCB: ExecSuccessCallback<SoupIndexSpec[]>, errorCB: ExecErrorCallback) => void;
export declare const alterSoup: (storeConfig: StoreConfig | boolean, soupName: string, indexSpecs: SoupIndexSpec[], reIndexData: boolean, successCB: ExecSuccessCallback<string>, errorCB: ExecErrorCallback) => void;
export declare const reIndexSoup: (storeConfig: StoreConfig | boolean, soupName: string, paths: string, successCB: ExecSuccessCallback<string>, errorCB: ExecErrorCallback) => void;
export declare const clearSoup: <T>(storeConfig: StoreConfig | boolean, soupName: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
export declare const soupExists: (storeConfig: StoreConfig | boolean, soupName: string, successCB: ExecSuccessCallback<boolean>, errorCB: ExecErrorCallback) => void;
export declare const querySoup: <T>(storeConfig: StoreConfig | boolean, soupName: string, querySpec: QuerySpec, successCB: ExecSuccessCallback<StoreCursor<T>>, errorCB: ExecErrorCallback) => void;
export declare const runSmartQuery: <T>(storeConfig: StoreConfig | boolean, querySpec: QuerySpec, successCB: ExecSuccessCallback<StoreCursor<T>>, errorCB: ExecErrorCallback) => void;
export declare const retrieveSoupEntries: <T>(storeConfig: StoreConfig | boolean, soupName: string, entryIds: string[], successCB: ExecSuccessCallback<StoreCursor<T>>, errorCB: ExecErrorCallback) => void;
export declare const upsertSoupEntries: <T>(storeConfig: StoreConfig | boolean, soupName: string, entries: {
    [key: string]: any;
}[], successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
export declare let upsertSoupEntriesWithExternalId: <T>(storeConfig: StoreConfig | boolean, soupName: string, entries: {
    [key: string]: any;
}[], externalIdPath: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
export declare const removeFromSoup: (storeConfig: StoreConfig | boolean, soupName: string, entryIdsOrQuerySpec: string[], successCB: ExecSuccessCallback<"OK">, errorCB: ExecErrorCallback) => void;
export declare const moveCursorToPageIndex: <T>(storeConfig: StoreConfig | boolean, cursor: StoreCursor<T>, newPageIndex: number, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
export declare const moveCursorToNextPage: <T>(storeConfig: StoreConfig | boolean, cursor: StoreCursor<T>, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
export declare const moveCursorToPreviousPage: <T>(storeConfig: StoreConfig | boolean, cursor: StoreCursor<T>, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
export declare const closeCursor: <T>(storeConfig: StoreConfig | boolean, cursor: StoreCursor<T>, successCB: ExecSuccessCallback<"OK">, errorCB: ExecErrorCallback) => void;
export declare const getAllStores: (successCB: ExecSuccessCallback<StoreConfig[]>, errorCB: ExecErrorCallback) => void;
export declare const getAllGlobalStores: (successCB: ExecSuccessCallback<StoreConfig[]>, errorCB: ExecErrorCallback) => void;
export declare const removeStore: (storeConfig: StoreConfig | boolean, successCB: ExecSuccessCallback<"OK">, errorCB: ExecErrorCallback) => void;
export declare const removeAllGlobalStores: (successCB: ExecSuccessCallback<"OK">, errorCB: ExecErrorCallback) => void;
export declare const removeAllStores: (successCB: ExecSuccessCallback<"OK">, errorCB: ExecErrorCallback) => void;
