#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var credentialsFile = path.join('android', 'app', 'src', 'main', 'assets', 'test_credentials.json');

if (process.env.TEST_CREDENTIALS) {
    console.log('Writing test credentials from TEST_CREDENTIALS env var');
    fs.writeFileSync(credentialsFile, process.env.TEST_CREDENTIALS, 'utf8');
} else {
    console.log('TEST_CREDENTIALS env var not set - using placeholder');
    if (!fs.existsSync(credentialsFile)) {
        fs.writeFileSync(credentialsFile, '{}', 'utf8');
    }
}
