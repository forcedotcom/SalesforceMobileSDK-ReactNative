import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import SalesforceReact
import SalesforceSDKCore

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  private var launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?
  private var startReactNative: (() -> Void)?

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

    window = UIWindow(frame: UIScreen.main.bounds)

    startReactNative = {
      factory.startReactNative(
        withModuleName: "SalesforceReactTestApp",
        in: self.window,
        launchOptions: launchOptions
      )
    }

    return true
  }

  func applicationDidBecomeActive(_ application: UIApplication) {
    guard let startReactNative else { return }
    self.startReactNative = nil

    // With -creds, SDK initialization performs a synchronous OAuth refresh.
    // Run it only after UIKit has completed initial scene activation; re-entering
    // the main run loop from the application initializer crashes iOS 18.
    SalesforceReactSDKManager.initializeSDK()

    // The SDK has already completed the UI-test login while consuming -creds.
    if ProcessInfo.processInfo.arguments.contains("-creds") {
      startReactNative()
    } else {
      AuthHelper.loginIfRequired() {
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
