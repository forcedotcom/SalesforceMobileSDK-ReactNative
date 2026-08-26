/*
 * Copyright (c) 2026-present, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

// Codegen requires `Object` for args to generate `NSDictionary *` (iOS) /
// `ReadableMap` (Android). Using inline typed objects causes Codegen to
// generate C++ structs that don't match our existing native signatures.
//
// Actual args shapes (for documentation, not enforced by Codegen):
//   getAuthCredentials: {} (empty)
//   authenticate: {} (empty)
//   logoutCurrentUser: {} (empty)

export interface Spec extends TurboModule {
  getAuthCredentials(args: Object, callback: (error: Object | null, result: Object | null) => void): void;
  authenticate(args: Object, callback: (error: Object | null, result: Object | null) => void): void;
  logoutCurrentUser(args: Object, callback: (error: Object | null, result: Object | null) => void): void;
}

export default TurboModuleRegistry.get<Spec>("SFOauthReactBridge");
