#!/usr/bin/env node

var execFileSync = require('child_process').execFileSync;
var path = require('path');
var fs = require('fs');

var assetsDir = path.join('android', 'app', 'src', 'main', 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, {recursive: true});
}

execFileSync('node', [
    'node_modules/react-native/cli.js', 'bundle',
    '--platform', 'android',
    '--dev', 'false', '--minify', 'false',
    '--entry-file', 'index.js',
    '--bundle-output', path.join(assetsDir, 'index.android.bundle'),
    '--assets-dest', assetsDir
], {stdio:[0,1,2]});
