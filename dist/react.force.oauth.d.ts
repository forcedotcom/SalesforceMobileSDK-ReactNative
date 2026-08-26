import { ExecSuccessCallback, ExecErrorCallback } from "./react.force.common";
import { UserAccount } from "./typings/oauth";
/**
 * Initiates the authentication process, with the given app configuration.
 *   success         - The success callback function to use.
 *   fail            - The failure/error callback function to use.
 * Returns a dictionary with:
 *   accessToken
 *   refreshToken
 *   clientId
 *   userId
 *   orgId
 *   loginUrl
 *   instanceUrl
 *   userAgent
 *   community id
 *   community url
 */
export declare const authenticate: (successCB: ExecSuccessCallback<UserAccount>, errorCB: ExecErrorCallback) => void;
/**
 * Obtain authentication credentials.
 *   success - The success callback function to use.
 *   fail    - The failure/error callback function to use.
 * Returns a dictionary with:
 *   accessToken
 *   refreshToken
 *   clientId
 *   userId
 *   orgId
 *   loginUrl
 *   instanceUrl
 *   userAgent
 *   community id
 *   community url
 */
export declare const getAuthCredentials: (successCB: ExecSuccessCallback<UserAccount>, errorCB: ExecErrorCallback) => void;
/**
 * Logout the current authenticated user. This removes any current valid session token
 * as well as any OAuth refresh token.
 */
export declare const logout: <T>(success: ExecSuccessCallback<T>, fail: ExecErrorCallback) => void;
