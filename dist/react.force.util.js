"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeoutPromiser = exports.promiserNoRejection = exports.promiser = void 0;
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
const react_force_log_1 = require("./react.force.log");
// @ts-ignore
const react_native_timer_1 = __importDefault(require("react-native-timer"));
const rejectionTracking = require("promise/setimmediate/rejection-tracking");
const enableErrorOnUnhandledPromiseRejection = () => {
    rejectionTracking.enable({
        allRejections: true,
        onUnhandled: (_, error) => {
            const strError = JSON.stringify(error);
            react_force_log_1.sdkConsole.error("Unhandled promise rejection with error: " + strError);
        },
        onHandled: () => { },
    });
};
const promiser = (func) => {
    enableErrorOnUnhandledPromiseRejection();
    const retfn = function () {
        const args = Array.prototype.slice.call(arguments);
        return new Promise(function (resolve, reject) {
            args.push(function () {
                try {
                    resolve.apply(null, arguments);
                }
                catch (err) {
                    react_force_log_1.sdkConsole.error("Error when calling successCB for " + func.name);
                    react_force_log_1.sdkConsole.error(err.stack);
                }
            });
            args.push(function () {
                try {
                    reject.apply(null, arguments);
                }
                catch (err) {
                    react_force_log_1.sdkConsole.error("Error when calling errorCB for " + func.name);
                    react_force_log_1.sdkConsole.error(err.stack);
                }
            });
            react_force_log_1.sdkConsole.debug("Calling " + func.name);
            func.apply(null, args);
        });
    };
    return retfn;
};
exports.promiser = promiser;
const promiserNoRejection = (func) => {
    enableErrorOnUnhandledPromiseRejection();
    const retfn = function () {
        const args = Array.prototype.slice.call(arguments);
        return new Promise(function (resolve) {
            // then() will be called whether it succeeded or failed
            const callback = () => {
                try {
                    resolve.apply(null, arguments);
                }
                catch (err) {
                    react_force_log_1.sdkConsole.error("Error when calling callback for " + func.name);
                    react_force_log_1.sdkConsole.error(err.stack);
                }
            };
            args.push(callback);
            args.push(callback);
            react_force_log_1.sdkConsole.debug("Calling " + func.name);
            func.apply(null, args);
        });
    };
    return retfn;
};
exports.promiserNoRejection = promiserNoRejection;
const timeoutPromiser = (millis) => {
    return new Promise((resolve) => {
        react_native_timer_1.default.setTimeout("timeoutTimer", () => {
            resolve();
        }, millis);
    });
};
exports.timeoutPromiser = timeoutPromiser;
//# sourceMappingURL=react.force.util.js.map