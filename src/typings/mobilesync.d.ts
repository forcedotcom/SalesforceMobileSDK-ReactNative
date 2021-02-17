import { ExecErrorCallback, ExecSuccessCallback } from "../react.force.common";
import { StoreConfig } from "../react.force.smartstore";

export type SyncMethod = "cleanResyncGhosts" | "deleteSync" | "getSyncStatus" | "reSync" | "syncDown" | "syncUp";

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

export type SyncDownTarget = {
  type: "soql" | "sosl" | "mru" | "custom";
  query: string;
  modificationDateFieldName?: string;
  iOSImpl?: string;
  idFieldName?: string;
};

export type SyncUpTarget = {
  createFieldlist?: string[];
  updateFieldlist?: string[];
};

export type SyncOptions = {
  mergeMode?: "OVERWRITE" | "LEAVE_IF_CHANGED";
  fieldlist?: string[];
};

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

export type SyncDownOverload = {
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

export type ReSyncOverload = {
  (storeConfig: StoreConfig, syncIdOrName: string): Promise<SyncEvent>;
  (
    storeConfig: StoreConfig,
    syncIdOrName: string,
    successCB: ExecSuccessCallback<SyncEvent>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type CleanResyncGhostsOverload = {
  (storeConfig: StoreConfig, syncId: string): Promise<unknown>;
  (storeConfig: StoreConfig, syncId: string, successCB: ExecSuccessCallback<unknown>, errorCB: ExecErrorCallback): void;
};

export type SyncUpOverload = {
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

export type GetSyncStatusOverload = {
  (storeConfig: StoreConfig, syncIdOrName: string): Promise<SyncStatus>;
  (
    storeConfig: StoreConfig,
    syncIdOrName: string,
    successCB: ExecSuccessCallback<SyncStatus>,
    errorCB: ExecErrorCallback,
  ): void;
};

export type DeleteSyncOverload = {
  (storeConfig: StoreConfig, syncIdOrName: string): Promise<unknown>;
  (
    storeConfig: StoreConfig,
    syncIdOrName: string,
    successCB: ExecSuccessCallback<unknown>,
    errorCB: ExecErrorCallback,
  ): void;
};
