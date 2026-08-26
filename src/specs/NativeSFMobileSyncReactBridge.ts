/*
 * Copyright (c) 2026-present, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

// Actual args shape for all MobileSync methods:
//   { isGlobalStore?, storeName?, soupName?, target?, options?, syncName?, syncId? }

export interface Spec extends TurboModule {
  syncDown(args: Object, callback: (error: Object | null, result: Object | null) => void): void;
  syncUp(args: Object, callback: (error: Object | null, result: Object | null) => void): void;
  reSync(args: Object, callback: (error: Object | null, result: Object | null) => void): void;
  getSyncStatus(args: Object, callback: (error: Object | null, result: Object | null) => void): void;
  deleteSync(args: Object, callback: (error: Object | null, result: Object | null) => void): void;
  cleanResyncGhosts(args: Object, callback: (error: Object | null, result: Object | null) => void): void;
  resetSyncManager(args: Object, callback: (error: Object | null, result: Object | null) => void): void;
}

export default TurboModuleRegistry.get<Spec>("SFMobileSyncReactBridge");
