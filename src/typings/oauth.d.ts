import { ExecErrorCallback, ExecSuccessCallback } from "../react.force.common";

export type OAuthMethod = "authenticate" | "getAuthCredentials" | "logoutCurrentUser";

export type UserAccount = {
  accessToken: string;
  clientId: string;
  instanceUrl: string;
  loginUrl: string;
  orgId: string;
  refreshToken: string;
  userAgent: string;
  userId: string;
};

export type Authenticate = {
  (): Promise<UserAccount>;
  (successCB: ExecSuccessCallback<UserAccount>, errorCB: ExecErrorCallback): void;
};

export type GetAuthCredentials = {
  (): Promise<UserAccount>;
  (successCB: ExecSuccessCallback<UserAccount>, errorCB: ExecErrorCallback): void;
};

export type Logout = {
  (): Promise<UserAccount>;
  (successCB: ExecSuccessCallback<UserAccount>, errorCB: ExecErrorCallback): void;
};
