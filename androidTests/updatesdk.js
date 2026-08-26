#!/usr/bin/env node

var packageJson = require('./package.json');
var execSync = require('child_process').execSync;
var execFileSync = require('child_process').execFileSync;
var path = require('path');
var fs = require('fs');

var sdkDependency = 'SalesforceMobileSDK-Android';
var repoUrlWithBranch = packageJson.sdkDependencies[sdkDependency];
var parts = repoUrlWithBranch.split('#');
var repoUrl = parts[0];
var branch = parts.length > 1 ? parts[1] : 'dev';
var targetDir = path.join('mobile_sdk', sdkDependency);

execSync('rm -rf ' + targetDir);
execFileSync('git', ['clone', '--branch', branch, '--single-branch', '--depth', '1', repoUrl, targetDir], {stdio:[0,1,2]});

// Remove unnecessary directories
execSync('rm -rf ' + path.join(targetDir, 'hybrid'));
execSync('rm -rf ' + path.join(targetDir, 'native'));
execSync('rm -rf ' + path.join(targetDir, 'libs', 'SalesforceHybrid'));
execSync('rm -rf ' + path.join(targetDir, 'libs', 'SalesforceReact'));
execSync('rm -rf ' + path.join(targetDir, 'libs', 'test'));

// Patch settings.gradle.kts to exclude sample apps and removed libs
var settingsFile = path.join(targetDir, 'settings.gradle.kts');
if (fs.existsSync(settingsFile)) {
    var settings = fs.readFileSync(settingsFile, 'utf8');
    settings = settings.replace(/^include\("(hybrid|native|libs:SalesforceReact|libs:SalesforceHybrid).*$/gm, '// $&');
    fs.writeFileSync(settingsFile, settings, 'utf8');
    console.log('Patched settings.gradle.kts');
}

// Patch root build.gradle.kts to remove publish/dokka plugins
var rootBuildFile = path.join(targetDir, 'build.gradle.kts');
if (fs.existsSync(rootBuildFile)) {
    var content = fs.readFileSync(rootBuildFile, 'utf8');
    content = content.replace(/^apply\(plugin = "io\.github\.gradle-nexus\.publish-plugin"\).*$/gm, '');
    content = content.replace(/^apply\(from = .*publish-root.*\).*$/gm, '');
    content = content.replace(/^apply\(plugin = "org\.jetbrains\.dokka"\).*$/gm, '');
    content = content.replace(/^extensions\.configure[\s\S]*?^}/gm, '');
    content = content.replace(/^dependencies \{[\s\S]*?^}/gm, '');
    content = content.replace(/^tasks\.register<Jar>[\s\S]*?^}/gm, '');
    fs.writeFileSync(rootBuildFile, content, 'utf8');
    console.log('Patched root build.gradle.kts (removed publish/dokka)');
}

// Strip publish-module plugin
var buildSrcFile = path.join(targetDir, 'buildSrc', 'src', 'main', 'kotlin', 'publish-module.gradle.kts');
if (fs.existsSync(buildSrcFile)) {
    fs.writeFileSync(buildSrcFile, '// Stripped for test builds\n', 'utf8');
    console.log('Stripped publish-module plugin');
}

// Remove dokka plugin from individual lib build.gradle.kts files
var libsDir = path.join(targetDir, 'libs');
var libNames = ['SalesforceAnalytics', 'SalesforceSDK', 'SmartStore', 'MobileSync'];
libNames.forEach(function(lib) {
    var libBuildFile = path.join(libsDir, lib, 'build.gradle.kts');
    if (fs.existsSync(libBuildFile)) {
        var libContent = fs.readFileSync(libBuildFile, 'utf8');
        libContent = libContent.replace(/\s*id\("org\.jetbrains\.dokka"\)/g, '');
        fs.writeFileSync(libBuildFile, libContent, 'utf8');
    }
});
console.log('Removed dokka from lib build files');

// Patch AGP version to 8.12.0 for compatibility with test project
var buildSrcBuildFile = path.join(targetDir, 'buildSrc', 'build.gradle.kts');
if (fs.existsSync(buildSrcBuildFile)) {
    var bsContent = fs.readFileSync(buildSrcBuildFile, 'utf8');
    bsContent = bsContent.replace(/"com\.android\.tools\.build:gradle:[^"]+"/g, '"com.android.tools.build:gradle:8.12.0"');
    fs.writeFileSync(buildSrcBuildFile, bsContent, 'utf8');
    console.log('Patched buildSrc AGP to 8.12.0');
}
if (fs.existsSync(rootBuildFile)) {
    var rootContent = fs.readFileSync(rootBuildFile, 'utf8');
    rootContent = rootContent.replace(/"com\.android\.tools\.build:gradle:[^"]+"/g, '"com.android.tools.build:gradle:8.12.0"');
    fs.writeFileSync(rootBuildFile, rootContent, 'utf8');
    console.log('Patched root build.gradle.kts AGP to 8.12.0');
}
