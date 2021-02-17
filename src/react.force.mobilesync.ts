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
import { exec as forceExec, ExecErrorCallback, ExecSuccessCallback } from "./react.force.common";
import { StoreConfig } from "./react.force.smartstore";
import {
  CleanResyncGhosts,
  DeleteSync,
  GetSyncStatus,
  ReSync,
  SyncDown,
  SyncDownTarget,
  SyncEvent,
  SyncMethod,
  SyncOptions,
  SyncStatus,
  SyncUp,
} from "./typings/mobilesync";

const { MobileSyncReactBridge, SFMobileSyncReactBridge } = NativeModules;

// If param is a storeconfig return the same storeconfig
// If param is a boolean, returns a storeconfig object  {'isGlobalStore': boolean}
// Otherwise, returns a default storeconfig object
const checkFirstArg = (arg: StoreConfig) => {
  // Turning arguments into array
  // If first argument is a store config
  if (typeof arg === "object" && Object.prototype.hasOwnProperty.call(arg, "isGlobalStore")) {
    return arg;
  }

  let isGlobalStore = false;
  if (typeof arg === "boolean") {
    isGlobalStore = arg;
  }
  return { isGlobalStore: isGlobalStore };
};

const exec = <T>(
  successCB: ExecSuccessCallback<T> | undefined,
  errorCB: ExecErrorCallback | undefined,
  methodName: SyncMethod,
  args: Record<string, unknown>,
): Promise<T> | void => {
  if (successCB && errorCB) {
    forceExec(
      "SFMobileSyncReactBridge",
      "MobileSyncReactBridge",
      SFMobileSyncReactBridge,
      MobileSyncReactBridge,
      successCB,
      errorCB,
      methodName,
      args,
    );
  } else {
    return new Promise((resolve, reject) => {
      forceExec(
        "SFMobileSyncReactBridge",
        "MobileSyncReactBridge",
        SFMobileSyncReactBridge,
        MobileSyncReactBridge,
        resolve,
        reject,
        methodName,
        args,
      );
    });
  }
};

export const syncDown: SyncDown = (
  storeConfig: StoreConfig,
  target: SyncDownTarget,
  soupName: string,
  options: SyncOptions,
  x?: any,
  y?: any,
  z?: any,
): any => {
  storeConfig = checkFirstArg(storeConfig);
  const { syncName, successCB, errorCB } = processOpts(x, y, z);

  return exec<SyncEvent>(successCB, errorCB, "syncDown", {
    target: target,
    soupName: soupName,
    options: options,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
    syncName: syncName,
  });
};

export const reSync: ReSync = (
  storeConfig: StoreConfig,
  syncIdOrName: string,
  successCB?: ExecSuccessCallback<SyncEvent>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "reSync", {
    syncId: typeof syncIdOrName === "string" ? null : syncIdOrName,
    syncName: typeof syncIdOrName === "string" ? syncIdOrName : null,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const cleanResyncGhosts: CleanResyncGhosts = (
  storeConfig: StoreConfig,
  syncId: string,
  successCB?: ExecSuccessCallback<unknown>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "cleanResyncGhosts", {
    syncId: syncId,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const syncUp: SyncUp = (
  storeConfig: StoreConfig,
  target: SyncDownTarget,
  soupName: string,
  options: SyncOptions,
  x?: any,
  y?: any,
  z?: any,
): any => {
  storeConfig = checkFirstArg(storeConfig);
  const { syncName, successCB, errorCB } = processOpts(x, y, z);

  return exec(successCB, errorCB, "syncUp", {
    target: target,
    soupName: soupName,
    options: options,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
    syncName: syncName,
  });
};

export const getSyncStatus: GetSyncStatus = (
  storeConfig: StoreConfig,
  syncIdOrName: string,
  successCB?: ExecSuccessCallback<SyncStatus>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "getSyncStatus", {
    syncId: typeof syncIdOrName === "string" ? null : syncIdOrName,
    syncName: typeof syncIdOrName === "string" ? syncIdOrName : null,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const deleteSync: DeleteSync = (
  storeConfig: StoreConfig,
  syncIdOrName: string,
  successCB?: ExecSuccessCallback<unknown>,
  errorCB?: ExecErrorCallback,
): any => {
  storeConfig = checkFirstArg(storeConfig);

  return exec(successCB, errorCB, "deleteSync", {
    syncId: typeof syncIdOrName === "string" ? null : syncIdOrName,
    syncName: typeof syncIdOrName === "string" ? syncIdOrName : null,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const MERGE_MODE = {
  OVERWRITE: "OVERWRITE",
  LEAVE_IF_CHANGED: "LEAVE_IF_CHANGED",
};

const processOpts = (x: any, y: any, z: any) => {
  let syncName: string | undefined;
  let successCB: ExecSuccessCallback<SyncEvent> | undefined;
  let errorCB: ExecErrorCallback | undefined;

  // syncName optional (new in 6.0)
  if (typeof x === "string") {
    syncName = x;
  }

  if (typeof x === "function") {
    successCB = x as ExecSuccessCallback<SyncEvent>;
    errorCB = y as ExecErrorCallback;
  } else if (typeof z === "function") {
    successCB = y as ExecSuccessCallback<SyncEvent>;
    errorCB = z as ExecErrorCallback;
  }

  return { syncName, successCB, errorCB };
};
