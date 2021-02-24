"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeoutPromiser = exports.promiserNoRejection = exports.promiser = void 0;
const react_force_log_1 = require("./react.force.log");
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