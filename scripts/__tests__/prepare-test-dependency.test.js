/*
 * Copyright (c) 2026-present, salesforce.com, inc.
 * All rights reserved.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {test} = require('node:test');
const {prepare, removeNestedDependencies} = require('../prepare-test-dependency');

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
    fs.mkdirSync(path.join(installed, 'node_modules'));
    assert.equal(removeNestedDependencies(consumer), true);
    const receipt = prepare(consumer, checkout);
    assert.equal(receipt.reactNativeVersion, '0.87.0');
    assert.match(receipt.sourceSha256, /^[a-f0-9]{64}$/);
    assert.equal(fs.readFileSync(path.join(installed, 'test/suite.js'), 'utf8'),
        'exports.test = true;');
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(consumer,
        '.msdk-source.json'))), receipt);
    assert.equal(fs.existsSync(path.join(installed, '.msdk-source.json')), false);
    assert.equal(fs.existsSync(path.join(installed, 'node_modules')), false);
});

for (const linkedModules of [false, true]) {
    test(`prepares a linked checkout with linked node_modules=${linkedModules}`, t => {
        const {checkout, consumer, installed} = fixture(t);
        fs.mkdirSync(path.join(checkout, 'node_modules'));
        const marker = path.join(checkout, 'node_modules/keep');
        fs.writeFileSync(marker, 'checkout dependencies');
        const sourceReceipt = path.join(checkout, '.msdk-source.json');
        fs.writeFileSync(sourceReceipt, 'existing checkout receipt');
        fs.rmSync(installed, {recursive: true});
        fs.symlinkSync(checkout, installed, 'dir');
        if (linkedModules) {
            const modules = path.join(consumer, 'node_modules');
            const external = path.join(path.dirname(consumer), 'external modules');
            fs.renameSync(modules, external);
            fs.symlinkSync(external, modules, 'dir');
        }
        const alias = path.join(path.dirname(checkout), 'checkout alias');
        fs.symlinkSync(checkout, alias, 'dir');

        assert.equal(removeNestedDependencies(consumer), false);
        const receipt = prepare(consumer, alias);

        assert.equal(receipt.reactNativeVersion, '0.87.0');
        assert.deepEqual(JSON.parse(fs.readFileSync(path.join(consumer,
            '.msdk-source.json'))), receipt);
        assert.equal(fs.readFileSync(marker, 'utf8'), 'checkout dependencies');
        assert.equal(fs.readFileSync(sourceReceipt, 'utf8'),
            'existing checkout receipt');
        assert.equal(fs.readFileSync(path.join(checkout, 'test/suite.js'),
            'utf8'), 'exports.test = true;');
    });
}

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

test('removes nested dependencies from a copied bridge', t => {
    const {consumer, installed} = fixture(t);
    fs.mkdirSync(path.join(installed, 'node_modules'));
    fs.writeFileSync(path.join(installed, 'node_modules/duplicate-react'), 'copy');
    assert.equal(removeNestedDependencies(consumer), true);
    assert.equal(fs.existsSync(path.join(installed, 'node_modules')), false);
});

test('preserves checkout dependencies when the bridge is symlinked', t => {
    const {checkout, consumer, installed} = fixture(t);
    fs.mkdirSync(path.join(checkout, 'node_modules'));
    const marker = path.join(checkout, 'node_modules/keep');
    fs.writeFileSync(marker, 'checkout');
    fs.rmSync(installed, {recursive: true});
    fs.symlinkSync(checkout, installed, 'dir');
    assert.equal(removeNestedDependencies(consumer), false);
    assert.equal(fs.readFileSync(marker, 'utf8'), 'checkout');
});

test('preserves dependencies behind a symlinked node_modules directory', t => {
    const {checkout, consumer} = fixture(t);
    const modules = path.join(consumer, 'node_modules');
    const external = path.join(checkout, 'external-modules');
    fs.renameSync(modules, external);
    fs.symlinkSync(external, modules, 'dir');
    const marker = path.join(external, 'react-native-force/node_modules/keep');
    fs.mkdirSync(path.dirname(marker));
    fs.writeFileSync(marker, 'external');
    assert.equal(removeNestedDependencies(consumer), false);
    assert.equal(fs.readFileSync(marker, 'utf8'), 'external');
});

test('unlinks nested dependencies without deleting their symlink target', t => {
    const {checkout, consumer, installed} = fixture(t);
    const target = path.join(checkout, 'dependencies');
    fs.mkdirSync(target);
    fs.writeFileSync(path.join(target, 'keep'), 'target');
    fs.symlinkSync(target, path.join(installed, 'node_modules'), 'dir');
    assert.equal(removeNestedDependencies(consumer), true);
    assert.equal(fs.readFileSync(path.join(target, 'keep'), 'utf8'), 'target');
    assert.equal(fs.existsSync(path.join(installed, 'node_modules')), false);
});
