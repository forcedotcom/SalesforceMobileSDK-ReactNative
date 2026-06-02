/*
 * Copyright (c) 2016-present, salesforce.com, inc.
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
package com.salesforce.androidsdk.reactnative.ui;

import android.os.Bundle;
import android.view.KeyEvent;
import android.widget.Toast;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Callback;
import com.salesforce.androidsdk.reactnative.R;
import com.salesforce.androidsdk.reactnative.app.SalesforceReactSDKManager;
import com.salesforce.androidsdk.reactnative.bridge.ReactBridgeHelper;
import com.salesforce.androidsdk.reactnative.util.SalesforceReactLogger;
import com.salesforce.androidsdk.rest.ClientManager;
import com.salesforce.androidsdk.rest.ClientManager.RestClientCallback;
import com.salesforce.androidsdk.rest.RestClient;
import com.salesforce.androidsdk.ui.SalesforceActivityDelegate;
import com.salesforce.androidsdk.ui.SalesforceActivityInterface;

/**
 * Main activity for a Salesforce ReactNative app.
 */
public abstract class SalesforceReactActivity extends ReactActivity implements SalesforceActivityInterface {

    private static final String TAG = "SFReactActivity";

    private final SalesforceActivityDelegate delegate;
    private RestClient client;
    private ClientManager clientManager;
    private boolean loginInProgress = false;

    /**
     * Pending callback for authentication requests from the React Native bridge.
     * Uses single-callback pattern: callback(null, result) for success, callback(error) for error.
     */
    private Callback pendingAuthCallback;

    protected SalesforceReactActivity() {
        super();
        delegate = new SalesforceActivityDelegate(this);
    }

    /**
     * Returns if authentication should be performed automatically or not.
     *
     * @return True - if you want login to happen as soon as activity is loaded, False - otherwise.
     */
    public boolean shouldAuthenticate() {
        return true;
    }

    /**
     * Called if shouldAuthenticate() returned true but device is offline.
     */
    public void onErrorAuthenticateOffline() {
        final Toast t = Toast.makeText(this,
                R.string.sf__should_authenticate_but_is_offline, Toast.LENGTH_LONG);
        t.show();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SalesforceReactLogger.i(TAG, "onCreate called");
        super.onCreate(savedInstanceState);
        clientManager = buildClientManager();
        delegate.onCreate();
    }

    @Override
    public void onResume() {
        super.onResume();
        delegate.onResume(false);
    }

    @Override
    public void onResume(RestClient c) {
        try {
            setRestClient(clientManager.peekRestClient());
        } catch (ClientManager.AccountInfoNotFoundException e) {
            setRestClient(client);
        }

        // Not logged in.
        if (client == null) {
            onResumeNotLoggedIn();
        }

        // Logged in.
        else {
            SalesforceReactLogger.i(TAG, "onResume - already logged in");

            // If we just completed login, recreate to get a fresh React surface
            if (loginInProgress) {
                loginInProgress = false;
                SalesforceReactLogger.i(TAG, "onResume - login just completed, recreating for fresh surface");
                recreate();
                return;
            }

            if (pendingAuthCallback != null) {
                SalesforceReactLogger.i(TAG, "onResume - invoking pending auth callback");
                getAuthCredentials(pendingAuthCallback);
                pendingAuthCallback = null;
            }
        }
    }

    private void onResumeNotLoggedIn() {
        if (shouldAuthenticate()) {
            if (SalesforceReactSDKManager.getInstance().hasNetwork()) {
                SalesforceReactLogger.i(TAG, "onResumeNotLoggedIn - should authenticate/online - authenticating");
                loginInProgress = true;
                login();
            } else {
                SalesforceReactLogger.w(TAG, "onResumeNotLoggedIn - should authenticate/offline - can not proceed");
                onErrorAuthenticateOffline();
            }
        } else {
            SalesforceReactLogger.i(TAG, "onResumeNotLoggedIn - should not authenticate");
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        delegate.onPause();
    }

    @Override
    public void onDestroy() {
        delegate.onDestroy();
        super.onDestroy();
    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        return delegate.onKeyUp(keyCode, event) || super.onKeyUp(keyCode, event);
    }

    public void showReactDevOptionsDialog() {
        ReactInstanceManager instanceManager = peekReactInstanceManager();
        if (instanceManager != null) {
            instanceManager.showDevOptionsDialog();
        }
    }

    protected void login() {
        SalesforceReactLogger.i(TAG, "login called");
        clientManager.getRestClient(this, new RestClientCallback() {

            @Override
            public void authenticatedRestClient(RestClient client) {
                if (client == null) {
                    SalesforceReactLogger.i(TAG, "login callback triggered with null client");
                    logout(null);
                } else {
                    SalesforceReactLogger.i(TAG, "login callback triggered with actual client");
                    SalesforceReactActivity.this.restartReactNativeApp();
                }
            }
        });
    }

    /**
     * Method called from bridge to logout.
     *
     * @param callback Single callback: callback(null, result) on success.
     */
    public void logout(final Callback callback) {
        SalesforceReactLogger.i(TAG, "logout called");
        SalesforceReactSDKManager.getInstance().logout(this);
        if (callback != null) {
            ReactBridgeHelper.invokeSuccess(callback, "Logout complete");
        }
    }

    /**
     * Method called from bridge to authenticate.
     *
     * @param callback Single callback: callback(null, result) on success, callback(error) on error.
     */
    public void authenticate(final Callback callback) {
        SalesforceReactLogger.i(TAG, "authenticate called");
        pendingAuthCallback = callback;

        clientManager.getRestClient(this, new RestClientCallback() {

            @Override
            public void authenticatedRestClient(RestClient client) {
                SalesforceReactLogger.i(TAG, "authenticatedRestClient callback invoked");
                SalesforceReactActivity.this.setRestClient(client);

                if (pendingAuthCallback != null) {
                    SalesforceReactLogger.i(TAG, "authenticatedRestClient - invoking pending callback");
                    getAuthCredentials(pendingAuthCallback);
                    pendingAuthCallback = null;
                }
            }
        });
    }

    /**
     * Method called from bridge to get auth credentials.
     *
     * @param callback Single callback: callback(null, result) on success, callback(error) on error.
     */
    public void getAuthCredentials(Callback callback) {
        SalesforceReactLogger.i(TAG, "getAuthCredentials called");
        if (client != null) {
            if (callback != null) {
                ReactBridgeHelper.invokeSuccess(callback, client.getJSONCredentials());
            }
        } else {
            if (callback != null) {
                ReactBridgeHelper.invokeError(callback, "Not authenticated");
            }
        }
    }

    /**
     * Returns an instance of RestClient.
     *
     * @return An instance of RestClient.
     */
    public RestClient getRestClient() {
        return client;
    }

    protected void setRestClient(RestClient restClient) {
        client = restClient;
        if (client != null) {
        }
    }

    public ClientManager buildClientManager() {
        return SalesforceReactSDKManager.getInstance().getClientManager();
    }

    @Override
    public void onLogoutComplete() {
    }

    @Override
    public void onUserSwitched() {
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new SalesforceReactActivityDelegate(this, getMainComponentName());
    }

    protected boolean shouldReactBeRunning() {
        return !shouldAuthenticate() || client != null;
    }

    protected void restartReactNativeApp() {
        ReactInstanceManager instanceManager = peekReactInstanceManager();
        if (instanceManager != null) {
            instanceManager.destroy();
            if (shouldReactBeRunning()) {
                instanceManager.createReactContextInBackground();
            }
        } else {
            // Bridgeless mode: recreate the activity to restart React
            if (shouldReactBeRunning()) {
                recreate();
            }
        }
    }

    /**
     * Returns the ReactInstanceManager if available (bridge mode only).
     * Returns null in bridgeless (new architecture) mode.
     */
    private ReactInstanceManager peekReactInstanceManager() {
        try {
            return getReactNativeHost().getReactInstanceManager();
        } catch (Exception e) {
            return null;
        }
    }
}
