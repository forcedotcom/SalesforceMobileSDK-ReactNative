"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLogLevel = exports.sdkConsole = exports.getLogLevel = void 0;
let logLevel = "info";
const getLogLevel = () => {
    return logLevel;
};
exports.getLogLevel = getLogLevel;
exports.sdkConsole = {
    debug: console.debug.bind(console),
    info: console.info.bind(console),
    warn: () => {
    },
    error: () => {
    },
    log: console.log.bind(console),
};
const setLogLevel = (level) => {
    logLevel = level;
    const methods = ["debug", "info", "warn", "error"];
    const levelAsInt = methods.indexOf(level.toLowerCase());
    const noop = () => {
    };
    exports.sdkConsole.debug = levelAsInt <= 0 ? console.debug.bind(console) : noop;
    exports.sdkConsole.info = levelAsInt <= 1 ? console.info.bind(console) : noop;
    exports.sdkConsole.warn = levelAsInt <= 2 ? console.log.bind(console) : noop;
    exports.sdkConsole.error = levelAsInt <= 3 ? console.log.bind(console) : noop;
    exports.sdkConsole.log = console.log.bind(console);
};
exports.setLogLevel = setLogLevel;
(0, exports.setLogLevel)("info");
//# sourceMappingURL=react.force.log.js.map