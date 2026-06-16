# Upgrade React Native Version

Upgrades the React Native version in the SalesforceMobileSDK-ReactNative and SalesforceMobileSDK-Templates repos.

## When to Use

When bumping React Native from one minor/patch version to another (e.g., 0.84.x → 0.85.x) as part of the SDK's regular RN upgrade cadence.

## Parameters

- `OLD_VERSION`: Current RN version (e.g., `0.84.1`)
- `NEW_VERSION`: Target RN version (e.g., `0.85.3`)
- `BRANCH`: Feature branch name (e.g., `rn-upgrade-0.85`)
- `FORK_USER`: GitHub username for the personal fork (e.g., `wmathurin`)

## Process

---

### Phase 1: Pre-Checks

**1a. Find the latest patch**
```bash
curl -s "https://registry.npmjs.org/react-native" | python3 -c "
import sys, json
data = json.load(sys.stdin)
versions = [v for v in data['versions'] if v.startswith('NEW_MINOR.')]
print('Latest:', versions[-1])
"
```

**1b. Check React peer dep for the new version**
```bash
curl -s "https://registry.npmjs.org/react-native/NEW_VERSION" | python3 -c "
import sys, json; d=json.load(sys.stdin)
print('React peer dep:', d['peerDependencies'].get('react'))
"
```

**1c. Grep for removed/deprecated APIs in our source**

Check the RN release blog for removed APIs, then grep:
```bash
# Examples from past upgrades — always check the release notes for the actual list
grep -r "StyleSheet\.absoluteFillObject" src/ test/
grep -r "CatalystInstanceImpl\|NativeViewHierarchyManager\|ReactTextUpdate\|UIManagerHelper" android/
grep -r "RCTHostRuntimeDelegate" ios/
grep -r "preset.*react-native" --include="*.json" --include="*.js" .
```

If any hits: fix before bumping. If clean: proceed.

---

### Phase 2: Version Bumps — ReactNative repo

Edit these files, replacing OLD_VERSION → NEW_VERSION everywhere:

| File | Fields |
|------|--------|
| `package.json` | `peerDependencies["react-native"]`, `devDependencies["@react-native/*"]` |
| `iosTests/package.json` | `dependencies["react-native"]`, `devDependencies["@react-native/*"]`, `dependencies["react-native-force"]` URL `#rn-upgrade-OLD` → `#rn-upgrade-NEW` |
| `androidTests/package.json` | same as iosTests |
| `android/build.gradle` | `react-android:OLD_VERSION` → `react-android:NEW_VERSION` |
| `androidTests/android/app/build.gradle.kts` | `react-android:OLD`, `hermes-android:OLD` → NEW |

**React version**: Only change if the new RN requires a different React version (check peer dep from Phase 1b). Usually stays the same.

**Commit and push** to `origin BRANCH`.

---

### Phase 3: Version Bumps — Templates repo

The 4 RN templates all need the same bumps:
- `ReactNativeTemplate/package.json`
- `ReactNativeTypeScriptTemplate/package.json`
- `ReactNativeDeferredTemplate/package.json`
- `MobileSyncExplorerReactNative/package.json`

In each, update:
- `dependencies["react-native"]`
- `dependencies["@react-native/new-app-screen"]`
- `dependencies["react-native-force"]` URL `#rn-upgrade-OLD` → `#rn-upgrade-NEW`
- `devDependencies["@react-native/*"]`

**Commit and push** to `origin BRANCH`.

---

### Phase 4: Regenerate Android Codegen

This must be done from the **ReactNative repo root** after the version bumps. It regenerates the pre-built C++ JavaTurboModule wrappers shipped in the npm package.

```bash
# Install deps and build TypeScript
npm install
npm run build

# Delete old generated output
rm -rf android/generated/source/codegen

# Run codegen
npx react-native codegen --path . --outputPath . --platform android

# Move output to committed location
mv android/app/build/generated/source/codegen android/generated/source/codegen
rm -rf android/app
```

Check `git diff android/generated/` — if there are changes, review them (they reflect spec changes). If no diff, the output is identical and no follow-up is needed.

**Commit** the codegen output (even if unchanged, to prove it was regenerated).

---

### Phase 5: iOS Preparation

```bash
cd iosTests
node prepareios.js
```

This runs yarn install, re-clones SalesforceMobileSDK-iOS, and runs `pod update`. It downloads prebuilt RN Core/Dependencies/Hermes tarballs from Maven Central (~150MB). Expect 3–5 minutes.

**Gotcha**: `prepareios.js` and `updatesdk.js` must not use `rimraf` — it's no longer a transitive dep in newer RN versions. Use `fs.rmSync(..., {recursive: true, force: true})` (cross-platform) instead. The `prepareios.js`/`prepareandroid.js` scripts run on Mac only (iOS/Android dev machines), but `updatesdk.js` shell cleanup should still use Node's `fs` API for portability.

After `pod update`, commit `iosTests/ios/SalesforceReactTestApp.xcodeproj/project.pbxproj`.

**Run iOS tests**: Open `iosTests/ios/SalesforceReactTestApp.xcworkspace` in Xcode and run Cmd+U. Expect 35/35.

---

### Phase 6: Android Preparation

```bash
cd androidTests
node prepareandroid.js
```

This runs yarn install, clones SalesforceMobileSDK-Android, patches Gradle files, and builds the JS bundle.

**Run Android tests** from the command line. Use `numShards=1` to prevent the parallelism-induced `NetworkOnMainThreadException` flake in `testCleanResyncGhosts`:

```bash
cd android
./gradlew connectedAndroidTest -Pandroid.testInstrumentationRunnerArguments.numShards=1
```

Expect 35/35. Without `numShards=1`, `testCleanResyncGhosts` may timeout due to token refresh on the main thread under parallel load — passes in isolation, so this is a pre-existing emulator flake, not a regression.

---

### Phase 7: Template Validation

**7a. Automated build test** — verifies install + compile, no app launch:
```bash
cd SalesforceMobileSDK-Templates
./test_template.sh \
  --rn-force-org FORK_USER \
  --rn-force-branch BRANCH \
  --platform ios
./test_template.sh \
  --rn-force-org FORK_USER \
  --rn-force-branch BRANCH \
  --platform android
```

**7b. Manual smoke test** — verifies login + basic app functionality. For each of the 4 templates:

1. In the template directory, temporarily point `react-native-force` to your fork branch:
   ```json
   "react-native-force": "git+https://github.com/FORK_USER/SalesforceMobileSDK-ReactNative.git#BRANCH"
   ```

2. Install dependencies:
   ```bash
   node installios.js    # iOS — clones iOS SDK, runs pod install
   node installandroid.js # Android — clones Android SDK
   ```

3. Inject credentials (per `docs/TESTING_CREDENTIALS.md` in the Workspace repo):
   ```bash
   # iOS — run from template root
   sed -i '' 's|<string>__INSERT_DEFAULT_LOGIN_SERVER__</string>|<string>authflowtestingmsdksdb38.test1.my.pc-rnd.salesforce.com</string>|' ios/<AppName>/Info.plist
   sed -i '' 's|__INSERT_CONSUMER_KEY_HERE__|3MVG9H2sjXhorwC_Obi8SL7EU.SfZl1KKgEOJGl6Vza1ssDxuInaD1hOxpbpYND3JBEjefBfQtSM.CqtyUVn6|' ios/<AppName>/bootconfig.plist
   sed -i '' 's|__INSERT_CALLBACK_URL_HERE__|ecaadvancedjwt://success/done|' ios/<AppName>/bootconfig.plist

   # Android — run from template root
   sed -i '' 's|__INSERT_DEFAULT_LOGIN_SERVER__|https://authflowtestingmsdksdb38.test1.my.pc-rnd.salesforce.com|' android/app/src/main/res/xml/servers.xml
   sed -i '' 's|__INSERT_CONSUMER_KEY_HERE__|3MVG9H2sjXhorwC_Obi8SL7EU.SfZl1KKgEOJGl6Vza1ssDxuInaD1hOxpbpYND3JBEjefBfQtSM.CqtyUVn6|' android/app/src/main/res/values/bootconfig.xml
   sed -i '' 's|__INSERT_CALLBACK_URL_HERE__|ecaadvancedjwt://success/done|' android/app/src/main/res/values/bootconfig.xml
   ```

4. Build and run in Xcode / Android Studio. Verify: login screen appears → login succeeds → app main screen loads.

5. After testing, revert credential files: `git checkout ios/<AppName>/Info.plist ios/<AppName>/bootconfig.plist` etc. Do NOT commit credentials.

---

### Phase 8: Docs and PRs

Update version references in:
- `README.md` (ReactNative repo): RN version compat table
- Any other docs referencing the old RN version

**⚠️ Pre-merge step** (do NOT merge without this):
- Revert `react-native-force` URLs in `iosTests/package.json`, `androidTests/package.json`, and all 4 template `package.json` files from `FORK_USER#BRANCH` back to `forcedotcom#dev`
- If this revert is done before merging, no post-merge cleanup PR is needed

**Create PRs**:
```bash
# ReactNative → forcedotcom/dev
gh pr create --repo forcedotcom/SalesforceMobileSDK-ReactNative --base dev

# Templates → forcedotcom/dev
gh pr create --repo forcedotcom/SalesforceMobileSDK-Templates --base dev

# Workspace → SalesforceMobileSDK/main
GH_HOST=git.soma.salesforce.com gh pr create --repo SalesforceMobileSDK/SalesforceMobileSDK-Workspace --base main
```

---

## File Checklist

**ReactNative repo:**
- [ ] `package.json` — RN peer dep + `@react-native/*` devDeps bumped
- [ ] `iosTests/package.json` — RN + `@react-native/*` + `react-native-force` URL bumped
- [ ] `androidTests/package.json` — same
- [ ] `android/build.gradle` — `react-android` bumped
- [ ] `androidTests/android/app/build.gradle.kts` — `react-android` + `hermes-android` bumped
- [ ] `android/generated/source/codegen/` — regenerated
- [ ] `iosTests/ios/SalesforceReactTestApp.xcodeproj/project.pbxproj` — updated after pod install
- [ ] iOS tests: 35/35 pass
- [ ] Android tests: 35/35 pass

**Templates repo:**
- [ ] `ReactNativeTemplate/package.json` bumped
- [ ] `ReactNativeTypeScriptTemplate/package.json` bumped
- [ ] `ReactNativeDeferredTemplate/package.json` bumped
- [ ] `MobileSyncExplorerReactNative/package.json` bumped
- [ ] All 4 templates build on iOS and Android
- [ ] Manual smoke test on iOS simulator and Android emulator

**Before merging PRs:**
- [ ] `react-native-force` URLs reverted to `forcedotcom#dev` in all 6 files

---

## Known Gotchas

- **rimraf**: No longer a transitive dep starting around RN 0.85.x. Any `require('rimraf')` in prepare/updatesdk scripts will throw at runtime. Use `fs.rmSync(..., {recursive: true, force: true})` for cross-platform directory removal in scripts that run on all OSes; Unix shell `rm -rf` is fine for Mac-only scripts like `prepareios.js`.

- **Codegen output**: The `android/generated/source/codegen/` files are committed to the repo and shipped in the npm package. Always regenerate after a version bump even if you don't expect changes — the files contain the RN version implicitly via generated headers.

- **prepareios.js sandbox**: Running `prepareios.js` inside Claude Code's sandbox may fail with `EPERM` when deleting the old `mobile_sdk/SalesforceMobileSDK-iOS` clone (the `.git` directory is read-only in sandbox). Use `dangerouslyDisableSandbox: true` or run directly in a terminal.

- **React version**: Check the new RN's `peerDependencies.react` before assuming it stays the same. It changed between 0.83 and 0.84 (19.2.6 → 19.2.3).

- **`@react-native/new-app-screen`**: A dependency in the template `package.json` files that also tracks the RN version. Easy to miss.

## Version History

| RN Version | React Version | Hermes | Notable Changes |
|------------|---------------|--------|-----------------|
| 0.86.0 | 19.2.3 | — | No breaking changes; Android edge-to-edge fixes for API 36+; Metro 0.84.4; `PODFILE_DIR` added to pbxproj by pod install; use `numShards=1` for Android tests |
| 0.85.3 | 19.2.3 | 250829098.0.10 | `StyleSheet.absoluteFillObject` removed (not used by us); Yoga migrated to Kotlin on Android (no impact); `rimraf` no longer transitive |
| 0.84.1 | 19.2.3 | 250829098.0.9 | New Architecture default; bridgeless mode |
| 0.83.9 | 19.2.6 | — | Black screen after login fix needed (Android `recreate()` in `onResume`) |
