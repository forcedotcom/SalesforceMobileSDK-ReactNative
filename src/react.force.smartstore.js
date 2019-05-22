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

import { NativeModules } from 'react-native';
const { SmartStoreReactBridge, SFSmartStoreReactBridge } = NativeModules;
import {exec as forceExec} from './react.force.common';


const exec = (successCB, errorCB, methodName, args) => {
    forceExec("SFSmartStoreReactBridge", "SmartStoreReactBridge", SFSmartStoreReactBridge, SmartStoreReactBridge, successCB, errorCB, methodName, args);
};

/**
 * StoreConfig class
 */
export class StoreConfig {
    constructor(storeName, isGlobalStore) {
        this.storeName = storeName;
        this.isGlobalStore = isGlobalStore;
    }
}

/**
 * SoupSpec class
 */
export class SoupSpec {
    constructor(soupName, features) {
        this.name = soupName;
        this.features = features;
    }
}

/**
 * SoupIndexSpec class
 */
export class SoupIndexSpec {
    constructor(path, type) {
        this.path = path;
        this.type = type;
    }
}

/**
 * QuerySpec class
 */
export class QuerySpec {
    constructor(path) {
        // the kind of query, one of: "exact","range", "like" or "smart":
        // "exact" uses matchKey, "range" uses beginKey and endKey, "like" uses likeKey, "smart" uses smartSql
        this.queryType = "exact";

        //path for the original IndexSpec you wish to use for search: may be a compound path eg Account.Owner.Name
        this.indexPath = path;

        //for queryType "exact" and "match"
        this.matchKey = null;

        //for queryType "like"
        this.likeKey = null;

        //for queryType "range"
        //the value at which query results may begin
        this.beginKey = null;
        //the value at which query results may end
        this.endKey = null;

        // for queryType "smart"
        this.smartSql = null;

        //path to sort by : optional
        this.orderPath = null

        //"ascending" or "descending" : optional
        this.order = "ascending";

        //the number of entries to copy from native to javascript per each cursor page
        this.pageSize = 10;

        //selectPaths - null means return soup elements
        this.selectPaths = null;
    }
}

/**
 * StoreCursor class
 */
export class StoreCursor {
    constructor() {
        //a unique identifier for this cursor, used by plugin
        this.cursorId = null;
        //the maximum number of entries returned per page
        this.pageSize = 0;
        // the total number of results
        this.totalEntries = 0;
        //the total number of pages of results available
        this.totalPages = 0;
        //the current page index among all the pages available
        this.currentPageIndex = 0;
        //the list of current page entries, ordered as requested in the querySpec
        this.currentPageOrderedEntries = null;
    }
}

// ====== querySpec factory methods
// Returns a query spec that will page through all soup entries in order by the given path value
// Internally it simply does a range query with null begin and end keys
export const buildAllQuerySpec = (path, order, pageSize, selectPaths) => {
    const inst = new QuerySpec(path);
    inst.queryType = "range";
    inst.orderPath = path;
    if (order) { inst.order = order; } // override default only if a value was specified
    if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
    if (selectPaths) { inst.selectPaths = selectPaths; }
    return inst;
};

// Returns a query spec that will page all entries exactly matching the matchKey value for path
export const buildExactQuerySpec = (path, matchKey, pageSize, order, orderPath, selectPaths) => {
    const inst = new QuerySpec(path);
    inst.matchKey = matchKey;
    if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
    if (order) { inst.order = order; } // override default only if a value was specified
    inst.orderPath = orderPath ? orderPath : path;
    if (selectPaths) { inst.selectPaths = selectPaths; }
    return inst;
};

// Returns a query spec that will page all entries in the range beginKey ...endKey for path
export const buildRangeQuerySpec = (path, beginKey, endKey, order, pageSize, orderPath, selectPaths) => {
    const inst = new QuerySpec(path);
    inst.queryType = "range";
    inst.beginKey = beginKey;
    inst.endKey = endKey;
    if (order) { inst.order = order; } // override default only if a value was specified
    if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
    inst.orderPath = orderPath ? orderPath : path;
    if (selectPaths) { inst.selectPaths = selectPaths; }
    return inst;
};

// Returns a query spec that will page all entries matching the given likeKey value for path
export const buildLikeQuerySpec = (path, likeKey, order, pageSize, orderPath, selectPaths) => {
    const inst = new QuerySpec(path);
    inst.queryType = "like";
    inst.likeKey = likeKey;
    if (order) { inst.order = order; } // override default only if a value was specified
    if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
    inst.orderPath = orderPath ? orderPath : path;
    if (selectPaths) { inst.selectPaths = selectPaths; }
    return inst;
};

// Returns a query spec that will page all entries matching the given full-text search matchKey value for path
// Pass null for path to match matchKey across all full-text indexed fields
export const buildMatchQuerySpec = (path, matchKey, order, pageSize, orderPath, selectPaths) => {
    const inst = new QuerySpec(path);
    inst.queryType = "match";
    inst.matchKey = matchKey;
    inst.orderPath = orderPath;
    if (order) { inst.order = order; } // override default only if a value was specified
    if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
    inst.orderPath = orderPath ? orderPath : path;
    if (selectPaths) { inst.selectPaths = selectPaths; }
    return inst;
};

// Returns a query spec that will page all results returned by smartSql
export const buildSmartQuerySpec = (smartSql, pageSize) => {
    const inst = new QuerySpec();
    inst.queryType = "smart";
    inst.smartSql = smartSql;
    if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
    return inst;
};
// If param is a storeconfig return the same storeconfig 
// If param is a boolean, returns a storeconfig object  {'isGlobalStore': boolean}
// Otherwise, returns a default storeconfig object
const checkFirstArg = arg => {
    // Turning arguments into array
    // If first argument is a store config
    if (typeof(arg) === "object" && arg.hasOwnProperty("isGlobalStore")) {
         return arg;
    }

    let isGlobalStore =  false;
    if (typeof(arg) === "boolean") {
       isGlobalStore = arg;
    }
    return {'isGlobalStore': isGlobalStore};
};

// ====== Soup manipulation ======
export const getDatabaseSize = (storeConfig, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "getDatabaseSize", {"isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

export const registerSoup = (storeConfig, soupName, indexSpecs, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "registerSoup", {"soupName": soupName, "indexes": indexSpecs, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

export const registerSoupWithSpec = (storeConfig, soupSpec, indexSpecs, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "registerSoup", {"soupSpec": soupSpec, "indexes": indexSpecs, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

export const removeSoup = (storeConfig, soupName, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "removeSoup", {"soupName": soupName, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

export const getSoupIndexSpecs = (storeConfig, soupName, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "getSoupIndexSpecs", {"soupName": soupName, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

export const getSoupSpec = (storeConfig, soupName, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "getSoupSpec", {"soupName": soupName, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

export const alterSoup = (storeConfig, soupName, indexSpecs, reIndexData, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "alterSoup", {"soupName": soupName, "indexes": indexSpecs, "reIndexData": reIndexData, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

export const alterSoupWithSpec = (storeConfig, soupName, soupSpec, indexSpecs, reIndexData, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "alterSoup", {"soupName": soupName, "soupSpec": soupSpec, "indexes": indexSpecs, "reIndexData": reIndexData, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

export const reIndexSoup = (storeConfig, soupName, paths, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "reIndexSoup", {"soupName": soupName, "paths": paths, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

export const clearSoup = (storeConfig, soupName, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "clearSoup", {"soupName": soupName, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

export const soupExists = (storeConfig, soupName, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "soupExists", {"soupName": soupName, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

export const querySoup = (storeConfig, soupName, querySpec, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    if (querySpec.queryType == "smart") throw new Error("Smart queries can only be run using runSmartQuery");
    if (querySpec.order != null && querySpec.orderPath == null) querySpec.orderPath = querySpec.indexPath; // for backward compatibility with pre-3.3 code
    // query returns serialized json on iOS starting in 7.0
    var successCBdeserializing = successCB ? (result) =>  successCB((typeof result === "string") ? JSON.parse(result) : result) : successCB;
    exec(successCBdeserializing, errorCB, "querySoup", {"soupName": soupName, "querySpec": querySpec, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

export const runSmartQuery = (storeConfig, querySpec, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    if (querySpec.queryType != "smart") throw new Error("runSmartQuery can only run smart queries");
    // query returns serialized json on iOS starting in 7.0
    var successCBdeserializing = successCB ? (result) =>  successCB((typeof result === "string") ? JSON.parse(result) : result) : successCB;
    exec(successCBdeserializing, errorCB, "runSmartQuery", {"querySpec": querySpec, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

export const retrieveSoupEntries = (storeConfig, soupName, entryIds, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "retrieveSoupEntries", {"soupName": soupName, "entryIds": entryIds, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

export const upsertSoupEntries = (storeConfig, soupName, entries, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    upsertSoupEntriesWithExternalId(storeConfig, soupName, entries, "_soupEntryId", successCB, errorCB);
};

export var upsertSoupEntriesWithExternalId = (storeConfig, soupName, entries, externalIdPath, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "upsertSoupEntries", {"soupName": soupName, "entries": entries, "externalIdPath": externalIdPath, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

export const removeFromSoup = (storeConfig, soupName, entryIdsOrQuerySpec, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    const execArgs = {"soupName": soupName, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName};
    execArgs[entryIdsOrQuerySpec instanceof Array ? "entryIds":"querySpec"] = entryIdsOrQuerySpec;
    execArgs[entryIdsOrQuerySpec instanceof Array ? "querySpec":"entryIds"] = null;
    exec(successCB, errorCB, "removeFromSoup", execArgs);
};

//====== Cursor manipulation ======
export const moveCursorToPageIndex = (storeConfig, cursor, newPageIndex, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    // query returns serialized json on iOS starting in 7.0
    var successCBdeserializing = successCB ? (result) =>  successCB((typeof result === "string") ? JSON.parse(result) : result) : successCB;
    exec(successCBdeserializing, errorCB, "moveCursorToPageIndex", {"cursorId": cursor.cursorId, "index": newPageIndex, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

export const moveCursorToNextPage = (storeConfig, cursor, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    const newPageIndex = cursor.currentPageIndex + 1;
    if (newPageIndex >= cursor.totalPages) {
        errorCB(cursor, new Error("moveCursorToNextPage called while on last page"));
    } else {
        moveCursorToPageIndex(storeConfig, cursor, newPageIndex, successCB, errorCB);
    }
};

export const moveCursorToPreviousPage = (storeConfig, cursor, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    const newPageIndex = cursor.currentPageIndex - 1;
    if (newPageIndex < 0) {
        errorCB(cursor, new Error("moveCursorToPreviousPage called while on first page"));
    } else {
        moveCursorToPageIndex(storeConfig, cursor, newPageIndex, successCB, errorCB);
    }
};

export const closeCursor = (storeConfig, cursor, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "closeCursor", {"cursorId": cursor.cursorId, "isGlobalStore": storeConfig.isGlobalStore,"storeName":storeConfig.storeName});
};

//====== Store Operations ======
export const getAllStores = (successCB, errorCB) => {
    exec(successCB, errorCB, "getAllStores", {});
};

export const getAllGlobalStores = (successCB, errorCB) => {
    exec(successCB, errorCB, "getAllGlobalStores", {});
};

export const removeStore = (storeConfig, successCB, errorCB) => {
    var storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "removeStore", {"isGlobalStore": storeConfig.isGlobalStore, "storeName": storeConfig.storeName});
};

export const removeAllGlobalStores = (successCB, errorCB) => {
  exec(successCB, errorCB, "removeAllGlobalStores", {});
};

export const removeAllStores = (successCB, errorCB) => {
  exec(successCB, errorCB, "removeAllStores", {});
};
