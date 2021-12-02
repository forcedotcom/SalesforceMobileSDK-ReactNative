"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeJSONparse = exports.exec = void 0;
const react_force_log_1 = require("./react.force.log");
const exec = (moduleIOSName, moduleAndroidName, moduleIOS, moduleAndroid, successCB, errorCB, methodName, args) => {
    if (moduleIOS) {
        const func = `${moduleIOSName}.${methodName}`;
        react_force_log_1.sdkConsole.debug(`${func} called: ${JSON.stringify(args)}`);
        moduleIOS[methodName](args, (error, result) => {
            if (error) {
                react_force_log_1.sdkConsole.error(`${func} failed: ${JSON.stringify(error)}`);
                if (errorCB)
                    errorCB(error);
            }
            else {
                react_force_log_1.sdkConsole.debug(`${func} succeeded`);
                if (successCB)
                    successCB(result);
            }
        });
    }
    else if (moduleAndroid) {
        const func = `${moduleAndroidName}.${methodName}`;
        react_force_log_1.sdkConsole.debug(`${func} called: ${JSON.stringify(args)}`);
        moduleAndroid[methodName](args, (result) => {
            react_force_log_1.sdkConsole.debug(`${func} succeeded`);
            if (successCB) {
                successCB((0, exports.safeJSONparse)(result));
            }
        }, (error) => {
            react_force_log_1.sdkConsole.error(`${func} failed: ${JSON.stringify(error)}`);
            if (errorCB)
                errorCB((0, exports.safeJSONparse)(error));
        });
    }
};
exports.exec = exec;
const safeJSONparse = (str) => {
    try {
        return JSON.parse(str);
    }
    catch (e) {
        return str;
    }
};
exports.safeJSONparse = safeJSONparse;
//# sourceMappingURL=react.force.common.js.map