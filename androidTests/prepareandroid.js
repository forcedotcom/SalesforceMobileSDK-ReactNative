#!/usr/bin/env node

var execSync = require('child_process').execSync;
var path = require('path');
var fs = require('fs');

console.log('=== Installing npm dependencies');
execSync('rm -rf node_modules', {stdio:[0,1,2]});
execSync("rm -rf ../iosTests/node_modules", {stdio:[0,1,2]});
execSync('rm -f yarn.lock', {stdio:[0,1,2]});
execSync('yarn install', {stdio:[0,1,2]});

console.log("=== Removing nested node_modules from react-native-force (prevents duplicate React)");
var rimrafSync = require("rimraf").sync || function(p) { execSync("rm -rf " + p); };
rimrafSync(path.join("node_modules", "react-native-force", "node_modules"));


console.log('=== Installing sdk dependencies');
execSync('node ./updatesdk.js', {stdio: [0,1,2]});

console.log('=== Copying test_credentials.json to assets');
var assetsDir = path.join('android', 'app', 'src', 'main', 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, {recursive: true});
}
var credsSrc = path.join('..', 'shared', 'test', 'test_credentials.json');
var destCredentials = path.join(assetsDir, 'test_credentials.json');
if (fs.existsSync(credsSrc)) {
    fs.copyFileSync(credsSrc, destCredentials);
} else {
    console.warn('WARNING: shared/test/test_credentials.json not found. Tests will fail at runtime.');
    console.warn('         Copy shared/test/test_credentials.json.sample and fill in your credentials.');
    fs.writeFileSync(destCredentials, '{}', 'utf8');
}

console.log('=== Creating index.android.bundle');
execSync('node ./updatebundle.js', {stdio: [0,1,2]});

console.log('=== Android test preparation complete.');
