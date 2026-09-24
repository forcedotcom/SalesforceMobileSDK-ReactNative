import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import SalesforceReact
import SalesforceSDKCore

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  private var launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  private var hasStartedReactNative = false

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    self.launchOptions = launchOptions

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    return true
  }

  func application(
    _ application: UIApplication,
    configurationForConnecting connectingSceneSession: UISceneSession,
    options: UIScene.ConnectionOptions
  ) -> UISceneConfiguration {
    UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
  }

  func startReactNative(in window: UIWindow, scene: UIScene) {
    guard !hasStartedReactNative, let factory = reactNativeFactory else { return }
    hasStartedReactNative = true
    let launchOptions = launchOptions
    // With -creds, SDK initialization performs a synchronous OAuth refresh.
    // SceneDelegate calls this only after the scene becomes active; re-entering
    // the main run loop earlier in application startup crashes iOS 18.
    SalesforceReactSDKManager.initializeSDK()

    let startReactNative = {
      factory.startReactNative(
        withModuleName: "SalesforceReactTestApp",
        in: window,
        launchOptions: launchOptions
      )
    }

    // The SDK has already completed the UI-test login while consuming -creds.
    if ProcessInfo.processInfo.arguments.contains("-creds") {
      startReactNative()
    } else {
      AuthHelper.loginIfRequired(scene) {
        startReactNative()
      }
    }
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
    Bundle.main.url(forResource: "index.ios", withExtension: "bundle")
  }
}
