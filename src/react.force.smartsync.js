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

'use strict';

var { SmartSyncReactBridge, SFSmartSyncReactBridge } = require('react-native').NativeModules;
var forceCommon = require('./react.force.common.js');

var exec = function(successCB, errorCB, methodName, args) {
    forceCommon.exec("SFSmartSyncReactBridge", "SmartSyncReactBridge", SFSmartSyncReactBridge, SmartSyncReactBridge, successCB, errorCB, methodName, args);
};

var syncDown = function(isGlobalStore, target, soupName, options, successCB, errorCB) {
    exec(successCB, errorCB, "syncDown", {"target": target, "soupName": soupName, "options": options, "isGlobalStore":isGlobalStore});        
};

var reSync = function(isGlobalStore, syncId, successCB, errorCB) {
    exec(successCB, errorCB, "reSync", {"syncId": syncId, "isGlobalStore":isGlobalStore});        
};

var cleanResyncGhosts = function(isGlobalStore, syncId, successCB, errorCB) {
    exec(successCB, errorCB, "cleanResyncGhosts", {"syncId": syncId, "isGlobalStore":isGlobalStore});        
};

var syncUp = function(isGlobalStore, target, soupName, options, successCB, errorCB) {
    exec(successCB, errorCB, "syncUp", {"target": target, "soupName": soupName, "options": options, "isGlobalStore":isGlobalStore});        
};

var getSyncStatus = function(isGlobalStore, syncId, successCB, errorCB) {
    exec(successCB, errorCB, "getSyncStatus", {"syncId": syncId, "isGlobalStore":isGlobalStore});        
};

var MERGE_MODE = {
    OVERWRITE: "OVERWRITE",
    LEAVE_IF_CHANGED: "LEAVE_IF_CHANGED"
};

/**
 * Part of the module that is public.
 */
module.exports = {
    MERGE_MODE: MERGE_MODE,
    syncDown: syncDown,
    syncUp: syncUp,
    getSyncStatus: getSyncStatus,
    reSync: reSync,
    cleanResyncGhosts: cleanResyncGhosts
};
