import { ModuleAndroidName, ModuleIOSName } from "./typings";
/**
 * Represents an exec() success callback
 */
export type ExecSuccessCallback<T> = (result: T) => void;
/**
 * Represents an exec() error callback
 */
export type ExecErrorCallback = (err: Error) => void;
/**
 * Represents a native module with unified single-callback pattern.
 * Both iOS and Android now use: module.method(args, (error, result) => {...})
 */
interface NativeModule {
    [key: string]: (args: unknown, callback: (error: any, result: any) => void) => void;
}
/**
 * Executes an action using the React Native Mobile SDK Bridge.
 * Both iOS and Android use a unified single-callback pattern:
 * callback(error, result) where error is null on success.
 */
export declare const exec: <T>(moduleIOSName: ModuleIOSName, moduleAndroidName: ModuleAndroidName, moduleIOS: NativeModule, moduleAndroid: NativeModule, successCB: ExecSuccessCallback<T> | null, errorCB: ExecErrorCallback | null, methodName: string, args: Record<string, unknown>) => void;
/**
 * Parses a JSON string safely, returning the original value if parsing fails.
 */
export declare const safeJSONparse: <T>(str: string) => T;
export {};
