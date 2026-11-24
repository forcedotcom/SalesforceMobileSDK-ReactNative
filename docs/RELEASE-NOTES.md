# Release notes

## 14.1 — React Native 0.87

JavaScriptCore is no longer supported. Hermes is required on Android and iOS.

React Native 0.87 requires Node.js `^22.13.0 || ^24.3.0 || >=26.0.0`.
The bridge and templates adopt that upstream requirement, including the
intentional exclusion of Node 23 and 25. Node 22 before 22.13.0 and Node 24
before 24.3.0 are also outside the supported range. This narrows the previous
Node requirement; update development and CI environments before upgrading.

Sources: the React Native 0.87
[package manifest](https://github.com/facebook/react-native/blob/v0.87.0/packages/react-native/package.json)
and [Gradle plugin manifest](https://github.com/facebook/react-native/blob/v0.87.0/packages/gradle-plugin/package.json).

The Android bridge and native SDK libraries compile against SDK 36. Generated
apps and test apps continue to compile against SDK 37 with AGP 9.1.1. The app
builds pin AGP resolution because React Native 0.87 defaults to 9.2.1; the
AGP 9.2+ upgrade is deferred to MSDK 15.0. The library's compile SDK does not
set the app's target SDK.
