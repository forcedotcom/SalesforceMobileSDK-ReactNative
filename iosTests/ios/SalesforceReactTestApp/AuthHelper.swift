/*
 * Copyright (c) 2026-present, salesforce.com, inc.
 * All rights reserved.
 * (copyright block)
 */

import Foundation
import SalesforceSDKCore

class AuthHelper {
    /// Check for instant login via -creds argument, otherwise trigger normal login flow
    static func loginIfRequired(completion: @escaping () -> Void) {
#if DEBUG
        // Check for -creds argument for instant login
        let arguments = ProcessInfo.processInfo.arguments
        if let credsIndex = arguments.firstIndex(of: "-creds"),
           credsIndex + 1 < arguments.count {
            let creds = arguments[credsIndex + 1]

            // Populate credentials and perform synchronous auth refresh
            TestSetupUtils.populateAuthCredentials(fromString: creds, initializeSdk: false)
            TestSetupUtils.synchronousAuthRefresh(withUserDidLoginNotification: true)

            // Auth completed, call completion
            completion()
            return
        }
#endif

        // No instant login, use normal SDK auth flow
        SFUserAccountManager.shared.loginWithCompletion { (info, error) in
            if let error = error {
                print("Login failed: \(error)")
                return
            }
            completion()
        }
    }
}
