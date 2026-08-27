apply(plugin = "io.github.gradle-nexus.publish-plugin")
apply(from = "${rootDir}/publish/publish-root.gradle")

buildscript {
    repositories {
        maven("https://plugins.gradle.org/m2/")
        google()
        mavenCentral()
    }

    dependencies {
        classpath("com.android.tools.build:gradle:8.12.0")
        classpath("io.github.gradle-nexus:publish-plugin:2.0.0")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:2.3.20")
    }
}

// Single source of truth for the SDK version: package.json (stamped by
// setversion.sh).  Keeps the published Maven version in lockstep with the npm
// package and the MobileSync dependency declared in android/build.gradle.
val sdkVersion = (groovy.json.JsonSlurper().parse(file("package.json")) as Map<*, *>)["version"] as String

allprojects {
    group = "com.salesforce.mobilesdk"
    version = sdkVersion
}
