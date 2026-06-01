#!/usr/bin/env node

var execSync = require('child_process').execSync;
var path = require('path');
var fs = require('fs');

console.log('=== Installing npm dependencies');
execSync('rm -rf node_modules', {stdio:[0,1,2]});
execSync('rm -f yarn.lock', {stdio:[0,1,2]});
execSync('yarn install', {stdio:[0,1,2]});

console.log('=== Installing sdk dependencies');
execSync('node ./updatesdk.js', {stdio: [0,1,2]});

console.log('=== Copying test_credentials.json to assets');
var assetsDir = path.join('android', 'app', 'src', 'main', 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, {recursive: true});
}
var srcCredentials = 'test_credentials.json';
var destCredentials = path.join(assetsDir, 'test_credentials.json');
if (fs.existsSync(srcCredentials)) {
    fs.copyFileSync(srcCredentials, destCredentials);
} else {
    console.warn('WARNING: test_credentials.json not found. Tests will fail at runtime.');
    console.warn('         Place your test_credentials.json in androidTests/ and re-run.');
    fs.writeFileSync(destCredentials, '{}', 'utf8');
}

console.log('=== Creating index.android.bundle');
execSync('node ./updatebundle.js', {stdio: [0,1,2]});

console.log('=== Android test preparation complete.');
