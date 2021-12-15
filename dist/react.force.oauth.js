"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getAuthCredentials = exports.authenticate = void 0;
const react_native_1 = require("react-native");
const react_force_common_1 = require("./react.force.common");
const { SalesforceOauthReactBridge, SFOauthReactBridge } = react_native_1.NativeModules;
const exec = (successCB, errorCB, methodName, args) => {
    (0, react_force_common_1.exec)("SFOauthReactBridge", "SalesforceOauthReactBridge", SFOauthReactBridge, SalesforceOauthReactBridge, successCB, errorCB, methodName, args);
};
const authenticate = (successCB, errorCB) => {
    exec(successCB, errorCB, "authenticate", {});
};
exports.authenticate = authenticate;
const getAuthCredentials = (successCB, errorCB) => {
    exec(successCB, errorCB, "getAuthCredentials", {});
};
exports.getAuthCredentials = getAuthCredentials;
const logout = (success, fail) => {
    exec(success, fail, "logoutCurrentUser", {});
};
exports.logout = logout;
//# sourceMappingURL=react.force.oauth.js.map