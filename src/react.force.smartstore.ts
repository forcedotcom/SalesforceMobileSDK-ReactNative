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

import { NativeModules } from "react-native";
import { exec as forceExec, ExecErrorCallback, ExecSuccessCallback, safeJSONparse } from "./react.force.common";
import { QuerySpecType, StoreOrder } from "./typings";
import {
  AlterSoup,
  AlterSoupWithSpec,
  ClearSoup,
  CloseCursor,
  GetAllGlobalStores,
  GetAllStores,
  GetDatabaseSize,
  GetSoupIndexSpecs,
  GetSoupSpec,
  MoveCursorToNextPage,
  MoveCursorToPageIndex,
  MoveCursorToPreviousPage,
  OK,
  QuerySoup,
  RegisterSoup,
  RegisterSoupWithSpec,
  ReIndexSoup,
  RemoveAllGlobalStores,
  RemoveAllStores,
  RemoveFromSoup,
  RemoveSoup,
  RemoveStore,
  RetrieveSoupEntries,
  RunSmartQuery,
  SmartStoreMethod,
  SObject,
  SoupExists,
  UpsertSoupEntries,
  UpsertSoupEntriesWithExternalId,
} from "./typings/smartstore";
const { SmartStoreReactBridge, SFSmartStoreReactBridge } = NativeModules;

const exec = <T>(
  successCB: ExecSuccessCallback<T> | undefined,
  errorCB: ExecErrorCallback | undefined,
  methodName: SmartStoreMethod,
  args: any,
): Promise<T> | void => {
  if (successCB && errorCB) {
    return forceExec(
      "SFSmartStoreReactBridge",
      "SmartStoreReactBridge",
      SFSmartStoreReactBridge,
      SmartStoreReactBridge,
      successCB,
      errorCB,
      methodName,
      args,
    );
  } else {
    return new Promise((resolve, reject) => {
      forceExec(
        "SFSmartStoreReactBridge",
        "SmartStoreReactBridge",
        SFSmartStoreReactBridge,
        SmartStoreReactBridge,
        resolve,
        reject,
        methodName,
        args,
      );
    });
  }
};

/**
 * StoreConfig class
 */
export class StoreConfig {
  public storeName?: string;
  public isGlobalStore?: boolean;

  constructor(storeName: string, isGlobalStore: boolean) {
    this.storeName = storeName;
    this.isGlobalStore = isGlobalStore;
  }
}

/**
 * SoupSpec class
 */
export class SoupSpec {
  public name: string;
  public features: SObject;

  constructor(soupName: string, features: SObject) {
    this.name = soupName;
    this.features = features;
  }
}

/**
 * SoupIndexSpec class
 */
export class SoupIndexSpec {
  path: string;
  type: string;

  constructor(path: string, type: string) {
    this.path = path;
    this.type = type;
  }
}

/**
 * QuerySpec class
 */
export class QuerySpec {
  // the kind of query, one of: "exact","range", "like" or "smart":
  // "exact" uses matchKey, "range" uses beginKey and endKey, "like" uses likeKey, "smart" uses smartSql
  public queryType: QuerySpecType = "exact";

  // path for the original IndexSpec you wish to use for search: may be a compound path eg Account.Owner.Name
  public indexPath?: string;

  // for queryType "exact" and "match"
  public matchKey?: string;

  // for queryType "like"
  public likeKey?: string;

  // for queryType "range"
  // the value at which query results may begin
  public beginKey?: string;

  // the value at which query results may end
  public endKey?: string;

  // for queryType "smart"
  public smartSql?: string;

  // path to sort by : optional
  public orderPath?: string;

  // "ascending" or "descending" : optional
  public order: StoreOrder = "ascending";

  // the number of entries to copy from native to javascript per each cursor page
  public pageSize = 10;

  // selectPaths - null means return soup elements
  public selectPaths?: string[];

  constructor(path?: string) {
    this.indexPath = path;
  }
}

/**
 * StoreCursor class
 */
export class StoreCursor<T> {
  // a unique identifier for this cursor, used by plugin
  public cursorId?: string;

  // the maximum number of entries returned per page
  public pageSize = 0;

  // the total number of results
  public totalEntries = 0;

  // the total number of pages of results available
  public totalPages = 0;

  // the current page index among all the pages available
  public currentPageIndex = 0;

  // the list of current page entries, ordered as requested in the querySpec
  public currentPageOrderedEntries: T[] = [];

  constructor() {}
}

// ====== querySpec factory methods
// Returns a query spec that will page through all soup entries in order by the given path value
// Internally it simply does a range query with null begin and end keys
export const buildAllQuerySpec = (
  path: string,
  order: StoreOrder,
  pageSize: number,
  selectPaths?: string[],
): QuerySpec => {
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

// Returns a query spec that will page all entries exactly matching the matchKey value for path
export const buildExactQuerySpec = (
  path: string,
  matchKey: string,
  pageSize: number,
  order: StoreOrder,
  orderPath?: string,
  selectPaths?: string[],
): QuerySpec => {
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

// Returns a query spec that will page all entries in the range beginKey ...endKey for path
export const buildRangeQuerySpec = (
  path: string,
  beginKey: string,
  endKey: string,
  order: StoreOrder,
  pageSize: number,
  orderPath?: string,
  selectPaths?: string[],
): QuerySpec => {
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

// Returns a query spec that will page all entries matching the given likeKey value for path
export const buildLikeQuerySpec = (
  path: string,
  likeKey: string,
  order: StoreOrder,
  pageSize: number,
  orderPath?: string,
  selectPaths?: string[],
): QuerySpec => {
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

// Returns a query spec that will page all entries matching the given full-text search matchKey value for path
// Pass null for path to match matchKey across all full-text indexed fields
export const buildMatchQuerySpec = (
  path: string,
  matchKey: string,
  order: StoreOrder,
  pageSize: number,
  orderPath?: string,
  selectPaths?: string[],
): QuerySpec => {
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

// Returns a query spec that will page all results returned by smartSql
export const buildSmartQuerySpec = (smartSql: string, pageSize: number): QuerySpec => {
  const inst = new QuerySpec();
  inst.queryType = "smart";
  inst.smartSql = smartSql;
  if (pageSize) {
    inst.pageSize = pageSize;
  } // override default only if a value was specified
  return inst;
};

// If param is a storeconfig return the same storeconfig
// If param is a boolean, returns a storeconfig object  {'isGlobalStore': boolean}
// Otherwise, returns a default storeconfig object
const checkFirstArg = (arg: StoreConfig | boolean) => {
  // Turning arguments into array
  // If first argument is a store config
  if (typeof arg === "object" && arg.hasOwnProperty("isGlobalStore")) {
    return arg;
  }

  let isGlobalStore = false;
  if (typeof arg === "boolean") {
    isGlobalStore = arg;
  }
  return { isGlobalStore } as StoreConfig;
};

// ====== Soup manipulation ======
export const getDatabaseSize: GetDatabaseSize = (
  storeConfig: StoreConfig | boolean,
  successCB?: ExecSuccessCallback<number>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "getDatabaseSize", {
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const registerSoup: RegisterSoup = (
  storeConfig: StoreConfig | boolean,
  soupName: string,
  indexSpecs: SoupIndexSpec[],
  successCB?: ExecSuccessCallback<string>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "registerSoup", {
    soupName,
    indexes: indexSpecs,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const registerSoupWithSpec: RegisterSoupWithSpec = (
  storeConfig: StoreConfig | boolean,
  soupSpec: QuerySpec,
  indexSpecs: SoupIndexSpec[],
  successCB?: ExecSuccessCallback<string>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "registerSoup", {
    soupSpec,
    indexes: indexSpecs,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const removeSoup: RemoveSoup = (
  storeConfig: StoreConfig | boolean,
  soupName: string,
  successCB?: ExecSuccessCallback<OK>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "removeSoup", {
    soupName,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const getSoupIndexSpecs: GetSoupIndexSpecs = (
  storeConfig: StoreConfig | boolean,
  soupName: string,
  successCB?: ExecSuccessCallback<SoupIndexSpec[]>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "getSoupIndexSpecs", {
    soupName,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const getSoupSpec: GetSoupSpec = (
  storeConfig: StoreConfig | boolean,
  soupName: string,
  successCB?: ExecSuccessCallback<SoupSpec>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "getSoupSpec", {
    soupName,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const alterSoup: AlterSoup = (
  storeConfig: StoreConfig | boolean,
  soupName: string,
  indexSpecs: SoupIndexSpec[],
  reIndexData: boolean,
  successCB?: ExecSuccessCallback<string>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "alterSoup", {
    soupName,
    indexes: indexSpecs,
    reIndexData,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const alterSoupWithSpec: AlterSoupWithSpec = (
  storeConfig: StoreConfig | boolean,
  soupName: string,
  soupSpec: SoupSpec,
  indexSpecs: SoupIndexSpec[],
  reIndexData: boolean,
  successCB?: ExecSuccessCallback<string>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "alterSoup", {
    soupName,
    soupSpec,
    indexes: indexSpecs,
    reIndexData,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const reIndexSoup: ReIndexSoup = (
  storeConfig: StoreConfig | boolean,
  soupName: string,
  paths: string,
  successCB?: ExecSuccessCallback<string>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "reIndexSoup", {
    soupName,
    paths,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const clearSoup: ClearSoup = <T>(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  successCB?: ExecSuccessCallback<T>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "clearSoup", {
    soupName,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const soupExists: SoupExists = (
  storeConfig: StoreConfig | boolean,
  soupName: string,
  successCB?: ExecSuccessCallback<boolean>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "soupExists", {
    soupName,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const querySoup: QuerySoup = <T>(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  querySpec: QuerySpec,
  successCB?: ExecSuccessCallback<StoreCursor<T>>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  if (querySpec.queryType === "smart") {
    throw new Error("Smart queries can only be run using runSmartQuery");
  }

  if (querySpec.order != null && querySpec.orderPath == null) {
    querySpec.orderPath = querySpec.indexPath;
  }

  // for backward compatibility with pre-3.3 code
  // query returns serialized json on iOS starting in 7.0
  const successCBdeserializing = successCB
    ? (result: StoreCursor<T>) => successCB(typeof result === "string" ? safeJSONparse(result) : result)
    : successCB;

  return exec(successCBdeserializing, errorCB, "querySoup", {
    soupName,
    querySpec,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const runSmartQuery: RunSmartQuery = <T>(
  storeConfig: StoreConfig | boolean,
  querySpec: QuerySpec,
  successCB?: ExecSuccessCallback<StoreCursor<T>>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  if (querySpec.queryType !== "smart") {
    throw new Error("runSmartQuery can only run smart queries");
  }

  // query returns serialized json on iOS starting in 7.0
  const successCBdeserializing = successCB
    ? (result: StoreCursor<T>) => successCB(typeof result === "string" ? safeJSONparse(result) : result)
    : successCB;

  return exec(successCBdeserializing, errorCB, "runSmartQuery", {
    querySpec,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const retrieveSoupEntries: RetrieveSoupEntries = <T>(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  entryIds: string[],
  successCB?: ExecSuccessCallback<StoreCursor<T>>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "retrieveSoupEntries", {
    soupName,
    entryIds,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const upsertSoupEntries: UpsertSoupEntries = <T>(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  entries: SObject[],
  successCB?: ExecSuccessCallback<T>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  if (successCB && errorCB) {
    return upsertSoupEntriesWithExternalId(storeConfig, soupName, entries, "_soupEntryId", successCB, errorCB);
  } else {
    return upsertSoupEntriesWithExternalId(storeConfig, soupName, entries, "_soupEntryId");
  }
};

export const upsertSoupEntriesWithExternalId: UpsertSoupEntriesWithExternalId = <T>(
  storeConfig: StoreConfig | boolean,
  soupName: string,
  entries: SObject[],
  externalIdPath: string,
  successCB?: ExecSuccessCallback<T>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "upsertSoupEntries", {
    soupName,
    entries,
    externalIdPath,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const removeFromSoup: RemoveFromSoup = (
  storeConfig: StoreConfig | boolean,
  soupName: string,
  entryIdsOrQuerySpec: string[],
  successCB?: ExecSuccessCallback<OK>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  const execArgs = {
    soupName,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  };

  execArgs[entryIdsOrQuerySpec instanceof Array ? "entryIds" : "querySpec"] = entryIdsOrQuerySpec;
  execArgs[entryIdsOrQuerySpec instanceof Array ? "querySpec" : "entryIds"] = null;

  return exec(successCB, errorCB, "removeFromSoup", execArgs);
};

// ====== Cursor manipulation ======
export const moveCursorToPageIndex: MoveCursorToPageIndex = <T>(
  storeConfig: StoreConfig | boolean,
  cursor: StoreCursor<T>,
  newPageIndex: number,
  successCB?: ExecSuccessCallback<T>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  // query returns serialized json on iOS starting in 7.0
  let successCBdeserializing;

  if (successCB) {
    successCBdeserializing = (result: T) => successCB(typeof result === "string" ? safeJSONparse(result) : result);
  } else {
    successCBdeserializing = successCB;
  }

  return exec(successCBdeserializing, errorCB, "moveCursorToPageIndex", {
    cursorId: cursor.cursorId,
    index: newPageIndex,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const moveCursorToNextPage: MoveCursorToNextPage = <T>(
  storeConfig: StoreConfig | boolean,
  cursor: StoreCursor<T>,
  successCB?: ExecSuccessCallback<T>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  const newPageIndex = cursor.currentPageIndex + 1;

  if (newPageIndex >= cursor.totalPages) {
    const err = new Error("moveCursorToNextPage called while on last page");

    if (errorCB) {
      errorCB(err);
    } else {
      throw err;
    }
  } else {
    if (successCB && errorCB) {
      moveCursorToPageIndex(storeConfig, cursor, newPageIndex, successCB, errorCB);
    } else {
      return moveCursorToPageIndex(storeConfig, cursor, newPageIndex);
    }
  }
};

export const moveCursorToPreviousPage: MoveCursorToPreviousPage = <T>(
  storeConfig: StoreConfig | boolean,
  cursor: StoreCursor<T>,
  successCB?: ExecSuccessCallback<T>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  const newPageIndex = cursor.currentPageIndex - 1;

  if (newPageIndex < 0) {
    const err = new Error("moveCursorToPreviousPage called while on last page");

    if (errorCB) {
      errorCB(err);
    } else {
      throw err;
    }
  } else {
    if (successCB && errorCB) {
      return moveCursorToPageIndex(storeConfig, cursor, newPageIndex, successCB, errorCB);
    } else {
      return moveCursorToPageIndex(storeConfig, cursor, newPageIndex);
    }
  }
};

export const closeCursor: CloseCursor = <T>(
  storeConfig: StoreConfig | boolean,
  cursor: StoreCursor<T>,
  successCB?: ExecSuccessCallback<OK>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "closeCursor", {
    cursorId: cursor.cursorId,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

// ====== Store Operations ======
export const getAllStores: GetAllStores = (
  successCB?: ExecSuccessCallback<StoreConfig[]>,
  errorCB?: ExecErrorCallback,
): any => exec(successCB, errorCB, "getAllStores", {});

export const getAllGlobalStores: GetAllGlobalStores = (
  successCB?: ExecSuccessCallback<StoreConfig[]>,
  errorCB?: ExecErrorCallback,
): any => exec(successCB, errorCB, "getAllGlobalStores", {});

export const removeStore: RemoveStore = (
  storeConfig: StoreConfig | boolean,
  successCB?: ExecSuccessCallback<OK>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "removeStore", {
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const removeAllGlobalStores: RemoveAllGlobalStores = (
  successCB?: ExecSuccessCallback<OK>,
  errorCB?: ExecErrorCallback,
): any => exec(successCB, errorCB, "removeAllGlobalStores", {});

export const removeAllStores: RemoveAllStores = (
  successCB?: ExecSuccessCallback<OK>,
  errorCB?: ExecErrorCallback,
): any => exec(successCB, errorCB, "removeAllStores", {});
