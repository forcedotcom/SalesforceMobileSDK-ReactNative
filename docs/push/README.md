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
            // Example: data["sfdc.content"] contains the Salesforce notification body.
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
        PushNotificationManager.shared.registerForSalesforceNotifications { _ in }
    }
    // If not yet logged in, the SDK auto-registers after login
}

func application(_ application: UIApplication,
                 didFailToRegisterForRemoteNotificationsWithError error: Error) {
    SalesforceLogger.e(AppDelegate.self, message: "APNs registration failed: \(error)")
}
```

### 4. Handle Incoming Notifications (Optional)

Add `UNUserNotificationCenterDelegate` to control foreground display and handle taps:

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
        // Handle notification tap — forward to JS if needed (see section below)
        handler()
    }
}
```

Set the delegate early in `didFinishLaunchingWithOptions`:
```swift
UNUserNotificationCenter.current().delegate = self
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

The extension must share the same **App Group** as the main app to access the Keychain RSA key. Add the App Group capability to both targets.

---

## Forwarding Push Payloads to JavaScript

There is no built-in JS push API. To route incoming push data to the JavaScript layer, implement a simple React Native event emitter.

### Android

In your `PushNotificationInterface.onPushMessageReceived`:

```kotlin
override fun onPushMessageReceived(data: Map<String?, String?>?) {
    val reactContext = SalesforceReactSDKManager.getInstance()
        .reactInstanceManager
        ?.currentReactContext ?: return

    val params = Arguments.createMap()
    data?.forEach { (key, value) -> params.putString(key ?: "", value ?: "") }

    reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("SalesforcePushNotification", params)
}
```

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

### Android: Custom PushService Subclass

Subclass `PushService` to customize registration payloads or react to status changes:

```kotlin
class MyPushService : PushService() {
    override fun onPushNotificationRegistrationStatus(status: Int, userAccount: UserAccount?) {
        when (status) {
            REGISTRATION_STATUS_SUCCEEDED -> { /* log, analytics */ }
            REGISTRATION_STATUS_FAILED -> { /* alert */ }
        }
    }
}

// Register it:
SalesforceReactSDKManager.getInstance().pushServiceType = MyPushService::class.java
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

### iOS: Actionable Notifications (API v64.0+)

Filter which notification types your app supports:

```swift
UserAccountManager.shared.filterSupportedNotificationTypes = { types in
    types.filter { $0.apiName == "approval_request" }
}
```
