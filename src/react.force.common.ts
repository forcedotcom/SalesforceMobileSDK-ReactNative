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
import { ModuleIOSName, ModuleAndroidName } from "./typings";

/**
 * Represents an iOS Module callback
 */
export type iOSModuleCallback<T> = (err: Error, result: T) => void;

/**
 * Represents an Android Module success callback
 */
export type AndroidSuccessCallback = (result: string) => void;

/**
 * Represents an Android Module error callback
 */
export type AndroidErrorCallback = (err: string) => void;

/**
 * Represents an exec() success callback
 */
export type ExecSuccessCallback<T> = (result: T) => void;

/**
 * Represents an exec() error callback
 */
export type ExecErrorCallback = (err: Error) => void;

/**
 * Represents a Mobile SDK iOS Module
 *
 * @interface ModuleIOS
 * @template T
 */
interface ModuleIOS<T> {
  [key: string]: (args: unknown, callback: iOSModuleCallback<T>) => void;
}

/**
 * Represents a Mobile SDK Android Module
 *
 * @interface ModuleAndroid
 */
interface ModuleAndroid {
  [key: string]: (
    args: unknown,
    successCB: AndroidSuccessCallback,
    errorCB: AndroidErrorCallback
  ) => void;
}

/**
 * Executes an action using the React Native Mobile SDK Bridge
 *
 * @template T
 * @param {ModuleIOSName} moduleIOSName
 * @param {ModuleAndroidName} moduleAndroidName
 * @param {ModuleIOS<T>} moduleIOS
 * @param {ModuleAndroid<T>} moduleAndroid
 * @param {ExecSuccessCallback<T> | null} successCB
 * @param {ExecErrorCallback | null} errorCB
 * @param {string} methodName
 * @param {Record<string, unknown>} argsaight
 */
export const exec = <T>(
  moduleIOSName: ModuleIOSName,
  moduleAndroidName: ModuleAndroidName,
  moduleIOS: ModuleIOS<T>,
  moduleAndroid: ModuleAndroid,
  successCB: ExecSuccessCallback<T> | null,
  errorCB: ExecErrorCallback | null,
  methodName: string,
  args: Record<string, unknown>
): void => {
  if (moduleIOS) {
    const func = `${moduleIOSName}.${methodName}`;
    sdkConsole.debug(`${func} called: ${JSON.stringify(args)}`);

    moduleIOS[methodName](args, (error: Error, result) => {
      if (error) {
        sdkConsole.error(`${func} failed: ${JSON.stringify(error)}`);
        if (errorCB) errorCB(error);
      } else {
        sdkConsole.debug(`${func} succeeded`);
        if (successCB) successCB(result);
      }
    });
  }
  // android
  else if (moduleAndroid) {
    const func = `${moduleAndroidName}.${methodName}`;
    sdkConsole.debug(`${func} called: ${JSON.stringify(args)}`);
    moduleAndroid[methodName](
      args,
      (result) => {
        sdkConsole.debug(`${func} succeeded`);
        if (successCB) {
          successCB(safeJSONparse(result));
        }
      },
      (error) => {
        sdkConsole.error(`${func} failed: ${JSON.stringify(error)}`);
        if (errorCB) errorCB(safeJSONparse(error));
      }
    );
  }
};

/**
 * Returns a parsed JSON Android result
 *
 * @template T
 * @param {string} str
 * @returns {T}
 */
export const safeJSONparse = <T>(str: string): T => {
  try {
    return JSON.parse(str);
  } catch (e) {
    // @ts-ignore
    return str;
  }
};
