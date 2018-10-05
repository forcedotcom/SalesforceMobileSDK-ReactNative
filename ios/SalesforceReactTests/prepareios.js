#!/usr/bin/env node

var packageJson = require('./package.json')
var execSync = require('child_process').execSync;
var path = require('path');
var fs = require('fs');

console.log('=== Installing npm dependencies');
execSync('npm install', {stdio:[0,1,2]});

var rimraf = require('rimraf');

console.log('=== Installing sdk dependencies');
var sdkDependency = 'SalesforceMobileSDK-iOS';
var repoUrlWithBranch = packageJson.sdkDependencies[sdkDependency];
var parts = repoUrlWithBranch.split('#'), repoUrl = parts[0], branch = parts.length > 1 ? parts[1] : 'master';
var targetDir = path.join('mobile_sdk', sdkDependency);
rimraf.sync(targetDir);
execSync('git clone --branch ' + branch + ' --single-branch --depth 1 ' + repoUrl + ' ' + targetDir, {stdio:[0,1,2]});
rimraf.sync(path.join('mobile_sdk', 'SalesforceMobileSDK-iOS', 'libs', 'SalesforceReact', 'package.json')); // confuses metro bundler

console.log('=== Installing pod dependencies');
execSync('pod update', {stdio:[0,1,2]});

console.log('=== Creating test_credentials.json');
execSync('touch test_credentials.json', {stdio:[0,1,2]});

console.log('=== Creating index.ios.bundle');
execSync('node_modules/.bin/react-native  bundle --platform ios --dev true --entry-file node_modules/react-native-force/test/alltests.js --bundle-output SalesforceReactTests/index.ios.bundle --assets-dest SalesforceReactTests/', {stdio:[0,1,2]});
