/*
 * Copyright (c) 2026-present, salesforce.com, inc.
 * All rights reserved.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {test} = require('node:test');
const {prepare} = require('../prepare-test-dependency');

function fixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'msdk-source-'));
    t.after(() => fs.rmSync(root, {recursive: true, force: true}));
    const checkout = path.join(root, 'checkout');
    const consumer = path.join(root, 'consumer');
    const installed = path.join(consumer, 'node_modules/react-native-force');
    fs.mkdirSync(path.join(checkout, 'dist'), {recursive: true});
    fs.mkdirSync(path.join(checkout, 'test'));
    fs.writeFileSync(path.join(checkout, 'package.json'), JSON.stringify({
        version: '14.1.0', peerDependencies: {'react-native': '0.87.0'},
    }));
    fs.writeFileSync(path.join(checkout, 'dist/index.js'), 'exports.bridge = true;');
    fs.writeFileSync(path.join(checkout, 'test/suite.js'), 'exports.test = true;');
    fs.cpSync(checkout, installed, {recursive: true});
    fs.rmSync(path.join(installed, 'test'), {recursive: true});
    fs.mkdirSync(path.join(consumer, 'node_modules/react-native'));
    fs.writeFileSync(path.join(consumer, 'node_modules/react-native/package.json'),
        JSON.stringify({version: '0.87.0'}));
    return {checkout, consumer, installed};
}

test('verifies the checkout and supplies unpackaged harness tests', t => {
    const {checkout, consumer, installed} = fixture(t);
    const receipt = prepare(consumer, checkout);
    assert.equal(receipt.reactNativeVersion, '0.87.0');
    assert.match(receipt.sourceSha256, /^[a-f0-9]{64}$/);
    assert.equal(fs.readFileSync(path.join(installed, 'test/suite.js'), 'utf8'),
        'exports.test = true;');
});

test('rejects stale installed bridge sources', t => {
    const {checkout, consumer, installed} = fixture(t);
    fs.writeFileSync(path.join(installed, 'dist/index.js'), 'exports.old = true;');
    assert.throws(() => prepare(consumer, checkout), /checked-out bridge sources/);
});

test('rejects stale peer requirements even when the SDK version matches', t => {
    const {checkout, consumer, installed} = fixture(t);
    fs.writeFileSync(path.join(installed, 'package.json'), JSON.stringify({
        version: '14.1.0', peerDependencies: {'react-native': '0.86.0'},
    }));
    assert.throws(() => prepare(consumer, checkout), /peer requirements/);
});
