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

import { sdkConsole } from "./react.force.log";
import { ModuleAndroidName, ModuleIOSName } from "./typings";

/**
 * Represents an exec() success callback
 */
export type ExecSuccessCallback<T> = (result: T) => void;

/**
 * Represents an exec() error callback
 */
export type ExecErrorCallback = (err: Error) => void;

/**
 * Represents a native module with unified single-callback pattern.
 * Both iOS and Android now use: module.method(args, (error, result) => {...})
 */
interface NativeModule {
  [key: string]: (args: unknown, callback: (error: any, result: any) => void) => void;
}

/**
 * Executes an action using the React Native Mobile SDK Bridge.
 * Both iOS and Android use a unified single-callback pattern:
 * callback(error, result) where error is null on success.
 */
export const exec = <T>(
  moduleIOSName: ModuleIOSName,
  moduleAndroidName: ModuleAndroidName,
  moduleIOS: NativeModule,
  moduleAndroid: NativeModule,
  successCB: ExecSuccessCallback<T> | null,
  errorCB: ExecErrorCallback | null,
  methodName: string,
  args: Record<string, unknown>,
): void => {
  const module = moduleIOS ?? moduleAndroid;
  const moduleName = moduleIOS ? moduleIOSName : moduleAndroidName;

  if (!module) {
    sdkConsole.error(`No native module found for ${moduleIOSName}/${moduleAndroidName}`);
    if (errorCB) errorCB(new Error("Native module not available"));
    return;
  }

  const func = `${moduleName}.${methodName}`;
  sdkConsole.debug(`${func} called: ${JSON.stringify(args)}`);

  module[methodName](args, (error: any, result: any) => {
    if (error) {
      sdkConsole.error(`${func} failed: ${JSON.stringify(error)}`);
      if (errorCB) errorCB(typeof error === "string" ? safeJSONparse(error) : error);
    } else {
      sdkConsole.debug(`${func} succeeded`);
      if (successCB) successCB(typeof result === "string" ? safeJSONparse(result) : result);
    }
  });
};

/**
 * Parses a JSON string safely, returning the original value if parsing fails.
 */
export const safeJSONparse = <T>(str: string): T => {
  try {
    return JSON.parse(str);
  } catch (e) {
    // @ts-ignore
    return str;
  }
};
