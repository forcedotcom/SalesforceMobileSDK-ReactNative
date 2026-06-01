#!/usr/bin/env node

var fs = require('fs');

if (process.env.TEST_CREDENTIALS) {
    console.log('Writing test credentials from TEST_CREDENTIALS env var');
    fs.writeFileSync('test_credentials.json', process.env.TEST_CREDENTIALS, 'utf8');
    fs.writeFileSync('ios/test_credentials.json', process.env.TEST_CREDENTIALS, 'utf8');
} else {
    console.log('TEST_CREDENTIALS env var not set - skipping');
}
