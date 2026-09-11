pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    @Suppress("UnstableApiUsage")
    repositories {
        google()
        mavenCentral()
    }
}

// Root project name.  The publish-module convention plugin only wires up Maven
// Central publishing when this is the root project, so it is a no-op when the
// android/ library is consumed by an app via React Native autolinking.
rootProject.name = "SalesforceMobileSDK-ReactNative"

// The React Native library's Android sources live under android/.  Expose them
// as the :SalesforceReact module so the artifact publishes as
// com.salesforce.mobilesdk:SalesforceReact, matching the artifact that was
// previously published from SalesforceMobileSDK-Android.
include(":SalesforceReact")
project(":SalesforceReact").projectDir = file("android")
