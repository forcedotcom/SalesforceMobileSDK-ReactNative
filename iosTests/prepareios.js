#!/usr/bin/env node

const path = require('path')
var execSync = require('child_process').execSync;

console.log('=== Installing npm dependencies');
execSync('rm -rf node_modules', {stdio:[0,1,2]})
execSync('rm -f yarn.lock', {stdio:[0,1,2]})
execSync('yarn install', {stdio:[0,1,2]});
var rimraf = require('rimraf');

// RCTTest/ is now tracked in the repo (customized for RN 0.82+ bridgeless mode).
// No longer cloned from react-native source.

console.log('=== Installing sdk dependencies');
execSync('node ./updatesdk.js', {stdio: [0,1,2]});

console.log('=== Installing pod dependencies');
const nodePath = execSync('command -v node', { encoding: 'utf-8' }).trim();
execSync(`echo export NODE_BINARY=${nodePath} > .xcode.env`, {stdio:[0,1,2], cwd:'ios'});
execSync('pod update', {stdio:[0,1,2], cwd:'ios'});

console.log('=== Creating test_credentials.json');
execSync('touch test_credentials.json', {stdio:[0,1,2]});

console.log('=== Creating index.ios.bundle');
execSync('node ./updatebundle.js', {stdio: [0,1,2]});
