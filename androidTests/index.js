import {AppRegistry} from 'react-native';
import HeadlessTestApp from './node_modules/react-native-force/test/HeadlessTestApp';
import TestApp from './node_modules/react-native-force/test/TestApp';

// INTENTIONAL divergence from iosTests/index.js — do NOT re-sync.
// Android instrumented tests drive the suite headlessly (no UI navigation) to
// avoid the UIAutomator scroll flakiness on Firebase Test Lab's slow ARM
// emulators, so the primary mount is HeadlessTestApp. iOS keeps mounting the
// interactive TestApp (via iosTests/index.js) so XCUITest stays green.
// For manual local UI debugging, launch the app directly (Android Studio / adb / icon tap) — no instrumentation needed.
AppRegistry.registerComponent('SalesforceReactTestApp', () => HeadlessTestApp);
AppRegistry.registerComponent('SalesforceReactTestAppInteractive', () => TestApp);
