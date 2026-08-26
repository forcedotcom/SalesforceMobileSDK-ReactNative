/*
 * Copyright (c) 2026-present, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

// Actual args shape for sendRequest:
//   { endPoint, path, method, queryParams, headerParams, fileParams,
//     returnBinary, doesNotRequireAuthentication }

export interface Spec extends TurboModule {
  sendRequest(args: Object, callback: (error: Object | null, result: Object | null) => void): void;
}

export default TurboModuleRegistry.get<Spec>("SFNetReactBridge");
