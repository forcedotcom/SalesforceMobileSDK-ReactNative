import { ExecErrorCallback, ExecSuccessCallback } from "../react.force.common";
import { QuerySpec, SoupIndexSpec, SoupSpec, StoreConfig, StoreCursor } from "../react.force.smartstore";

export type SmartStoreMethod =
  | "alterSoup"
  | "clearSoup"
  | "closeCursor"
  | "getAllGlobalStores"
  | "getAllStores"
  | "getDatabaseSize"
  | "getSoupIndexSpecs"
  | "getSoupSpec"
  | "moveCursorToPageIndex"
  | "querySoup"
  | "registerSoup"
  | "reIndexSoup"
  | "removeAllGlobalStores"
  | "removeAllStores"
  | "removeFromSoup"
  | "removeSoup"
  | "removeStore"
  | "retrieveSoupEntries"
  | "runSmartQuery"
  | "soupExists"
  | "upsertSoupEntries";

export type OK = "OK";

export type SObject = Record<string, any>;

export type GetDatabaseSize = {
  (storeConfig: StoreConfig | boolean): Promise<number>;
  (storeConfig: StoreConfig | boolean, successCB: ExecSuccessCallback<number>, errorCB: ExecErrorCallback): void;
};

export type RegisterSoup = {
  (storeConfig: StoreConfig | boolean, soupName: string, indexSpecs: SoupIndexSpec[]): Promise<string>;
  (
    storeConfig: StoreConfig | boolean,
    soupName: string,
    indexSpecs: SoupIndexSpec[],
    successCB: ExecSuccessCallback<string>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type RegisterSoupWithSpec = {
  (storeConfig: StoreConfig | boolean, soupSpec: QuerySpec, indexSpecs: SoupIndexSpec[]): Promise<string>;
  (
    storeConfig: StoreConfig | boolean,
    soupSpec: QuerySpec,
    indexSpecs: SoupIndexSpec[],
    successCB: ExecSuccessCallback<string>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type RemoveSoup = {
  (storeConfig: StoreConfig | boolean, soupName: string): Promise<OK>;
  (
    storeConfig: StoreConfig | boolean,
    soupName: string,
    successCB: ExecSuccessCallback<OK>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type GetSoupIndexSpecs = {
  (storeConfig: StoreConfig | boolean, soupName: string): Promise<SoupIndexSpec[]>;
  (
    storeConfig: StoreConfig | boolean,
    soupName: string,
    successCB: ExecSuccessCallback<SoupIndexSpec[]>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type GetSoupSpec = {
  (storeConfig: StoreConfig | boolean, soupName: string): Promise<SoupSpec>;
  (
    storeConfig: StoreConfig | boolean,
    soupName: string,
    successCB: ExecSuccessCallback<SoupSpec>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type AlterSoup = {
  (
    storeConfig: StoreConfig | boolean,
    soupName: string,
    indexSpecs: SoupIndexSpec[],
    reIndexData: boolean,
  ): Promise<string>;
  (
    storeConfig: StoreConfig | boolean,
    soupName: string,
    indexSpecs: SoupIndexSpec[],
    reIndexData: boolean,
    successCB: ExecSuccessCallback<string>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type AlterSoupWithSpec = {
  (
    storeConfig: StoreConfig | boolean,
    soupName: string,
    soupSpec: SoupSpec,
    indexSpecs: SoupIndexSpec[],
    reIndexData: boolean,
  ): Promise<string>;
  (
    storeConfig: StoreConfig | boolean,
    soupName: string,
    soupSpec: SoupSpec,
    indexSpecs: SoupIndexSpec[],
    reIndexData: boolean,
    successCB: ExecSuccessCallback<string>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type ReIndexSoup = {
  (storeConfig: StoreConfig | boolean, soupName: string, paths: string): Promise<string>;
  (
    storeConfig: StoreConfig | boolean,
    soupName: string,
    paths: string,
    successCB: ExecSuccessCallback<string>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type ClearSoup = {
  <T>(storeConfig: StoreConfig | boolean, soupName: string): Promise<T>;
  <T>(
    storeConfig: StoreConfig | boolean,
    soupName: string,
    successCB: ExecSuccessCallback<T>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type SoupExists = {
  (storeConfig: StoreConfig | boolean, soupName: string): Promise<boolean>;
  (
    storeConfig: StoreConfig | boolean,
    soupName: string,
    successCB: ExecSuccessCallback<boolean>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type QuerySoup = {
  <T>(storeConfig: StoreConfig | boolean, soupName: string, querySpec: QuerySpec): Promise<StoreCursor<T>>;
  <T>(
    storeConfig: StoreConfig | boolean,
    soupName: string,
    querySpec: QuerySpec,
    successCB: ExecSuccessCallback<StoreCursor<T>>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type RunSmartQuery = {
  <T>(storeConfig: StoreConfig | boolean, querySpec: QuerySpec): Promise<StoreCursor<T>>;
  <T>(
    storeConfig: StoreConfig | boolean,
    querySpec: QuerySpec,
    successCB: ExecSuccessCallback<StoreCursor<T>>,
    errorCB: ExecErrorCallback,
  ): void;
};
export type RetrieveSoupEntries = {
  <T>(storeConfig: StoreConfig | boolean, soupName: string, entryIds: string[]): Promise<StoreCursor<T>>;
  <T>(
    storeConfig: StoreConfig | boolean,
    soupName: string,
    entryIds: string[],
    successCB: ExecSuccessCallback<StoreCursor<T>>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type UpsertSoupEntries = {
  <T>(storeConfig: StoreConfig | boolean, soupName: string, entries: SObject[]): Promise<T>;
  <T>(
    storeConfig: StoreConfig | boolean,
    soupName: string,
    entries: SObject[],
    successCB: ExecSuccessCallback<T>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type UpsertSoupEntriesWithExternalId = {
  <T>(storeConfig: StoreConfig | boolean, soupName: string, entries: SObject[], externalIdPath: string): Promise<T>;
  <T>(
    storeConfig: StoreConfig | boolean,
    soupName: string,
    entries: SObject[],
    externalIdPath: string,
    successCB: ExecSuccessCallback<T>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type RemoveFromSoup = {
  (storeConfig: StoreConfig | boolean, soupName: string, entryIdsOrQuerySpec: string[]): Promise<OK>;
  (
    storeConfig: StoreConfig | boolean,
    soupName: string,
    entryIdsOrQuerySpec: string[],
    successCB: ExecSuccessCallback<OK>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type MoveCursorToPageIndex = {
  <T>(storeConfig: StoreConfig | boolean, cursor: StoreCursor<T>, newPageIndex: number): Promise<T>;
  <T>(
    storeConfig: StoreConfig | boolean,
    cursor: StoreCursor<T>,
    newPageIndex: number,
    successCB: ExecSuccessCallback<T>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type MoveCursorToNextPage = {
  <T>(storeConfig: StoreConfig | boolean, cursor: StoreCursor<T>): Promise<T>;
  <T>(
    storeConfig: StoreConfig | boolean,
    cursor: StoreCursor<T>,
    successCB: ExecSuccessCallback<T>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type MoveCursorToPreviousPage = {
  <T>(storeConfig: StoreConfig | boolean, cursor: StoreCursor<T>): Promise<T>;
  <T>(
    storeConfig: StoreConfig | boolean,
    cursor: StoreCursor<T>,
    successCB: ExecSuccessCallback<T>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type CloseCursor = {
  <T>(storeConfig: StoreConfig | boolean, cursor: StoreCursor<T>): Promise<OK>;
  <T>(
    storeConfig: StoreConfig | boolean,
    cursor: StoreCursor<T>,
    successCB: ExecSuccessCallback<OK>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type GetAllStores = {
  (): Promise<StoreConfig[]>;
  (successCB: ExecSuccessCallback<StoreConfig[]>, errorCB: ExecErrorCallback): void;
};

export type GetAllGlobalStores = {
  (): Promise<StoreConfig[]>;
  (successCB: ExecSuccessCallback<StoreConfig[]>, errorCB: ExecErrorCallback): void;
};

export type RemoveStore = {
  (storeConfig: StoreConfig | boolean): Promise<OK>;
  (storeConfig: StoreConfig | boolean, successCB: ExecSuccessCallback<OK>, errorCB: ExecErrorCallback): void;
};

export type RemoveAllStores = {
  (): Promise<OK>;
  (successCB: ExecSuccessCallback<OK>, errorCB: ExecErrorCallback): void;
};

export type RemoveAllGlobalStores = {
  (): Promise<OK>;
  (successCB: ExecSuccessCallback<OK>, errorCB: ExecErrorCallback): void;
};
