/*
 * Copyright (c) 2026-present, salesforce.com, inc.
 * All rights reserved.
 */

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {required, validate} = require('../verify-package');

test('rejects build outputs and test credentials from the package', () => {
    for (const file of ['android/build/cache.bin', 'android/.cxx/state.json',
        'android/src/main/assets/test_credentials.json']) {
        assert.throws(() => validate([...required, file]), /in npm package/);
    }
});

test('requires committed codegen for consumers that cannot run codegen', () => {
    const files = required.filter(file => !file.endsWith('CMakeLists.txt'));
    assert.throws(() => validate(files), /Required consumer source missing/);
});
