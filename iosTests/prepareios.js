#!/usr/bin/env node

const path = require('path')
var execSync = require('child_process').execSync;

console.log('=== Installing npm dependencies');
execSync('rm -rf node_modules', {stdio:[0,1,2]})
execSync("rm -rf ../androidTests/node_modules", {stdio:[0,1,2]});
execSync('rm -f yarn.lock', {stdio:[0,1,2]})
execSync('yarn install', {stdio:[0,1,2]});

console.log("=== Removing nested node_modules from react-native-force (prevents duplicate React)");
execSync("rm -rf node_modules/react-native-force/node_modules", {stdio:[0,1,2]});
execSync("rm -rf ../androidTests/node_modules", {stdio:[0,1,2]});

var rimraf = require('rimraf');

// RCTTest/ is now tracked in the repo (customized for RN 0.82+ bridgeless mode).
// No longer cloned from react-native source.

console.log('=== Installing sdk dependencies');
execSync('node ./updatesdk.js', {stdio: [0,1,2]});

console.log('=== Installing pod dependencies');
const nodePath = execSync('command -v node', { encoding: 'utf-8' }).trim();
execSync(`echo export NODE_BINARY=${nodePath} > .xcode.env`, {stdio:[0,1,2], cwd:'ios'});
execSync('pod update', {stdio:[0,1,2], cwd:'ios'});

console.log('=== Copying test_credentials.json');
var fs = require('fs');
var credsSrc = '../shared/test/test_credentials.json';
if (fs.existsSync(credsSrc)) {
    fs.copyFileSync(credsSrc, 'ios/test_credentials.json');
} else if (!fs.existsSync('ios/test_credentials.json')) {
    console.warn('WARNING: shared/test/test_credentials.json not found. Tests will fail at runtime.');
    console.warn('         Copy shared/test/test_credentials.json.sample and fill in your credentials.');
    fs.writeFileSync('ios/test_credentials.json', '{}', 'utf8');
}

console.log('=== Creating index.ios.bundle');
execSync('node ./updatebundle.js', {stdio: [0,1,2]});
