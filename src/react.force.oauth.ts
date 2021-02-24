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
import { Authenticate, GetAuthCredentials, Logout, OAuthMethod, UserAccount } from "./typings/oauth";
const { SalesforceOauthReactBridge, SFOauthReactBridge } = NativeModules;

const exec = <T>(
  successCB: ExecSuccessCallback<T> | undefined,
  errorCB: ExecErrorCallback | undefined,
  methodName: OAuthMethod,
  args: Record<string, unknown>,
): Promise<T> | void => {
  if (successCB && errorCB) {
    forceExec(
      "SFOauthReactBridge",
      "SalesforceOauthReactBridge",
      SFOauthReactBridge,
      SalesforceOauthReactBridge,
      successCB,
      errorCB,
      methodName,
      args,
    );
  } else {
    return new Promise((resolve, reject) => {
      forceExec(
        "SFOauthReactBridge",
        "SalesforceOauthReactBridge",
        SFOauthReactBridge,
        SalesforceOauthReactBridge,
        resolve,
        reject,
        methodName,
        args,
      );
    });
  }
};

/**
 * Initiates the authentication process, with the given app configuration.
 * @param successCB
 * @param errorCB
 */
export const authenticate: Authenticate = (
  successCB?: ExecSuccessCallback<UserAccount>,
  errorCB?: ExecErrorCallback,
): any => {
  return exec(successCB, errorCB, "authenticate", {});
};

/**
 * Obtain authentication credentials.
 * @param successCB
 * @param errorCB
 */
export const getAuthCredentials: GetAuthCredentials = (
  successCB?: ExecSuccessCallback<UserAccount>,
  errorCB?: ExecErrorCallback,
): any => {
  return exec(successCB, errorCB, "getAuthCredentials", {});
};

/**
 * Logout the current authenticated user. This removes any current valid session
 * token as well as any OAuth refresh token.
 * @param successCB
 * @param errorCB
 */
export const logout: Logout = <T>(successCB?: ExecSuccessCallback<T>, errorCB?: ExecErrorCallback): any => {
  return exec(successCB, errorCB, "logoutCurrentUser", {});
};
