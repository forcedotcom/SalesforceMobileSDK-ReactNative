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
exports.logout = exports.getAuthCredentials = exports.authenticate = void 0;
const react_native_1 = require("react-native");
const react_force_common_1 = require("./react.force.common");
// Lazy module lookup: modules may not be available at import time in bridgeless mode.
const getSFOauthReactBridge = () => react_native_1.TurboModuleRegistry.get("SFOauthReactBridge") ?? react_native_1.NativeModules.SFOauthReactBridge;
const getSalesforceOauthReactBridge = () => react_native_1.TurboModuleRegistry.get("SalesforceOauthReactBridge") ??
    react_native_1.NativeModules.SalesforceOauthReactBridge;
const exec = (successCB, errorCB, methodName, args) => {
    (0, react_force_common_1.exec)("SFOauthReactBridge", "SalesforceOauthReactBridge", getSFOauthReactBridge(), getSalesforceOauthReactBridge(), successCB, errorCB, methodName, args);
};
/**
 * Initiates the authentication process, with the given app configuration.
 *   success         - The success callback function to use.
 *   fail            - The failure/error callback function to use.
 * Returns a dictionary with:
 *   accessToken
 *   refreshToken
 *   clientId
 *   userId
 *   orgId
 *   loginUrl
 *   instanceUrl
 *   userAgent
 *   community id
 *   community url
 */
const authenticate = (successCB, errorCB) => {
    exec(successCB, errorCB, "authenticate", {});
};
exports.authenticate = authenticate;
/**
 * Obtain authentication credentials.
 *   success - The success callback function to use.
 *   fail    - The failure/error callback function to use.
 * Returns a dictionary with:
 *   accessToken
 *   refreshToken
 *   clientId
 *   userId
 *   orgId
 *   loginUrl
 *   instanceUrl
 *   userAgent
 *   community id
 *   community url
 */
const getAuthCredentials = (successCB, errorCB) => {
    exec(successCB, errorCB, "getAuthCredentials", {});
};
exports.getAuthCredentials = getAuthCredentials;
/**
 * Logout the current authenticated user. This removes any current valid session token
 * as well as any OAuth refresh token.
 */
const logout = (success, fail) => {
    // @ts-ignore
    exec(success, fail, "logoutCurrentUser", {});
};
exports.logout = logout;
//# sourceMappingURL=react.force.oauth.js.map