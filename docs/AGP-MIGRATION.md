# AGP built-in Kotlin and Android DSL migration

Status: pending upstream plugin compatibility; retain the AGP 9 opt-outs for now.

Migrate the standalone Android bridge and Android test app to built-in Kotlin
and the new Android DSL together with the React Native Gradle plugin and Mobile
SDK convention plugins. Remove `android.builtInKotlin=false` and
`android.newDsl=false` from both Gradle properties files only after verifying:

- The bridge and native SDK plugins configure without the legacy Kotlin plugin
  or Android DSL APIs.
- The standalone bridge and generated consumers compile in Debug and Release.
- Android bridge tests pass with the new configuration.
- The React Native templates and preparation documentation use the same policy.

Do not remove the flags merely to silence deprecation notices. This migration
is a follow-up to the React Native 0.87 upgrade, not part of its compatibility
adjustment.
