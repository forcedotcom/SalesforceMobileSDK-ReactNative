"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAllStores = exports.removeAllGlobalStores = exports.removeStore = exports.getAllGlobalStores = exports.getAllStores = exports.closeCursor = exports.moveCursorToPreviousPage = exports.moveCursorToNextPage = exports.moveCursorToPageIndex = exports.removeFromSoup = exports.upsertSoupEntriesWithExternalId = exports.upsertSoupEntries = exports.retrieveSoupEntries = exports.runSmartQuery = exports.querySoup = exports.soupExists = exports.clearSoup = exports.reIndexSoup = exports.alterSoupWithSpec = exports.alterSoup = exports.getSoupSpec = exports.getSoupIndexSpecs = exports.removeSoup = exports.registerSoupWithSpec = exports.registerSoup = exports.getDatabaseSize = exports.buildSmartQuerySpec = exports.buildMatchQuerySpec = exports.buildLikeQuerySpec = exports.buildRangeQuerySpec = exports.buildExactQuerySpec = exports.buildAllQuerySpec = exports.StoreCursor = exports.QuerySpec = exports.SoupIndexSpec = exports.SoupSpec = exports.StoreConfig = void 0;
const react_native_1 = require("react-native");
const react_force_common_1 = require("./react.force.common");
const { SmartStoreReactBridge, SFSmartStoreReactBridge } = react_native_1.NativeModules;
const exec = (successCB, errorCB, methodName, args) => {
    (0, react_force_common_1.exec)("SFSmartStoreReactBridge", "SmartStoreReactBridge", SFSmartStoreReactBridge, SmartStoreReactBridge, successCB, errorCB, methodName, args);
};
class StoreConfig {
    constructor(storeName, isGlobalStore) {
        this.storeName = storeName;
        this.isGlobalStore = isGlobalStore;
    }
}
exports.StoreConfig = StoreConfig;
class SoupSpec {
    constructor(soupName, features) {
        this.name = soupName;
        this.features = features;
    }
}
exports.SoupSpec = SoupSpec;
class SoupIndexSpec {
    constructor(path, type) {
        this.path = path;
        this.type = type;
    }
}
exports.SoupIndexSpec = SoupIndexSpec;
class QuerySpec {
    constructor(path) {
        this.queryType = "exact";
        this.order = "ascending";
        this.pageSize = 10;
        this.indexPath = path;
    }
}
exports.QuerySpec = QuerySpec;
class StoreCursor {
    constructor() {
        this.pageSize = 0;
        this.totalEntries = 0;
        this.totalPages = 0;
        this.currentPageIndex = 0;
        this.currentPageOrderedEntries = [];
    }
}
exports.StoreCursor = StoreCursor;
const buildAllQuerySpec = (path, order, pageSize, selectPaths) => {
    const inst = new QuerySpec(path);
    inst.queryType = "range";
    inst.orderPath = path;
    if (order) {
        inst.order = order;
    }
    if (pageSize) {
        inst.pageSize = pageSize;
    }
    if (selectPaths) {
        inst.selectPaths = selectPaths;
    }
    return inst;
};
exports.buildAllQuerySpec = buildAllQuerySpec;
const buildExactQuerySpec = (path, matchKey, pageSize, order, orderPath, selectPaths) => {
    const inst = new QuerySpec(path);
    inst.matchKey = matchKey;
    if (pageSize) {
        inst.pageSize = pageSize;
    }
    if (order) {
        inst.order = order;
    }
    inst.orderPath = orderPath ? orderPath : path;
    if (selectPaths) {
        inst.selectPaths = selectPaths;
    }
    return inst;
};
exports.buildExactQuerySpec = buildExactQuerySpec;
const buildRangeQuerySpec = (path, beginKey, endKey, order, pageSize, orderPath, selectPaths) => {
    const inst = new QuerySpec(path);
    inst.queryType = "range";
    inst.beginKey = beginKey;
    inst.endKey = endKey;
    if (order) {
        inst.order = order;
    }
    if (pageSize) {
        inst.pageSize = pageSize;
    }
    inst.orderPath = orderPath ? orderPath : path;
    if (selectPaths) {
        inst.selectPaths = selectPaths;
    }
    return inst;
};
exports.buildRangeQuerySpec = buildRangeQuerySpec;
const buildLikeQuerySpec = (path, likeKey, order, pageSize, orderPath, selectPaths) => {
    const inst = new QuerySpec(path);
    inst.queryType = "like";
    inst.likeKey = likeKey;
    if (order) {
        inst.order = order;
    }
    if (pageSize) {
        inst.pageSize = pageSize;
    }
    inst.orderPath = orderPath ? orderPath : path;
    if (selectPaths) {
        inst.selectPaths = selectPaths;
    }
    return inst;
};
exports.buildLikeQuerySpec = buildLikeQuerySpec;
const buildMatchQuerySpec = (path, matchKey, order, pageSize, orderPath, selectPaths) => {
    const inst = new QuerySpec(path);
    inst.queryType = "match";
    inst.matchKey = matchKey;
    inst.orderPath = orderPath;
    if (order) {
        inst.order = order;
    }
    if (pageSize) {
        inst.pageSize = pageSize;
    }
    inst.orderPath = orderPath ? orderPath : path;
    if (selectPaths) {
        inst.selectPaths = selectPaths;
    }
    return inst;
};
exports.buildMatchQuerySpec = buildMatchQuerySpec;
const buildSmartQuerySpec = (smartSql, pageSize) => {
    const inst = new QuerySpec();
    inst.queryType = "smart";
    inst.smartSql = smartSql;
    if (pageSize) {
        inst.pageSize = pageSize;
    }
    return inst;
};
exports.buildSmartQuerySpec = buildSmartQuerySpec;
const checkFirstArg = (arg) => {
    if (typeof arg === "object" && arg.hasOwnProperty("isGlobalStore")) {
        return arg;
    }
    let isGlobalStore = false;
    if (typeof arg === "boolean") {
        isGlobalStore = arg;
    }
    return { isGlobalStore };
};
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
const registerSoupWithSpec = (storeConfig, soupSpec, indexSpecs, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "registerSoup", {
        soupSpec,
        indexes: indexSpecs,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.registerSoupWithSpec = registerSoupWithSpec;
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
const getSoupSpec = (storeConfig, soupName, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "getSoupSpec", {
        soupName,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.getSoupSpec = getSoupSpec;
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
const alterSoupWithSpec = (storeConfig, soupName, soupSpec, indexSpecs, reIndexData, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "alterSoup", {
        soupName,
        soupSpec,
        indexes: indexSpecs,
        reIndexData,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.alterSoupWithSpec = alterSoupWithSpec;
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
    }
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
    const execArgs = {
        soupName,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    };
    execArgs[entryIdsOrQuerySpec instanceof Array ? "entryIds" : "querySpec"] = entryIdsOrQuerySpec;
    execArgs[entryIdsOrQuerySpec instanceof Array ? "querySpec" : "entryIds"] = null;
    exec(successCB, errorCB, "removeFromSoup", execArgs);
};
exports.removeFromSoup = removeFromSoup;
const moveCursorToPageIndex = (storeConfig, cursor, newPageIndex, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
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
        errorCB(new Error("moveCursorToNextPage called while on last page"));
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
        errorCB(new Error("moveCursorToPreviousPage called while on first page"));
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