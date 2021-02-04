#!/usr/bin/env node

const path = require('path')
var execSync = require('child_process').execSync;
var rimraf = require('rimraf');

console.log('=== Installing npm dependencies');
rimraf.sync('node_modules');
rimraf.sync('yarn.lock');
execSync('yarn install', {stdio:[0,1,2]});

console.log('=== Getting react native git repo (for test runner classes)');
const rnVersion = require(path.join(__dirname, '..', 'package.json')).peerDependencies['react-native']
execSync('git clone --branch v' + rnVersion + ' --single-branch --depth 1 https://github.com/facebook/react-native', {stdio:[0,1,2]});
rimraf.sync('RCTTest');
execSync('mv react-native/RNTester/RCTTest .');
execSync("gsed -i 's/^package = .*$/package = {}/g' RCTTest/React-RCTTest.podspec");
execSync(`gsed -i 's/^version = .*$/version = "${rnVersion}"/g' RCTTest/React-RCTTest.podspec `);
rimraf.sync('react-native');

console.log('=== Installing sdk dependencies');
execSync('node ./updatesdk.js', {stdio: [0,1,2]});

console.log('=== Installing pod dependencies');
execSync('pod update', {stdio:[0,1,2], cwd:'ios'});

console.log('=== Creating test_credentials.json');
execSync('touch test_credentials.json', {stdio:[0,1,2]});

console.log('=== Creating index.ios.bundle');
execSync('node ./updatebundle.js', {stdio: [0,1,2]});
