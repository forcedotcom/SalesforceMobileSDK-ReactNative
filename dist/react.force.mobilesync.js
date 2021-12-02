"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MERGE_MODE = exports.deleteSync = exports.getSyncStatus = exports.syncUp = exports.cleanResyncGhosts = exports.reSync = exports.syncDown = void 0;
const react_native_1 = require("react-native");
const react_force_common_1 = require("./react.force.common");
const { MobileSyncReactBridge, SFMobileSyncReactBridge } = react_native_1.NativeModules;
const checkFirstArg = (arg) => {
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
    react_force_common_1.exec("SFMobileSyncReactBridge", "MobileSyncReactBridge", SFMobileSyncReactBridge, MobileSyncReactBridge, successCB, errorCB, methodName, args);
};
const syncDown = (storeConfig, target, soupName, options, x, y, z) => {
    storeConfig = checkFirstArg(storeConfig);
    let syncName;
    let successCB;
    let errorCB;
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
//# sourceMappingURL=react.force.mobilesync.js.map