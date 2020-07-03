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
  createFieldlist?: Array<string>;
  updateFieldlist?: Array<string>;
};

export type SyncOptions = {
  mergeMode?: string;
  fieldlist?: Array<string>;
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
