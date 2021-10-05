#!/usr/bin/env node

const path = require('path')
var execSync = require('child_process').execSync;

console.log('=== Installing npm dependencies');
execSync('rm -rf node_modules', {stdio:[0,1,2]})
execSync('rm -f yarn.lock', {stdio:[0,1,2]})
execSync('yarn install', {stdio:[0,1,2]});
var rimraf = require('rimraf');

console.log('=== Getting react native git repo (for test runner classes)');
const rnVersion = require(path.join(__dirname, '..', 'package.json')).peerDependencies['react-native']
execSync('git clone --branch v' + rnVersion + ' --single-branch --depth 1 https://github.com/facebook/react-native', {stdio:[0,1,2]});
execSync('rm -rf RCTTest', {stdio:[0,1,2]});
execSync('mv react-native/packages/rn-tester/RCTTest .');
execSync("gsed -i 's/^package = .*$/package = {}/g' RCTTest/React-RCTTest.podspec");
execSync(`gsed -i 's/^version = .*$/version = "${rnVersion}"/g' RCTTest/React-RCTTest.podspec `);
execSync('rm -rf react-native', {stdio:[0,1,2]});

console.log('=== Installing sdk dependencies');
execSync('node ./updatesdk.js', {stdio: [0,1,2]});

console.log('=== Installing pod dependencies');
execSync('pod update', {stdio:[0,1,2], cwd:'ios'});

console.log('=== Creating test_credentials.json');
execSync('touch test_credentials.json', {stdio:[0,1,2]});

console.log('=== Creating index.ios.bundle');
execSync('node ./updatebundle.js', {stdio: [0,1,2]});
