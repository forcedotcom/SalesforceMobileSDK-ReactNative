import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else { return }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
  }

  func sceneDidBecomeActive(_ scene: UIScene) {
    guard let window,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }

    appDelegate.startReactNative(in: window, scene: scene)
  }
}
