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
exports.safeJSONparse = exports.exec = void 0;
const react_force_log_1 = require("./react.force.log");
/**
 * Executes an action using the React Native Mobile SDK Bridge.
 * Both iOS and Android use a unified single-callback pattern:
 * callback(error, result) where error is null on success.
 */
const exec = (moduleIOSName, moduleAndroidName, moduleIOS, moduleAndroid, successCB, errorCB, methodName, args) => {
    const module = moduleIOS ?? moduleAndroid;
    const moduleName = moduleIOS ? moduleIOSName : moduleAndroidName;
    if (!module) {
        react_force_log_1.sdkConsole.error(`No native module found for ${moduleIOSName}/${moduleAndroidName}`);
        if (errorCB)
            errorCB(new Error("Native module not available"));
        return;
    }
    const func = `${moduleName}.${methodName}`;
    react_force_log_1.sdkConsole.debug(`${func} called: ${JSON.stringify(args)}`);
    module[methodName](args, (error, result) => {
        if (error) {
            react_force_log_1.sdkConsole.error(`${func} failed: ${JSON.stringify(error)}`);
            if (errorCB)
                errorCB(typeof error === "string" ? (0, exports.safeJSONparse)(error) : error);
        }
        else {
            react_force_log_1.sdkConsole.debug(`${func} succeeded`);
            if (successCB)
                successCB(typeof result === "string" ? (0, exports.safeJSONparse)(result) : result);
        }
    });
};
exports.exec = exec;
/**
 * Parses a JSON string safely, returning the original value if parsing fails.
 */
const safeJSONparse = (str) => {
    try {
        return JSON.parse(str);
    }
    catch (e) {
        // @ts-ignore
        return str;
    }
};
exports.safeJSONparse = safeJSONparse;
//# sourceMappingURL=react.force.common.js.map