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
import { exec as forceExec } from "./react.force.common";
import { StoreConfig } from "./react.force.smartstore";
import { SyncDownOptions, SyncDownTarget } from "./typings";

const { MobileSyncReactBridge, SFMobileSyncReactBridge } = NativeModules;

// If param is a storeconfig return the same storeconfig
// If param is a boolean, returns a storeconfig object  {'isGlobalStore': boolean}
// Otherwise, returns a default storeconfig object
const checkFirstArg = (arg: StoreConfig) => {
  // Turning arguments into array
  // If first argument is a store config
  if (
    typeof arg === "object" &&
    Object.prototype.hasOwnProperty.call(arg, "isGlobalStore")
  ) {
    return arg;
  }

  let isGlobalStore = false;
  if (typeof arg === "boolean") {
    isGlobalStore = arg;
  }
  return { isGlobalStore: isGlobalStore };
};

const exec = (
  successCB: ((result?: any) => void) | null,
  errorCB: ((err: Error) => void) | null,
  methodName: string,
  args: Record<string, unknown>
) => {
  forceExec(
    "SFMobileSyncReactBridge",
    "MobileSyncReactBridge",
    SFMobileSyncReactBridge,
    MobileSyncReactBridge,
    successCB,
    errorCB,
    methodName,
    args
  );
};

export const syncDown = (
  storeConfig: StoreConfig,
  target: SyncDownTarget,
  soupName: string,
  options: SyncDownOptions,
  syncName: string | undefined,
  successCB: (result: any) => void,
  errorCB: (err: Error) => void
): void => {
  storeConfig = checkFirstArg(storeConfig);
  // syncName optional (new in 6.0)
  if (typeof syncName === "function") {
    errorCB = successCB;
    successCB = syncName;
    syncName = undefined;
  }
  exec(successCB, errorCB, "syncDown", {
    target: target,
    soupName: soupName,
    options: options,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
    syncName: syncName,
  });
};

export const reSync = (
  storeConfig: StoreConfig,
  syncIdOrName: string,
  successCB: (result: any) => void,
  errorCB: (err: Error) => void
): void => {
  storeConfig = checkFirstArg(storeConfig);
  exec(successCB, errorCB, "reSync", {
    syncId: typeof syncIdOrName === "string" ? null : syncIdOrName,
    syncName: typeof syncIdOrName === "string" ? syncIdOrName : null,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const cleanResyncGhosts = (
  storeConfig: StoreConfig,
  syncId: string,
  successCB: (result: any) => void,
  errorCB: (err: Error) => void
): void => {
  storeConfig = checkFirstArg(storeConfig);
  exec(successCB, errorCB, "cleanResyncGhosts", {
    syncId: syncId,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const syncUp = (
  storeConfig: StoreConfig,
  target: SyncDownTarget,
  soupName: string,
  options: SyncDownOptions,
  syncName: string | undefined,
  successCB: (result: any) => void,
  errorCB: (err: Error) => void
): void => {
  storeConfig = checkFirstArg(storeConfig);
  // syncName optional (new in 6.0)
  if (typeof syncName === "function") {
    errorCB = successCB;
    successCB = syncName;
    syncName = undefined;
  }
  exec(successCB, errorCB, "syncUp", {
    target: target,
    soupName: soupName,
    options: options,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
    syncName: syncName,
  });
};

export const getSyncStatus = (
  storeConfig: StoreConfig,
  syncIdOrName: string,
  successCB: (result: any) => void,
  errorCB: (err: Error) => void
): void => {
  storeConfig = checkFirstArg(storeConfig);
  exec(successCB, errorCB, "getSyncStatus", {
    syncId: typeof syncIdOrName === "string" ? null : syncIdOrName,
    syncName: typeof syncIdOrName === "string" ? syncIdOrName : null,
    isGlobalStore: storeConfig.isGlobalStore,
    storeName: storeConfig.storeName,
  });
};

export const deleteSync = (
  storeConfig: StoreConfig,
  syncIdOrName: string,
  successCB: (result: any) => void,
  errorCB: (err: Error) => void
): void => {
  storeConfig = checkFirstArg(storeConfig);
  exec(successCB, errorCB, "deleteSync", {
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
