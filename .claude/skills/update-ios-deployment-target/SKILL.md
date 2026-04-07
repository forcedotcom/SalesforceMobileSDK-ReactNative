# Update iOS Minimum Deployment Target

This skill updates the minimum iOS deployment target across the Salesforce Mobile SDK for React Native repository.

## When to Use
- When bumping the minimum supported iOS version for a new SDK release
- Typically done once per major release cycle, coordinated with iOS SDK updates

## What This Skill Does

Updates the iOS deployment target in all necessary locations:

1. **CocoaPods Specification** - Updates platform version in SalesforceReact.podspec
2. **Test App Configuration** - Updates Podfile for iOS test app
3. **Xcode Project Files** - Updates .pbxproj for test app project
4. **GitHub Actions Workflows** - Updates CI workflow matrices
5. **Documentation** - Updates README.md if it references minimum iOS version

## Usage

When invoked, ask the user for:
- **Current minimum iOS version** (e.g., "17.0")
- **New minimum iOS version** (e.g., "18.0")


## Step-by-Step Process

### 1. Update CocoaPods Specification
In `SalesforceReact.podspec`:
- Update `s.platform = :ios, "X.0"` (currently around line 8)

### 2. Update Test App Podfile
In `iosTests/ios/Podfile`:
- Update `platform :ios, 'X.0'` (currently around line 10)

### 3. Update Xcode Project Files
In `iosTests/ios/SalesforceReactTestApp.xcodeproj/project.pbxproj`:
- Find all occurrences of `IPHONEOS_DEPLOYMENT_TARGET` and update from old version to new version
- There should be 2 occurrences (Debug and Release configurations)

### 4. Update GitHub Actions Workflows
Remove the old minimum iOS version from CI workflows:

In `.github/workflows/pr.yaml`:
- Remove old iOS version from test matrix (e.g., `ios: [^26, ^18, ^17]` → `ios: [^26, ^18]`)
- Remove corresponding Xcode version mapping from matrix.include

In `.github/workflows/nightly.yaml`:
- Remove old iOS version from test matrix (e.g., `ios: [^26, ^18, ^17]` → `ios: [^26, ^18]`)
- Remove corresponding Xcode version mapping from matrix.include

### 5. Update Documentation
In `README.md`:
- Search for references to the old iOS version (e.g., "iOS 17" or "17.0")
- Update to new minimum iOS version if mentioned

## Post-Update Tasks

1. **Build Verification**: Build the iOS test app to verify no compilation errors
2. **Test Execution**: Run the iOS test suite to ensure all tests pass

```bash
cd iosTests

# Setup test workspace
./prepareios.js

# Build the test app
cd ios
xcodebuild -workspace SalesforceReactTestApp.xcworkspace \
  -scheme SalesforceReactTestApp \
  -sdk iphonesimulator \
  build

# Run tests
xcodebuild test -workspace SalesforceReactTestApp.xcworkspace \
  -scheme SalesforceReactTests \
  -sdk iphonesimulator
```

## Important Notes

- **STOP and FLAG for human review**: This is a significant change that affects all SDK consumers
- **Release timing**: Only bump deployment target at major releases, never patches
- **Breaking change**: Document this in migration guide and release notes
- **Coordinate with iOS SDK**: React Native iOS bridge depends on SalesforceMobileSDK-iOS, which must support the same or lower deployment target
- **Template impact**: Changes here affect React Native templates in the Templates repo

## Cross-Repository Coordination

This change must be coordinated with:
- **SalesforceMobileSDK-iOS**: Should have matching or lower deployment target
- **SalesforceMobileSDK-Templates**: React Native templates reference this repo and must be tested

After updating this repo:
1. Verify the iOS SDK has been updated to support the new deployment target
2. Test React Native templates using `test_template.sh` in Templates repo with updated SDK versions

## Example Command Flow

```bash
# 1. Create a feature branch
git checkout -b bump-ios-18

# 2. Use this skill to make all updates
# (skill automates file edits)

# 3. Verify changes
git diff

# 4. Build and test
cd iosTests
./prepareios.js
cd ios
xcodebuild -workspace SalesforceReactTestApp.xcworkspace \
  -scheme SalesforceReactTests \
  -sdk iphonesimulator \
  test
```

## Historical References
- PR #398: iOS 16 → iOS 17 bump

## Checklist

Before marking complete:
- [ ] SalesforceReact.podspec updated
- [ ] iosTests/ios/Podfile updated
- [ ] iosTests/ios/SalesforceReactTestApp.xcodeproj/project.pbxproj updated (2 occurrences)
- [ ] .github/workflows/pr.yaml updated (matrix and includes)
- [ ] .github/workflows/nightly.yaml updated (matrix and includes)
- [ ] README.md checked and updated if needed
- [ ] Test app builds successfully
- [ ] Test suite passes
- [ ] Coordinated with iOS SDK deployment target update
- [ ] Templates tested with new deployment target
