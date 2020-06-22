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
const { SalesforceOauthReactBridge, SFOauthReactBridge } = NativeModules;
import { exec as forceExec } from "./react.force.common";

const exec = (
  successCB: ((result?: any) => void) | null,
  errorCB: ((err: Error) => void) | null,
  methodName: string,
  args: Record<string, unknown>
): void => {
  forceExec(
    "SFOauthReactBridge",
    "SalesforceOauthReactBridge",
    SFOauthReactBridge,
    SalesforceOauthReactBridge,
    successCB,
    errorCB,
    methodName,
    args
  );
};

/**
 * Whether or not logout has already been initiated.  Can only be initiated once
 * per page load.
 */
let logoutInitiated = false;

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
export const authenticate = (
  successCB: (result: any) => void,
  errorCB: (err: Error) => void
): void => {
  exec(successCB, errorCB, "authenticate", {});
};

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
export const getAuthCredentials = (
  successCB: (result: any) => void,
  errorCB: (err: Error) => void
): void => {
  exec(successCB, errorCB, "getAuthCredentials", {});
};

/**
 * Logout the current authenticated user. This removes any current valid session token
 * as well as any OAuth refresh token.  The user is forced to login again.
 * This method does not call back with a success or failure callback, as
 * (1) this method must not fail and (2) in the success case, the current user
 * will be logged out and asked to re-authenticate.  Note also that this method can only
 * be called once per page load.  Initiating logout will ultimately redirect away from
 * the given page (effectively resetting the logout flag), and calling this method again
 * while it's currently processing will result in app state issues.
 */
export const logout = (): void => {
  // only set callback for android, since iOS will not invoke callback.
  const logoutCb = SalesforceOauthReactBridge
    ? () => {
        logoutInitiated = false;
      }
    : null;
  if (!logoutInitiated) {
    logoutInitiated = true;
    exec(logoutCb, null, "logoutCurrentUser", {});
  }
};
