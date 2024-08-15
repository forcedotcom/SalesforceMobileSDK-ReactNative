export declare type OAuthMethod = "authenticate" | "getAuthCredentials" | "logoutCurrentUser";
export declare type UserAccount = {
    accessToken: string;
    clientId: string;
    instanceUrl: string;
    loginUrl: string;
    orgId: string;
    refreshToken: string;
    userAgent: string;
    userId: string;
};
