/*
 * Copyright (c) 2024-present, salesforce.com, inc.
 * All rights reserved.
 * Redistribution and use of this software in source and binary forms, with or
 * without modification, are permitted provided that the following conditions
 * are met:
 * - Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * - Neither the name of salesforce.com, inc. nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission of salesforce.com, inc.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
package com.salesforce.androidsdk.reactnative.app

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.salesforce.androidsdk.reactnative.bridge.MobileSyncReactBridge
import com.salesforce.androidsdk.reactnative.bridge.SalesforceNetReactBridge
import com.salesforce.androidsdk.reactnative.bridge.SalesforceOauthReactBridge
import com.salesforce.androidsdk.reactnative.bridge.SmartStoreReactBridge

class SalesforceReactPackage : BaseReactPackage() {

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return when (name) {
            "SFOauthReactBridge" -> SalesforceOauthReactBridge(reactContext)
            "SFNetReactBridge" -> SalesforceNetReactBridge(reactContext)
            "SFSmartStoreReactBridge" -> SmartStoreReactBridge(reactContext)
            "SFMobileSyncReactBridge" -> MobileSyncReactBridge(reactContext)
            else -> null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                "SFOauthReactBridge" to ReactModuleInfo(
                    "SFOauthReactBridge", "SFOauthReactBridge", false, false, false, true
                ),
                "SFNetReactBridge" to ReactModuleInfo(
                    "SFNetReactBridge", "SFNetReactBridge", false, false, false, true
                ),
                "SFSmartStoreReactBridge" to ReactModuleInfo(
                    "SFSmartStoreReactBridge", "SFSmartStoreReactBridge", false, false, false, true
                ),
                "SFMobileSyncReactBridge" to ReactModuleInfo(
                    "SFMobileSyncReactBridge", "SFMobileSyncReactBridge", false, false, false, true
                ),
            )
        }
    }

    // Also provide createNativeModules for legacy interop in composite builds where the
    // TurboModule JNI classloader check may fail due to different classloaders.
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(
            SalesforceOauthReactBridge(reactContext),
            SalesforceNetReactBridge(reactContext),
            SmartStoreReactBridge(reactContext),
            MobileSyncReactBridge(reactContext),
        )
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
