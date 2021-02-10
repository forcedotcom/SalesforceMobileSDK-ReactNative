#!/usr/bin/env node

var execSync = require('child_process').execSync;

execSync('./node_modules/.bin/react-native  bundle --platform ios --dev true --entry-file node_modules/react-native-force/test/alltests.js --bundle-output ios/index.ios.bundle --assets-dest ios/', {stdio:[0,1,2]});
