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

    override init() {
        super.init()
        SalesforceReactSDKManager.initializeSDK()
    }

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

        AuthHelper.loginIfRequired {
            factory.startReactNative(
                withModuleName: "SalesforceReactTestApp",
                in: self.window,
                launchOptions: launchOptions
            )
        }

        return true
    }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
    override func sourceURL(for bridge: Any) -> URL? {
        return bundleURL()
    }

    override func bundleURL() -> URL? {
        return Bundle.main.url(forResource: "index.ios", withExtension: "bundle")
    }
}
