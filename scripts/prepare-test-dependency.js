/*
 * Copyright (c) 2026-present, salesforce.com, inc.
 * All rights reserved.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function sourceFiles(root, relative) {
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) {
        return [];
    }
    if (fs.statSync(file).isDirectory()) {
        return fs.readdirSync(file).flatMap(name =>
            sourceFiles(root, path.join(relative, name)));
    }
    return [relative];
}

function fingerprint(root) {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify({
        version: manifest.version,
        peerDependencies: manifest.peerDependencies,
        codegenConfig: manifest.codegenConfig,
    }));
    const files = ['dist', 'src', 'ios/SalesforceReact', 'android/src',
        'android/generated', 'android/build.gradle', 'SalesforceReact.podspec',
        'react-native.config.js'].flatMap(relative => sourceFiles(root, relative));
    assert(files.length > 0, 'Bridge sources are missing');
    for (const relative of files.sort()) {
        hash.update(relative.split(path.sep).join('/'));
        hash.update('\0');
        hash.update(fs.readFileSync(path.join(root, relative)));
    }
    return hash.digest('hex');
}

function prepare(consumer, checkout = path.resolve(__dirname, '..')) {
    const installed = path.join(consumer, 'node_modules/react-native-force');
    const expected = JSON.parse(fs.readFileSync(path.join(checkout, 'package.json')));
    const actual = JSON.parse(fs.readFileSync(path.join(installed, 'package.json')));
    const native = JSON.parse(fs.readFileSync(path.join(consumer,
        'node_modules/react-native/package.json')));
    assert.equal(actual.version, expected.version, 'Wrong bridge version');
    assert.deepEqual(actual.peerDependencies, expected.peerDependencies,
        'Installed bridge peer requirements differ from the checkout');
    assert.equal(native.version, expected.peerDependencies['react-native'],
        'Test app and checked-out bridge require different React Native versions');
    const sourceSha256 = fingerprint(checkout);
    assert.equal(fingerprint(installed), sourceSha256,
        'Test app must install the checked-out bridge sources');
    fs.cpSync(path.join(checkout, 'test'), path.join(installed, 'test'),
        {recursive: true});
    const receipt = {bridgeVersion: actual.version,
        reactNativeVersion: native.version, sourceSha256};
    fs.writeFileSync(path.join(installed, '.msdk-source.json'),
        JSON.stringify(receipt, null, 2) + '\n');
    console.log('Verified test bridge source:', JSON.stringify(receipt));
    return receipt;
}

module.exports = {prepare, fingerprint};

if (require.main === module) {
    prepare(path.resolve(process.argv[2] || '.'));
}
