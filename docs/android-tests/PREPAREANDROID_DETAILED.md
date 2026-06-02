# prepareandroid.js — Detailed Breakdown

This document explains what `androidTests/prepareandroid.js` does step by step.

## Overview

`prepareandroid.js` prepares the Android test project for building and running instrumentation tests. It installs dependencies, clones the Android SDK for composite build, copies test credentials, and creates the JS bundle.

Run from the `androidTests/` directory:

```bash
cd androidTests
node prepareandroid.js
```

---

## Step-by-Step

### 1. Install npm Dependencies

Removes stale `node_modules` and `yarn.lock` for a clean install. Installs:
- `react-native` (the RN framework)
- `react-native-force` via `file:..` (local bridge code from this repo)
- Babel, Metro, and other dev dependencies

### 2. Clone Android SDK (`updatesdk.js`)

`updatesdk.js` reads `sdkDependencies` from `package.json` and clones the Android SDK repo to `mobile_sdk/SalesforceMobileSDK-Android/`.

It then patches the SDK's build files to work as a composite build:

- **Patches `settings.gradle.kts`**: Removes references to projects not needed for testing
- **Patches root `build.gradle.kts`**: Removes `dokka` and `publish` plugins (not needed and cause build failures in composite mode)
- **Strips `publish-module` plugin**: Removes the custom publish plugin from library build files
- **Aligns AGP version**: Patches Android Gradle Plugin version to match the test project (e.g., 8.12.0)

### 3. Copy Test Credentials

Copies `shared/test/test_credentials.json` to `android/app/src/main/assets/test_credentials.json` where the Android `TestCredentials.java` class reads it at runtime.

If the file is not found, a warning is printed and an empty `{}` placeholder is written (tests will fail at runtime with a clear error).

**Note:** The Gradle `copyTestCredentials` task in `app/build.gradle.kts` also copies this file at build time as a safety net, so credentials are picked up even if `prepareandroid.js` ran before the file was created.

### 4. Create JS Bundle

`updatebundle.js` runs the Metro bundler to create `android/app/src/main/assets/index.android.bundle`.

The bundle is created with `--dev false --minify false`:

- **`--dev false`**: Dev mode enables the DevTools bridge which crashes Hermes in the test runner context.
- **`--minify false`**: Test functions are named declarations (`function testSyncDown() {}`) and their names are used for `AppRegistry.registerComponent` registration. Minification would mangle these names, breaking the test runner's ability to invoke individual tests.

---

## Output

After running successfully, the `androidTests/` directory contains:

```
androidTests/
├── android/app/src/main/assets/
│   ├── index.android.bundle          ← JS test bundle
│   └── test_credentials.json         ← credentials for auth
├── mobile_sdk/
│   └── SalesforceMobileSDK-Android/  ← cloned + patched SDK
└── node_modules/
    ├── react-native/                  ← RN framework
    └── react-native-force/            ← symlink to ../..
```

---

## Gradle Safety Net

The `app/build.gradle.kts` includes a `copyTestCredentials` task that runs before asset merging. This ensures that even if you update `shared/test/test_credentials.json` after running `prepareandroid.js`, the latest credentials are copied into assets at build time.

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `Failed to read test_credentials.json` at runtime | Missing or empty credentials file | Place valid credentials at `shared/test/test_credentials.json` |
| `yarn install` fails | Network issue or incompatible Node version | Ensure Node 20+, check network |
| Gradle build fails with dependency errors | Stale `mobile_sdk/` clone | Delete `mobile_sdk/` and re-run |
| Bundle fails with Metro error | Incompatible babel config | Delete `node_modules/` and re-run |
