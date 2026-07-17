# Push Notifications — Salesforce Mobile SDK for React Native

This document covers push notification setup for React Native apps built with the Salesforce Mobile SDK.

Push notifications in the SDK are a **native-only feature** — there is no JavaScript push API. All setup happens in the native Android (`MainApplication.kt`) and iOS (`AppDelegate.swift`) layers of your React Native project. The SDK handles device registration with Salesforce automatically after the user logs in.

For platform-specific API references, see:
- **Android**: [`SalesforceMobileSDK-Android/docs/push/README.md`](https://github.com/forcedotcom/SalesforceMobileSDK-Android/tree/dev/docs/push)
- **iOS**: [`SalesforceMobileSDK-iOS/docs/push/README.md`](https://github.com/forcedotcom/SalesforceMobileSDK-iOS/tree/dev/docs/push)

For cross-platform architecture, see the [workspace-level push doc](../../../docs/push/README.md).

---

## Table of Contents

1. [How Push Works in React Native Apps](#how-push-works-in-react-native-apps)
2. [Salesforce Org Prerequisites](#salesforce-org-prerequisites)
3. [Android Setup](#android-setup)
4. [iOS Setup](#ios-setup)
5. [Forwarding Push Payloads to JavaScript](#forwarding-push-payloads-to-javascript)
6. [Advanced Configuration](#advanced-configuration)
   - [Android: Re-registration Modes](#android-re-registration-modes)
   - [Android: Actionable Notifications](#android-actionable-notifications-api-v640)
   - [iOS: Re-registration Mode and Custom Registration Body](#ios-re-registration-mode-and-custom-registration-body)
   - [iOS: Actionable Notifications](#ios-actionable-notifications-api-v640)

---

## How Push Works in React Native Apps

```
Salesforce Org
      │  push notification
      ▼
FCM (Android) / APNs (iOS)
      │
      ▼
Native layer (MainApplication.kt / AppDelegate.swift)
      │
      ├── SDK handles automatically:
      │     - Device registration with Salesforce after login
      │     - Token refresh and re-registration
      │     - Encrypted payload decryption
      │
      └── App must implement:
            - PushNotificationInterface (Android)
            - APNs delegate methods (iOS)
            └── Optional: emit event to JS via RCTEventEmitter
```

There is no `mobilesync.push` or `oauth.push` JavaScript module. If you need to surface push payloads to the JavaScript layer (e.g., to navigate to a screen on tap), you must implement a custom React Native event emitter in the native code — see [Forwarding Push Payloads to JavaScript](#forwarding-push-payloads-to-javascript).

The SDK registers your app's device with the Salesforce `MobilePushServiceDevice` endpoint automatically at the end of the OAuth login flow. You do not need to call any JavaScript API to trigger this.

**Platform opt-in asymmetry:** iOS APNs registration is active by default in the SDK templates — the permission prompt fires on first launch. Android push is **opt-in**: you must set `pushNotificationReceiver` in `MainApplication.kt` and supply `google-services.json` for any push to work.

---

## Salesforce Org Prerequisites

Before writing any code, configure the Salesforce side:

1. **Enable push notifications** on your Connected App (or External Client App) in Salesforce Setup:
   - Android: add your FCM server key
   - iOS: upload your APNs certificate or key (.p8)
2. Confirm the `MobilePushServiceDevice` sObject is accessible in your org — a 404 response from the SDK during registration means push is not enabled on the Connected App.

---

## Android Setup

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create or open your project.
2. Register your Android app (use your app's `applicationId`).
3. Download `google-services.json` and place it in `android/app/`.

### 2. Apply the Google Services Gradle Plugin

**`android/build.gradle`** (project level):
```groovy
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.2'
    }
}
```

**`android/app/build.gradle`** (app level):
```groovy
apply plugin: 'com.google.gms.google-services'
```

### 3. Declare the POST_NOTIFICATIONS Permission (Android 13+)

**`android/app/src/main/AndroidManifest.xml`**:
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

You must also request this permission at runtime in your `MainActivity`:
```kotlin
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
    checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS)
        != PackageManager.PERMISSION_GRANTED) {
    requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), REQUEST_CODE)
}
```

### 4. Implement PushNotificationInterface

In `MainApplication.kt`, after `SalesforceReactSDKManager.initReactNative(...)`:

```kotlin
import com.salesforce.androidsdk.push.PushNotificationInterface
import com.google.firebase.messaging.FirebaseMessaging

SalesforceReactSDKManager.getInstance().pushNotificationReceiver =
    object : PushNotificationInterface {
        override fun onPushMessageReceived(data: Map<String?, String?>?) {
            // data contains the push payload as key/value pairs.
            // The SDK has already decrypted any encrypted payload before calling this.
            // data["content"] contains the Salesforce notification body JSON (parse with
            // SalesforceActionableNotificationContent.fromJson if handling actionable notifications).
            //
            // To forward to JS, emit a React Native event here — see section below.
        }

        override fun supplyFirebaseMessaging(): FirebaseMessaging? {
            return null  // Return null to use the default FirebaseMessaging instance
        }
    }
```

That's all the code required. The SDK (`SFDCFcmListenerService`, declared in the SDK's own `AndroidManifest.xml`) handles:
- FCM token acquisition and refresh
- Registration with Salesforce `MobilePushServiceDevice`
- Encrypted payload decryption (RSA-OAEP-SHA256 + AES-128)
- Re-registration on app foreground and login

---

## iOS Setup

### 1. Enable Push Notifications Capability

In Xcode, select your app target → **Signing & Capabilities** → **+ Capability** → **Push Notifications**. This adds `aps-environment` to your `.entitlements` file.

### 2. Configure APNs in Your Apple Developer Account

Generate an APNs Auth Key (.p8) or certificate and upload it to the Salesforce Connected App settings.

### 3. AppDelegate.swift

The SDK templates already include all required push code. Verify your `AppDelegate.swift` contains:

```swift
import UserNotifications
import SalesforceSDKCore  // SalesforceReact for RN apps

// Called once at app launch
func application(_ application: UIApplication,
                 didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // ... SDK init ...
    registerForRemotePushNotifications()
    return true
}

private func registerForRemotePushNotifications() {
    UNUserNotificationCenter.current().requestAuthorization(options: [.sound, .alert, .badge]) { granted, error in
        if granted {
            DispatchQueue.main.async {
                PushNotificationManager.shared.registerForRemoteNotifications()
            }
        }
    }
}

// Forward the APNs device token to the SDK
func application(_ application: UIApplication,
                 didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    PushNotificationManager.shared.didRegisterForRemoteNotifications(withDeviceToken: deviceToken)
    if UserAccountManager.shared.currentUserAccount?.credentials.accessToken != nil {
        PushNotificationManager.shared.registerSalesforceNotifications(completionBlock: nil, failBlock: nil)
    }
    // If not yet logged in, the SDK auto-registers after login
}

func application(_ application: UIApplication,
                 didFailToRegisterForRemoteNotificationsWithError error: Error) {
    SalesforceLogger.e(AppDelegate.self, message: "APNs registration failed: \(error)")
}
```

### 4. Handle Incoming Notifications

Add `UNUserNotificationCenterDelegate` to control foreground display and handle taps. This is **required** for actionable notifications and recommended for all apps:

```swift
extension AppDelegate: UNUserNotificationCenterDelegate {
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler handler: @escaping (UNNotificationPresentationOptions) -> Void) {
        handler([.banner, .sound, .badge])
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler handler: @escaping () -> Void) {
        // Handle notification tap or action button tap — forward payload to JS if needed
        let userInfo = response.notification.request.content.userInfo
        // For actionable notifications, invoke the server action (see Actionable Notifications below)
        handler()
    }
}
```

Set the delegate **before** `registerForRemotePushNotifications()` in `didFinishLaunchingWithOptions`:
```swift
UNUserNotificationCenter.current().delegate = self
registerForRemotePushNotifications()
```

### 5. Encrypted Push: Notification Service Extension

Salesforce Notification Builder payloads are encrypted end-to-end. To decrypt them before display, add a **Notification Service Extension** target to your Xcode project:

```objc
// NotificationService.m
#import <SalesforceSDKCore/SFSDKPushNotificationDecryption.h>

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request
                   withContentHandler:(void (^)(UNNotificationContent *))contentHandler {
    UNMutableNotificationContent *content = [request.content mutableCopy];
    NSError *error;
    [SFSDKPushNotificationDecryption decryptNotificationContent:content error:&error];
    contentHandler(content);
}
```

The extension must share the same **Keychain Access Group** as the main app (add the Keychain Sharing capability to both targets with a matching group identifier) to access the RSA private key.

---

## Forwarding Push Payloads to JavaScript

There is no built-in JS push API. To route incoming push data to the JavaScript layer, you must write a native React Native event emitter module. The approach differs between the New Architecture (bridgeless/TurboModules) and the legacy bridge:

- **New Architecture (React Native 0.74+)**: Implement `RCTEventEmitter` on iOS and `EventEmitter` from `com.facebook.react.modules.core` on Android using the `DeviceEventManagerModule.RCTDeviceEventEmitter` pattern. You must hold a reference to the `ReactApplicationContext` (injected into your module constructor) and call `reactContext.emitDeviceEvent(...)` — do not cache `currentReactContext` from `ReactInstanceManager`, which is deprecated.
- **Legacy bridge**: The `ReactInstanceManager.currentReactContext` approach was common in older tutorials but is not supported in New Architecture mode.

Refer to the [React Native documentation on native modules](https://reactnative.dev/docs/native-modules-intro) and the [New Architecture migration guide](https://reactnative.dev/docs/new-architecture-intro) for the recommended event emitter pattern for your React Native version.

### iOS

Create a Swift/ObjC event emitter and post from your `UNUserNotificationCenterDelegate`:

```swift
// In userNotificationCenter(_:didReceive:withCompletionHandler:)
let userInfo = response.notification.request.content.userInfo
NotificationCenter.default.post(name: .init("SalesforcePushNotification"), object: nil, userInfo: userInfo)
```

Then emit to JS from an `RCTEventEmitter` subclass that observes `NSNotificationCenter`.

### JavaScript

```typescript
import { NativeEventEmitter, NativeModules } from 'react-native';

const emitter = new NativeEventEmitter(NativeModules.YourPushModule);

useEffect(() => {
    const subscription = emitter.addListener('SalesforcePushNotification', (data) => {
        console.log('Push received:', data);
    });
    return () => subscription.remove();
}, []);
```

---

## Advanced Configuration

### Android: Re-registration Modes

```kotlin
import com.salesforce.androidsdk.push.PushService

// Default: re-register whenever the app foregrounds
PushService.pushNotificationsRegistrationType =
    PushService.PushNotificationReRegistrationType.ReRegistrationOnAppForeground

// Re-register all users every 6 days (counteracts SFDC API cleanup of inactive devices)
PushService.pushNotificationsRegistrationType =
    PushService.PushNotificationReRegistrationType.ReRegisterPeriodically

// Control which users re-register on foreground (relevant for Publisher billing)
PushService.foregroundRegistrationMode =
    PushService.PushNotificationForegroundRegistrationMode.CURRENT_USER  // default: ALL_USERS
```

### iOS: Re-registration Mode and Custom Registration Body

```swift
// Only re-register the current user on foreground (Publisher billing scenario)
PushNotificationManager.shared.foregroundRegistrationMode = .currentUser

// Add custom fields to the MobilePushServiceDevice registration payload
PushNotificationManager.shared.customPushRegistrationBody = [
    "NetworkId": communityId
]
```

### Android: Actionable Notifications (API v64.0+)

The SDK automatically creates `NotificationChannel` objects for each Salesforce notification type after registration. To display notifications with action buttons and invoke server-side actions on tap, implement the full `PushNotificationInterface` pattern:

1. **Parse the payload** — the Salesforce notification body is in `data["content"]` (not `data["sfdc.content"]`):

```kotlin
import com.salesforce.androidsdk.push.SalesforceActionableNotificationContent

override fun onPushMessageReceived(data: Map<String?, String?>?) {
    val sfdc = data?.get("content")
        ?.let { SalesforceActionableNotificationContent.fromJson(it) }
        ?.sfdc ?: return

    // Look up notification type (fetched automatically after registration)
    val notifType = sfdc.notifType?.let {
        SalesforceReactSDKManager.getInstance().getNotificationsType(it)
    } ?: return

    // Build notification — channel ID = notifType.type
    // Action buttons come from notifType.actionGroups matched by sfdc.act?.group
    // See SalesforceMobileSDK-Android/docs/push for the full pattern
}
```

2. **Handle taps** — use a `BroadcastReceiver` (registered with `RECEIVER_NOT_EXPORTED`) and call:

```kotlin
SalesforceReactSDKManager.getInstance()
    .invokeServerNotificationAction(notificationId = nid, actionKey = actionKey)
```

See the [Android push doc](https://github.com/forcedotcom/SalesforceMobileSDK-Android/tree/dev/docs/push) for the complete `BroadcastReceiver` pattern and `NotificationCompat.Builder` setup.

### iOS: Actionable Notifications (API v64.0+)

After registration, the SDK automatically calls `fetchAndStoreNotificationTypes()`, which fetches `GET /vXX.0/connect/notifications/types` and registers `UNNotificationCategory` objects for each type. Your app receives action buttons automatically in push notifications — no additional setup is needed beyond the `UNUserNotificationCenterDelegate` wired in step 4 above.

To filter which notification types your app supports:

```swift
UserAccountManager.shared.filterSupportedNotificationTypes = { types in
    types.filter { $0.apiName == "approval_request" }
}
```

To invoke a server-side action when the user taps an action button, add this to `userNotificationCenter(_:didReceive:withCompletionHandler:)`:

```swift
// nid is nested under the "sfdc" key in userInfo, not at the top level
if let sfdc = response.notification.request.content.userInfo["sfdc"] as? [String: Any],
   let nid = sfdc["nid"] as? String {
    Task {
        try? await PushNotificationManager.shared.invokeServerNotificationAction(
            client: SFRestAPI.sharedInstance(),
            notificationId: nid,
            actionIdentifier: response.actionIdentifier
        )
    }
}
```
