plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.facebook.react")
}

react {
    autolinkLibrariesWithApp()
}

android {
    namespace = "com.salesforce.androidsdk.reactnative.tests"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.salesforce.androidsdk.reactnative.tests"
        minSdk = 31
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testApplicationId = "com.salesforce.androidsdk.salesforcereact.tests"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    sourceSets {
        getByName("main") {
            java.srcDirs("src/main/java")
            res.srcDirs("src/main/res")
            assets.srcDirs("src/main/assets")
            manifest.srcFile("src/main/AndroidManifest.xml")
        }
        getByName("androidTest") {
            java.srcDirs("src/androidTest/java")
        }
    }

    buildFeatures {
        buildConfig = true
    }

    packaging {
        resources {
            excludes += setOf("META-INF/LICENSE", "META-INF/LICENSE.txt", "META-INF/DEPENDENCIES", "META-INF/NOTICE")
        }
    }

    lint {
        abortOnError = false
    }
}

kotlin {
    jvmToolchain(17)
}

// Copy test_credentials.json from shared/test/ into assets before each build
tasks.register<Copy>("copyTestCredentials") {
    from("${rootProject.projectDir}/../../shared/test/test_credentials.json")
    into("src/main/assets")
    duplicatesStrategy = DuplicatesStrategy.INCLUDE
}
tasks.matching { it.name.startsWith("merge") && it.name.contains("Assets") }.configureEach {
    dependsOn("copyTestCredentials")
}

dependencies {
    implementation("com.facebook.react:react-android:0.84.1")
    implementation("com.facebook.react:hermes-android:0.84.1")

    androidTestImplementation("androidx.test:runner:1.6.2")
    androidTestImplementation("androidx.test:rules:1.6.1")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.uiautomator:uiautomator:2.3.0")
}
