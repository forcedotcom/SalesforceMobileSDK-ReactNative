#!/usr/bin/env node

var execSync = require('child_process').execSync;

console.log('=== Installing npm dependencies');
execSync('npm install', {stdio:[0,1,2]});

console.log('=== Installing sdk dependencies');
execSync('node ./updatesdk.js', {stdio: [0,1,2]});

console.log('=== Installing pod dependencies');
execSync('pod update', {stdio:[0,1,2]});

console.log('=== Creating test_credentials.json');
execSync('touch test_credentials.json', {stdio:[0,1,2]});

console.log('=== Creating index.ios.bundle');
execSync('node ./updatebundle.js', {stdio: [0,1,2]});
