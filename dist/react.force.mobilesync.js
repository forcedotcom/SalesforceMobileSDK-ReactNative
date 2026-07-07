"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetSyncManager = exports.MERGE_MODE = exports.deleteSync = exports.getSyncStatus = exports.syncUp = exports.cleanResyncGhosts = exports.reSync = exports.syncDown = void 0;
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
const react_native_1 = require("react-native");
const react_force_common_1 = require("./react.force.common");
// New architecture: TurboModuleRegistry first, fall back to NativeModules.
// Lazy lookup - bridgeless mode doesn't have modules ready at import time.
const getSFMobileSyncReactBridge = () => react_native_1.TurboModuleRegistry.get("SFMobileSyncReactBridge") ?? react_native_1.NativeModules.SFMobileSyncReactBridge;
const getMobileSyncReactBridge = () => react_native_1.TurboModuleRegistry.get("MobileSyncReactBridge") ?? react_native_1.NativeModules.MobileSyncReactBridge;
// If param is a storeconfig return the same storeconfig
// If param is a boolean, returns a storeconfig object  {'isGlobalStore': boolean}
// Otherwise, returns a default storeconfig object
const checkFirstArg = (arg) => {
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
const exec = (successCB, errorCB, methodName, args) => {
    (0, react_force_common_1.exec)("SFMobileSyncReactBridge", "MobileSyncReactBridge", getSFMobileSyncReactBridge(), getMobileSyncReactBridge(), successCB, errorCB, methodName, args);
};
const syncDown = (storeConfig, target, soupName, options, x, y, z) => {
    storeConfig = checkFirstArg(storeConfig);
    let syncName;
    let successCB;
    let errorCB;
    // syncName optional (new in 6.0)
    if (typeof x === "function") {
        syncName = undefined;
        successCB = x;
        errorCB = y;
    }
    else {
        syncName = x;
        successCB = y;
        errorCB = z;
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
exports.syncDown = syncDown;
const reSync = (storeConfig, syncIdOrName, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "reSync", {
        syncId: typeof syncIdOrName === "string" ? null : syncIdOrName,
        syncName: typeof syncIdOrName === "string" ? syncIdOrName : null,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.reSync = reSync;
const cleanResyncGhosts = (storeConfig, syncId, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "cleanResyncGhosts", {
        syncId: syncId,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.cleanResyncGhosts = cleanResyncGhosts;
const syncUp = (storeConfig, target, soupName, options, x, y, z) => {
    storeConfig = checkFirstArg(storeConfig);
    let syncName;
    let successCB;
    let errorCB;
    // syncName optional (new in 6.0)
    if (typeof x === "function") {
        syncName = undefined;
        successCB = x;
        errorCB = y;
    }
    else {
        syncName = x;
        successCB = y;
        errorCB = z;
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
exports.syncUp = syncUp;
const getSyncStatus = (storeConfig, syncIdOrName, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "getSyncStatus", {
        syncId: typeof syncIdOrName === "string" ? null : syncIdOrName,
        syncName: typeof syncIdOrName === "string" ? syncIdOrName : null,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.getSyncStatus = getSyncStatus;
const deleteSync = (storeConfig, syncIdOrName, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "deleteSync", {
        syncId: typeof syncIdOrName === "string" ? null : syncIdOrName,
        syncName: typeof syncIdOrName === "string" ? syncIdOrName : null,
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.deleteSync = deleteSync;
exports.MERGE_MODE = {
    OVERWRITE: "OVERWRITE",
    LEAVE_IF_CHANGED: "LEAVE_IF_CHANGED",
};
const resetSyncManager = (storeConfig, successCB, errorCB) => {
    storeConfig = checkFirstArg(storeConfig);
    exec(successCB, errorCB, "resetSyncManager", {
        isGlobalStore: storeConfig.isGlobalStore,
        storeName: storeConfig.storeName,
    });
};
exports.resetSyncManager = resetSyncManager;
//# sourceMappingURL=react.force.mobilesync.js.map