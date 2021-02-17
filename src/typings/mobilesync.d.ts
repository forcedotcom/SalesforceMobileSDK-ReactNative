import { ExecErrorCallback, ExecSuccessCallback } from "../react.force.common";
import { StoreConfig } from "../react.force.smartstore";

export type SyncMethod = "cleanResyncGhosts" | "deleteSync" | "getSyncStatus" | "reSync" | "syncDown" | "syncUp";

export type SyncDownTypes = "soql" | "sosl" | "mru" | "custom";

export type SyncOptionsMergeModes = "OVERWRITE" | "LEAVE_IF_CHANGED";

export interface SyncEvent {
  soupName: string;
  options: SyncOptions;
  isGlobalStore: boolean;
  error: string;
  maxTimeStamp: number;
  _soupEntryId: number;
  type: string;
  progress: number;
  endTime: number;
  target: SyncDownTarget;
  totalSize: number;
  storeName: string;
  startTime: number;
  status: string;
  name: string;
}

export type SyncDownTarget =
  | SyncDownCustomTarget
  | SyncDownLayoutTarget
  | SyncDownMetadataTarget
  | SyncDownMRUTarget
  | SyncDownParentChildrenTarget
  | SyncDownRefreshTarget
  | SyncDownSOQLTarget
  | SyncDownSOSLTarget;

export type SyncDownSOQLTarget = {
  type: "soql";
  query: string;
};

export type SyncDownSOSLTarget = {
  type: "sosl";
  query: string;
};

export type SyncDownMRUTarget = {
  type: "mru";
  sobjectType: string;
  fieldlist: string[];
};

export type SyncDownRefreshTarget = {
  type: "refresh";
  sobjectType: string;
  fieldlist: string[];
  soupName: string;
};

export type SyncDownLayoutTarget = {
  type: "layout";
  sobjectType: string;
  formFactor: string;
  layoutType: string;
  mode: string;
};

export type SyncDownMetadataTarget = {
  type: "metadata";
  sobjectType: string;
};

export type SyncDownParentChildrenTarget = {
  type: "parent_children";
  parent: {
    idFieldName: string;
    sobjectType: string;
    modificationDateFieldName: string;
    soupName: string;
  };
  parentFieldlist: string[];
  children: {
    parentIdFieldName: string;
    idFieldName: string;
    sobjectType: string;
    modificationDateFieldName: string;
    soupName: string;
    sobjectTypePlural: string;
  };
  childrenFieldlist: string[];
  relationshipType: string;
  parentSoqlFilter: string;
};

export type SyncDownCustomTarget = {
  type: "custom";
  iOSImpl?: string;
  androidImpl?: string;

  [key: string]: any;
};

export type SyncUpTarget = {
  createFieldlist?: string[];
  updateFieldlist?: string[];

  [key: string]: any;
};

export type SyncUpOptions = {
  mergeMode: SyncOptionsMergeModes;
  fieldlist: string[];
};

export type SyncDownOptions = {
  mergeMode: SyncOptionsMergeModes;
};

export type SyncOptions = SyncUpOptions | SyncDownOptions;

export interface SyncStatus {
  _soupEntryId: number;
  endTime: number;
  error: string;
  maxTimeStamp: number;
  name: string;
  options: SyncOptions;
  progress: number;
  soupName: string;
  startTime: number;
  status: string;
  target: SyncDownTarget;
  totalSize: number;
  type: string;
}

export type SyncDown = {
  (
    storeConfig: StoreConfig,
    target: SyncDownTarget,
    soupName: string,
    options: SyncOptions,
    syncName: string,
    successCB: ExecSuccessCallback<SyncEvent>,
    errorCB: ExecErrorCallback,
  ): void;
  (
    storeConfig: StoreConfig,
    target: SyncDownTarget,
    soupName: string,
    options: SyncOptions,
    syncName: string,
  ): Promise<SyncEvent>;
  (
    storeConfig: StoreConfig,
    target: SyncDownTarget,
    soupName: string,
    options: SyncOptions,
    successCB: ExecSuccessCallback<SyncEvent>,
    errorCB: ExecErrorCallback,
  ): void;
  (storeConfig: StoreConfig, target: SyncDownTarget, soupName: string, options: SyncOptions): Promise<SyncEvent>;
};

export type ReSync = {
  (storeConfig: StoreConfig, syncIdOrName: string): Promise<SyncEvent>;
  (
    storeConfig: StoreConfig,
    syncIdOrName: string,
    successCB: ExecSuccessCallback<SyncEvent>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type CleanResyncGhosts = {
  (storeConfig: StoreConfig, syncId: string): Promise<unknown>;
  (storeConfig: StoreConfig, syncId: string, successCB: ExecSuccessCallback<unknown>, errorCB: ExecErrorCallback): void;
};

export type SyncUp = {
  (
    storeConfig: StoreConfig,
    target: SyncDownTarget,
    soupName: string,
    options: SyncOptions,
    syncName: string,
    successCB: ExecSuccessCallback<SyncEvent>,
    errorCB: ExecErrorCallback,
  ): void;
  (
    storeConfig: StoreConfig,
    target: SyncDownTarget,
    soupName: string,
    options: SyncOptions,
    syncName: string,
  ): Promise<SyncEvent>;
  (
    storeConfig: StoreConfig,
    target: SyncDownTarget,
    soupName: string,
    options: SyncOptions,
    successCB: ExecSuccessCallback<SyncEvent>,
    errorCB: ExecErrorCallback,
  ): void;
  (storeConfig: StoreConfig, target: SyncDownTarget, soupName: string, options: SyncOptions): Promise<SyncEvent>;
};

export type GetSyncStatus = {
  (storeConfig: StoreConfig, syncIdOrName: string): Promise<SyncStatus>;
  (
    storeConfig: StoreConfig,
    syncIdOrName: string,
    successCB: ExecSuccessCallback<SyncStatus>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type DeleteSync = {
  (storeConfig: StoreConfig, syncIdOrName: string): Promise<unknown>;
  (
    storeConfig: StoreConfig,
    syncIdOrName: string,
    successCB: ExecSuccessCallback<unknown>,
    errorCB: ExecErrorCallback,
  ): void;
};
