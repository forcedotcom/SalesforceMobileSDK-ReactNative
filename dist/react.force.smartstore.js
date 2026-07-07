"use strict";
/*
 * Copyright (c) 2015-present, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAllStores = exports.removeAllGlobalStores = exports.removeStore = exports.getAllGlobalStores = exports.getAllStores = exports.closeCursor = exports.moveCursorToPreviousPage = exports.moveCursorToNextPage = exports.moveCursorToPageIndex = exports.removeFromSoup = exports.upsertSoupEntriesWithExternalId = exports.upsertSoupEntries = exports.retrieveSoupEntries = exports.runSmartQuery = exports.querySoup = exports.soupExists = exports.clearSoup = exports.reIndexSoup = exports.alterSoup = exports.getSoupIndexSpecs = exports.removeSoup = exports.registerSoup = exports.getDatabaseSize = exports.buildSmartQuerySpec = exports.buildMatchQuerySpec = exports.buildLikeQuerySpec = exports.buildRangeQuerySpec = exports.buildExactQuerySpec = exports.buildAllQuerySpec = exports.StoreCursor = exports.QuerySpec = exports.SoupIndexSpec = exports.StoreConfig = void 0;
const react_native_1 = require("react-native");
const react_force_common_1 = require("./react.force.common");
// New architecture: TurboModuleRegistry first, fall back to NativeModules.
// Lazy lookup - bridgeless mode doesn't have modules ready at import time.
const getSFSmartStoreReactBridge = () => react_native_1.TurboModuleRegistry.get("SFSmartStoreReactBridge") ?? react_native_1.NativeModules.SFSmartStoreReactBridge;
const getSmartStoreReactBridge = () => react_native_1.TurboModuleRegistry.get("SmartStoreReactBridge") ?? react_native_1.NativeModules.SmartStoreReactBridge;
const exec = (successCB, errorCB, methodName, args) => {
    (0, react_force_common_1.exec)("SFSmartStoreReactBridge", "SmartStoreReactBridge", getSFSmartStoreReactBridge(), getSmartStoreReactBridge(), successCB, errorCB, methodName, args);
};
/**
 * StoreConfig class
 */
class StoreConfig {
    storeName;
    isGlobalStore;
    constructor(storeName, isGlobalStore) {
        this.storeName = storeName;
        this.isGlobalStore = isGlobalStore;
    }
}
exports.StoreConfig = StoreConfig;
/**
 * SoupIndexSpec class
 */
class SoupIndexSpec {
    path;
    type;
    constructor(path, type) {
        this.path = path;
        this.type = type;
    }
}
exports.SoupIndexSpec = SoupIndexSpec;
/**
 * QuerySpec class
 */
class QuerySpec {
    // the kind of query, one of: "exact","range", "like" or "smart":
    // "exact" uses matchKey, "range" uses beginKey and endKey, "like" uses likeKey, "smart" uses smartSql
    queryType = "exact";
    // path for the original IndexSpec you wish to use for search: may be a compound path eg Account.Owner.Name
    indexPath;
    // for queryType "exact" and "match"
    matchKey;
    // for queryType "like"
    likeKey;
    // for queryType "range"
    // the value at which query results may begin
    beginKey;
    // the value at which query results may end
    endKey;
    // for queryType "smart"
    smartSql;
    // path to sort by : optional
    orderPath;
    // "ascending" or "descending" : optional
    order = "ascending";
    // the number of entries to copy from native to javascript per each cursor page
    pageSize = 10;
    // selectPaths - null means return soup elements
    selectPaths;
    constructor(path) {
        this.indexPath = path;
    }
}
exports.QuerySpec = QuerySpec;
/**
 * StoreCursor class
 */
class StoreCursor {
    // a unique identifier for this cursor, used by plugin
    cursorId;
    // the maximum number of entries returned per page
    pageSize = 0;
    // the total number of results
    totalEntries = 0;
    // the total number of pages of results available
    totalPages = 0;
    // the current page index among all the pages available
    currentPageIndex = 0;
    // the list of current page entries, ordered as requested in the querySpec
    currentPageOrderedEntries = [];
    constructor() { }
}
exports.StoreCursor = StoreCursor;
// ====== querySpec factory methods
// Returns a query spec that will page through all soup entries in order by the given path value
// Internally it simply does a range query with null begin and end keys
const buildAllQuerySpec = (path, order, pageSize, selectPaths) => {
    const inst = new QuerySpec(path);
    inst.queryType = "range";
    inst.orderPath = path;
    if (order) {
        inst.order = order;
    } // override default only if a value was specified
    if (pageSize) {
        inst.pageSize = pageSize;
    } // override default only if a value was specified
    if (selectPaths) {
        inst.selectPaths = selectPaths;
    }
    return inst;
};
exports.buildAllQuerySpec = buildAllQuerySpec;
// Returns a query spec that will page all entries exactly matching the matchKey value for path
const buildExactQuerySpec = (path, matchKey, pageSize, order, orderPath, selectPaths) => {
    const inst = new QuerySpec(path);
    inst.matchKey = matchKey;
    if (pageSize) {
        inst.pageSize = pageSize;
    } // override default only if a value was specified
    if (order) {
        inst.order = order;
    } // override default only if a value was specified
    inst.orderPath = orderPath ? orderPath : path;
    if (selectPaths) {
        inst.selectPaths = selectPaths;
    }
    return inst;
};
exports.buildExactQuerySpec = buildExactQuerySpec;
// Returns a query spec that will page all entries in the range beginKey ...endKey for path
const buildRangeQuerySpec = (path, beginKey, endKey, order, pageSize, orderPath, selectPaths) => {
    const inst = new QuerySpec(path);
    inst.queryType = "range";
    inst.beginKey = beginKey;
    inst.endKey = endKey;
    if (order) {
        inst.order = order;
    } // override default only if a value was specified
    if (pageSize) {
        inst.pageSize = pageSize;
    } // override default only if a value was specified
    inst.orderPath = orderPath ? orderPath : path;
    if (selectPaths) {
        inst.selectPaths = selectPaths;
    }
    return inst;
};
exports.buildRangeQuerySpec = buildRangeQuerySpec;
// Returns a query spec that will page all entries matching the given likeKey value for path
const buildLikeQuerySpec = (path, likeKey, order, pageSize, orderPath, selectPaths) => {
    const inst = new QuerySpec(path);
    inst.queryType = "like";
    inst.likeKey = likeKey;
    if (order) {
        inst.order = order;
    } // override default only if a value was specified
    if (pageSize) {
        inst.pageSize = pageSize;
    } // override default only if a value was specified
    inst.orderPath = orderPath ? orderPath : path;
    if (selectPaths) {
        inst.selectPaths = selectPaths;
    }
    return inst;
};
exports.buildLikeQuerySpec = buildLikeQuerySpec;
// Returns a query spec that will page all entries matching the given full-text search matchKey value for path
// Pass null for path to match matchKey across all full-text indexed fields
const buildMatchQuerySpec = (path, matchKey, order, pageSize, orderPath, selectPaths) => {
    const inst = new QuerySpec(path);
    inst.queryType = "match";
    inst.matchKey = matchKey;
    inst.orderPath = orderPath;
    if (order) {
        inst.order = order;
    } // override default only if a value was specified
    if (pageSize) {
        inst.pageSize = pageSize;
    } // override default only if a value was specified
    inst.orderPath = orderPath ? orderPath : path;
    if (selectPaths) {
        inst.selectPaths = selectPaths;
    }
    return inst;
};
exports.buildMatchQuerySpec = buildMatchQuerySpec;
// Returns a query spec that will page all results returned by smartSql
const buildSmartQuerySpec = (smartSql, pageSize) => {
    const inst = new QuerySpec();
    inst.queryType = "smart";
    inst.smartSql = smartSql;
    if (pageSize) {
        inst.pageSize = pageSize;
    } // override default only if a value was specified
    return inst;
};
exports.buildSmartQuerySpec = buildSmartQuerySpec;
// If param is a storeconfig return the same storeconfig
// If param is a boolean, returns a storeconfig object  {'isGlobalStore': boolean}
// Otherwise, returns a default storeconfig object
const checkFirstArg = (arg) => {
    // Turning arguments into array
    // If first argument is a store config
    if (typeof arg === "object" && arg.hasOwnProperty("isGlobalStore")) {
        return arg;
    }
    let isGlobalStore = false;
    if (typeof arg === "boolean") {
        isGlobalStore = arg;
    }
    return { isGlobalStore };
};
// ====== Soup manipulation ======
const getDatabaseSize = (storeConfig, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "getDatabaseSize", {
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.getDatabaseSize = getDatabaseSize;
const registerSoup = (storeConfig, soupName, indexSpecs, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "registerSoup", {
        soupName,
        indexes: indexSpecs,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.registerSoup = registerSoup;
const removeSoup = (storeConfig, soupName, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "removeSoup", {
        soupName,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.removeSoup = removeSoup;
const getSoupIndexSpecs = (storeConfig, soupName, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "getSoupIndexSpecs", {
        soupName,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.getSoupIndexSpecs = getSoupIndexSpecs;
const alterSoup = (storeConfig, soupName, indexSpecs, reIndexData, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "alterSoup", {
        soupName,
        indexes: indexSpecs,
        reIndexData,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.alterSoup = alterSoup;
const reIndexSoup = (storeConfig, soupName, paths, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "reIndexSoup", {
        soupName,
        paths,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.reIndexSoup = reIndexSoup;
const clearSoup = (storeConfig, soupName, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "clearSoup", {
        soupName,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.clearSoup = clearSoup;
const soupExists = (storeConfig, soupName, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "soupExists", {
        soupName,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.soupExists = soupExists;
const querySoup = (storeConfig, soupName, querySpec, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    if (querySpec.queryType === "smart") {
        throw new Error("Smart queries can only be run using runSmartQuery");
    }
    if (querySpec.order != null && querySpec.orderPath == null) {
        querySpec.orderPath = querySpec.indexPath;
    } // for backward compatibility with pre-3.3 code
    // query returns serialized json on iOS starting in 7.0
    const successCBdeserializing = successCB
        ? (result) => successCB(typeof result === "string" ? (0, react_force_common_1.safeJSONparse)(result) : result)
        : successCB;
    exec(successCBdeserializing, errorCB, "querySoup", {
        soupName,
        querySpec,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.querySoup = querySoup;
const runSmartQuery = (storeConfig, querySpec, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    if (querySpec.queryType !== "smart") {
        throw new Error("runSmartQuery can only run smart queries");
    }
    // query returns serialized json on iOS starting in 7.0
    const successCBdeserializing = successCB
        ? (result) => successCB(typeof result === "string" ? (0, react_force_common_1.safeJSONparse)(result) : result)
        : successCB;
    exec(successCBdeserializing, errorCB, "runSmartQuery", {
        querySpec,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.runSmartQuery = runSmartQuery;
const retrieveSoupEntries = (storeConfig, soupName, entryIds, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "retrieveSoupEntries", {
        soupName,
        entryIds,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.retrieveSoupEntries = retrieveSoupEntries;
const upsertSoupEntries = (storeConfig, soupName, entries, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    (0, exports.upsertSoupEntriesWithExternalId)(storeConfig, soupName, entries, "_soupEntryId", successCB, errorCB);
};
exports.upsertSoupEntries = upsertSoupEntries;
let upsertSoupEntriesWithExternalId = (storeConfig, soupName, entries, externalIdPath, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "upsertSoupEntries", {
        soupName,
        entries,
        externalIdPath,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.upsertSoupEntriesWithExternalId = upsertSoupEntriesWithExternalId;
const removeFromSoup = (storeConfig, soupName, entryIdsOrQuerySpec, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    var execArgs = {
        soupName,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    };
    if (entryIdsOrQuerySpec instanceof Array) {
        execArgs.entryIds = entryIdsOrQuerySpec;
        execArgs.querySpec = undefined;
    }
    else {
        execArgs.querySpec = entryIdsOrQuerySpec;
        execArgs.entryIds = undefined;
    }
    exec(successCB, errorCB, "removeFromSoup", execArgs);
};
exports.removeFromSoup = removeFromSoup;
// ====== Cursor manipulation ======
const moveCursorToPageIndex = (storeConfig, cursor, newPageIndex, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    // query returns serialized json on iOS starting in 7.0
    let successCBdeserializing;
    if (successCB) {
        successCBdeserializing = (result) => successCB(typeof result === "string" ? (0, react_force_common_1.safeJSONparse)(result) : result);
    }
    else {
        successCBdeserializing = successCB;
    }
    exec(successCBdeserializing, errorCB, "moveCursorToPageIndex", {
        cursorId: cursor.cursorId,
        index: newPageIndex,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.moveCursorToPageIndex = moveCursorToPageIndex;
const moveCursorToNextPage = (storeConfig, cursor, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    const newPageIndex = cursor.currentPageIndex + 1;
    if (newPageIndex >= cursor.totalPages) {
        errorCB(
        // cursor,
        new Error("moveCursorToNextPage called while on last page"));
    }
    else {
        (0, exports.moveCursorToPageIndex)(storeConfig, cursor, newPageIndex, successCB, errorCB);
    }
};
exports.moveCursorToNextPage = moveCursorToNextPage;
const moveCursorToPreviousPage = (storeConfig, cursor, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    const newPageIndex = cursor.currentPageIndex - 1;
    if (newPageIndex < 0) {
        errorCB(
        // cursor,
        new Error("moveCursorToPreviousPage called while on first page"));
    }
    else {
        (0, exports.moveCursorToPageIndex)(storeConfig, cursor, newPageIndex, successCB, errorCB);
    }
};
exports.moveCursorToPreviousPage = moveCursorToPreviousPage;
const closeCursor = (storeConfig, cursor, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "closeCursor", {
        cursorId: cursor.cursorId,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.closeCursor = closeCursor;
// ====== Store Operations ======
const getAllStores = (successCB, errorCB) => {
    exec(successCB, errorCB, "getAllStores", {});
};
exports.getAllStores = getAllStores;
const getAllGlobalStores = (successCB, errorCB) => {
    exec(successCB, errorCB, "getAllGlobalStores", {});
};
exports.getAllGlobalStores = getAllGlobalStores;
const removeStore = (storeConfig, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "removeStore", {
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.removeStore = removeStore;
const removeAllGlobalStores = (successCB, errorCB) => {
    exec(successCB, errorCB, "removeAllGlobalStores", {});
};
exports.removeAllGlobalStores = removeAllGlobalStores;
const removeAllStores = (successCB, errorCB) => {
    exec(successCB, errorCB, "removeAllStores", {});
};
exports.removeAllStores = removeAllStores;
//# sourceMappingURL=react.force.smartstore.js.map