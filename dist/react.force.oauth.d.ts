import { ExecSuccessCallback, ExecErrorCallback } from "./react.force.common";
import { UserAccount } from "./typings/oauth";
export declare const authenticate: (successCB: ExecSuccessCallback<UserAccount>, errorCB: ExecErrorCallback) => void;
export declare const getAuthCredentials: (successCB: ExecSuccessCallback<UserAccount>, errorCB: ExecErrorCallback) => void;
export declare const logout: <T>(success: ExecSuccessCallback<T>, fail: ExecErrorCallback) => void;
export declare const updateAccessToken: (successCB: ExecSuccessCallback<UserAccount>, errorCB: ExecErrorCallback) => void;