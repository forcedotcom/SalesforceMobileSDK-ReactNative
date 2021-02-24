import { ModuleAndroidName, ModuleIOSName } from "./typings";
export declare type iOSModuleCallback<T> = (err: Error, result: T) => void;
export declare type AndroidSuccessCallback = (result: string) => void;
export declare type AndroidErrorCallback = (err: string) => void;
export declare type ExecSuccessCallback<T> = (result: T) => void;
export declare type ExecErrorCallback = (err: Error) => void;
interface ModuleIOS<T> {
    [key: string]: (args: unknown, callback: iOSModuleCallback<T>) => void;
}
interface ModuleAndroid {
    [key: string]: (args: unknown, successCB: AndroidSuccessCallback, errorCB: AndroidErrorCallback) => void;
}
export declare const exec: <T>(moduleIOSName: ModuleIOSName, moduleAndroidName: ModuleAndroidName, moduleIOS: ModuleIOS<T>, moduleAndroid: ModuleAndroid, successCB: ExecSuccessCallback<T> | null, errorCB: ExecErrorCallback | null, methodName: string, args: Record<string, unknown>) => void;
export declare const safeJSONparse: <T>(str: string) => T;
export {};
