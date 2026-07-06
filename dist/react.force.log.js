"use strict";
/*
 * Copyright (c) 2020-present, salesforce.com, inc.
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
exports.setLogLevel = exports.sdkConsole = exports.getLogLevel = void 0;
/**
 * logging support
 */
let logLevel = "info";
const getLogLevel = () => {
    return logLevel;
};
exports.getLogLevel = getLogLevel;
exports.sdkConsole = {
    debug: console.debug.bind(console),
    info: console.info.bind(console),
    warn: () => {
        /** */
    },
    error: () => {
        /** */
    },
    log: console.log.bind(console),
};
const setLogLevel = (level) => {
    logLevel = level;
    const methods = ["debug", "info", "warn", "error"];
    const levelAsInt = methods.indexOf(level.toLowerCase());
    const noop = () => {
        /** */
    };
    exports.sdkConsole.debug = levelAsInt <= 0 ? console.debug.bind(console) : noop;
    exports.sdkConsole.info = levelAsInt <= 1 ? console.info.bind(console) : noop;
    exports.sdkConsole.warn = levelAsInt <= 2 ? console.log.bind(console) : noop; // we don't want the yellow box
    exports.sdkConsole.error = levelAsInt <= 3 ? console.log.bind(console) : noop; // we don't want the red box
    exports.sdkConsole.log = console.log.bind(console);
};
exports.setLogLevel = setLogLevel;
(0, exports.setLogLevel)("info");
//# sourceMappingURL=react.force.log.js.map