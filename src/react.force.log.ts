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

import { SDKConsole, LogLevel } from "./typings";

/**
 * logging support
 */
let logLevel: LogLevel = "info";

export const getLogLevel = (): string => {
  return logLevel;
};

export const sdkConsole: SDKConsole = {
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: () => {},
  error: () => {},
  log: console.log.bind(console),
};

export const setLogLevel = (level: LogLevel): void => {
  logLevel = level;
  const methods = ["debug", "info", "warn", "error"];
  const levelAsInt = methods.indexOf(level.toLowerCase());
  const noop = () => {};

  sdkConsole.debug = levelAsInt <= 0 ? console.debug.bind(console) : noop;
  sdkConsole.info = levelAsInt <= 1 ? console.info.bind(console) : noop;
  sdkConsole.warn = levelAsInt <= 2 ? console.log.bind(console) : noop; // we don't want the yellow box
  sdkConsole.error = levelAsInt <= 3 ? console.log.bind(console) : noop; // we don't want the red box
  sdkConsole.log = console.log.bind(console);
};

setLogLevel("info");
