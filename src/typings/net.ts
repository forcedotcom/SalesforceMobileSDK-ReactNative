import { HttpMethod } from ".";
import { ExecErrorCallback, ExecSuccessCallback } from "../react.force.common";

export type SendRequest = {
  <T>(
    endPoint: string,
    path: string,
    successCB: undefined,
    errorCB: undefined,
    method?: HttpMethod,
    payload?: Record<string, unknown> | null,
    headerParams?: Record<string, unknown> | null,
    fileParams?: unknown,
    returnBinary?: boolean,
    doesNotRequireAuthentication?: boolean,
  ): Promise<T> | void;
  <T>(
    endPoint: string,
    path: string,
    successCB: any,
    errorCB: any,
    method?: HttpMethod,
    payload?: Record<string, unknown> | null,
    headerParams?: Record<string, unknown> | null,
    fileParams?: unknown,
    returnBinary?: boolean,
    doesNotRequireAuthentication?: boolean,
  ): void;
};

export type Versions = {
  <T>(): Promise<T>;
  <T>(successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void;
};

export type Resources = {
  <T>(): Promise<T>;
  <T>(successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void;
};

export type DescribeGlobal = {
  <T>(): Promise<T>;
  <T>(successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void;
};

export type Metadata = {
  <T>(objtype: string): Promise<T>;
  <T>(objtype: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void;
};

export type Describe = {
  <T>(objtype: string): Promise<T>;
  <T>(objtype: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void;
};

export type DescribeLayout = {
  <T>(objtype: string, recordTypeId: string): Promise<T>;
  <T>(objtype: string, recordTypeId: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void;
};

export type Create = {
  <T>(objtype: string, fields: Record<string, unknown>): Promise<T>;
  <T>(
    objtype: string,
    fields: Record<string, unknown>,
    successCB: ExecSuccessCallback<T>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type Retrieve = {
  <T>(objtype: string, id: string, fieldlist: string[]): Promise<T>;
  <T>(
    objtype: string,
    id: string,
    fieldlist: string[],
    successCB: ExecSuccessCallback<T>,
    errorCB: ExecErrorCallback,
  ): void;
  <T>(objtype: string, id: string): Promise<T>;
  <T>(objtype: string, id: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void;
};

export type Upsert = {
  <T>(objtype: string, externalIdField: string, externalId: string, fields: Record<string, unknown>): Promise<T>;
  <T>(
    objtype: string,
    externalIdField: string,
    externalId: string,
    fields: Record<string, unknown>,
    successCB: ExecSuccessCallback<T>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type Update = {
  <T>(objtype: string, id: string, fields: Record<string, unknown>): Promise<T>;
  <T>(
    objtype: string,
    id: string,
    fields: Record<string, unknown>,
    successCB: ExecSuccessCallback<T>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type Del = {
  <T>(objtype: string, id: string): Promise<T>;
  <T>(objtype: string, id: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void;
};

export type Query = {
  <T>(soql: string): Promise<T>;
  <T>(soql: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void;
};

export type QueryMore = {
  <T>(url: string): Promise<T>;
  <T>(url: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void;
};

export type Search = {
  <T>(sosl: string): Promise<T>;
  <T>(sosl: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void;
};

export type GetAttachment = {
  <T>(id: string): Promise<T>;
  <T>(id: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void;
};
