export type SyncMethod =
  | "cleanResyncGhosts"
  | "deleteSync"
  | "getSyncStatus"
  | "reSync"
  | "syncDown"
  | "syncUp";

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
