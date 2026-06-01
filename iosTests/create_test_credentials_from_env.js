#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

if (process.env.TEST_CREDENTIALS) {
    console.log('Writing test credentials from TEST_CREDENTIALS env var');
    var destDir = path.join('..', 'shared', 'test');
    fs.mkdirSync(destDir, {recursive: true});
    fs.writeFileSync(path.join(destDir, 'test_credentials.json'), process.env.TEST_CREDENTIALS, 'utf8');
} else {
    console.log('TEST_CREDENTIALS env var not set - skipping');
}
