/*
 * Copyright (c) 2018-present, salesforce.com, inc.
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
import timer from "react-native-timer";
const rejectionTracking = require("promise/setimmediate/rejection-tracking");

const enableErrorOnUnhandledPromiseRejection = (): void => {
  rejectionTracking.enable({
    allRejections: true,
    onUnhandled: (_: unknown, error: Error) => {
      const strError = JSON.stringify(error);
      sdkConsole.error("Unhandled promise rejection with error: " + strError);
    },
    onHandled: () => {},
  });
};

export const promiser = (func: Function): (() => Promise<unknown>) => {
  enableErrorOnUnhandledPromiseRejection();
  const retfn = function () {
    const args = Array.prototype.slice.call(arguments);

    return new Promise(function (resolve, reject) {
      args.push(function () {
        try {
          resolve.apply(null, arguments);
        } catch (err) {
          sdkConsole.error("Error when calling successCB for " + func.name);
          sdkConsole.error(err.stack);
        }
      });
      args.push(function () {
        try {
          reject.apply(null, arguments);
        } catch (err) {
          sdkConsole.error("Error when calling errorCB for " + func.name);
          sdkConsole.error(err.stack);
        }
      });
      sdkConsole.debug("Calling " + func.name);
      func.apply(null, args);
    });
  };
  return retfn;
};

export const promiserNoRejection = (
  func: Function
): (() => Promise<unknown>) => {
  enableErrorOnUnhandledPromiseRejection();
  const retfn = function () {
    const args = Array.prototype.slice.call(arguments);

    return new Promise(function (resolve, reject) {
      // then() will be called whether it succeeded or failed
      const callback = () => {
        try {
          resolve.apply(null, arguments);
        } catch (err) {
          sdkConsole.error("Error when calling callback for " + func.name);
          sdkConsole.error(err.stack);
        }
      };
      args.push(callback);
      args.push(callback);
      sdkConsole.debug("Calling " + func.name);
      func.apply(null, args);
    });
  };
  return retfn;
};

export const timeoutPromiser = (millis: number): Promise<void> => {
  return new Promise((resolve) => {
    timer.setTimeout(
      "timeoutTimer",
      () => {
        resolve();
      },
      millis
    );
  });
};
