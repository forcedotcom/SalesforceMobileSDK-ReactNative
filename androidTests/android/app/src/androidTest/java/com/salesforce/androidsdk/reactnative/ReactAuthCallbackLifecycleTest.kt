/*
 * Copyright (c) 2026-present, salesforce.com, inc.
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

package com.salesforce.androidsdk.reactnative

import androidx.test.platform.app.InstrumentationRegistry
import com.facebook.react.bridge.Callback
import com.salesforce.androidsdk.accounts.UserAccountBuilder
import com.salesforce.androidsdk.auth.HttpAccess
import com.salesforce.androidsdk.rest.ClientManager
import com.salesforce.androidsdk.rest.RestClient
import com.salesforce.androidsdk.reactnative.ui.SalesforceReactActivity
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Test

/** Exercises login completion without a live account or a React surface. */
class ReactAuthCallbackLifecycleTest {
    private val user = UserAccountBuilder.getInstance()
        .orgId("callback-lifecycle-test-org")
        .userId("callback-lifecycle-test-user")
        .build()

    @After
    fun clearTestClient() {
        RestClient.clearCaches(user)
    }

    @Test
    fun pendingCallbackCompletesBeforeLoginRecreatesActivity() = onMainThread {
        val activity = authenticatedActivity()
        var callbackCount = 0
        setField(activity, "loginInProgress", true)
        setField(activity, "pendingAuthCallback", Callback { callbackCount++ })

        activity.onResume(null as RestClient?)

        assertEquals(listOf("callback", "recreate"), activity.events)
        assertEquals(1, callbackCount)
        // Another resume must not deliver the completed request or recreate again.
        activity.onResume(null as RestClient?)
        assertEquals(listOf("callback", "recreate"), activity.events)
        assertEquals(1, callbackCount)
    }

    @Test
    fun automaticLoginWithoutPendingCallbackStillRecreatesActivity() = onMainThread {
        val activity = authenticatedActivity()
        setField(activity, "loginInProgress", true)

        activity.onResume(null as RestClient?)

        assertEquals(listOf("recreate"), activity.events)
    }

    @Test
    fun pendingCallbackWithoutAutomaticLoginCompletesOnceWithoutRecreation() = onMainThread {
        val activity = authenticatedActivity()
        var callbackCount = 0
        setField(activity, "pendingAuthCallback", Callback { callbackCount++ })

        activity.onResume(null as RestClient?)
        activity.onResume(null as RestClient?)

        assertEquals(listOf("callback"), activity.events)
        assertEquals(1, callbackCount)
    }

    private fun authenticatedActivity(): RecordingActivity {
        val info = RestClient.ClientInfo(
            null, null, null, null, null, user.userId, user.orgId,
            null, null, null, null, null, null, null, null, emptyMap(),
            null, null, null, null, null, null, null,
        )
        val client = RestClient(info, null, HttpAccess.DEFAULT, null)
        return RecordingActivity().apply { supplyClient(client) }
    }

    private fun onMainThread(block: () -> Unit) {
        InstrumentationRegistry.getInstrumentation().runOnMainSync(block)
    }

    private fun setField(activity: RecordingActivity, name: String, value: Any) {
        SalesforceReactActivity::class.java.getDeclaredField(name).apply {
            isAccessible = true
            set(activity, value)
        }
    }

    private class RecordingActivity : SalesforceReactActivity() {
        val events = mutableListOf<String>()

        fun supplyClient(client: RestClient) = setRestClient(client)

        // Keep the production onResume logic, with no account lookup or UI launch.
        override fun buildClientManager(): ClientManager? = null

        override fun getAuthCredentials(callback: Callback?) {
            events += "callback"
            callback?.invoke(null, "authenticated")
        }

        override fun recreate() {
            events += "recreate"
        }
    }
}
