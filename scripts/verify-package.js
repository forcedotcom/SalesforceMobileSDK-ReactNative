/*
 * Copyright (c) 2026-present, salesforce.com, inc.
 * All rights reserved.
 */

const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const path = require('node:path');

const required = [
    'dist/index.js', 'dist/index.d.ts', 'src/index.ts',
    'SalesforceReact.podspec', 'react-native.config.js',
    'android/AndroidManifest.xml', 'android/build.gradle',
    'android/generated/source/codegen/jni/CMakeLists.txt',
    'android/generated/source/codegen/jni/RNSalesforceReactSpec-generated.cpp',
    'android/src/main/java/com/salesforce/androidsdk/reactnative/app/SalesforceReactPackage.kt',
];

function validate(files) {
    for (const file of files) {
        assert(!/(^|\/)(build|\.gradle|\.cxx|node_modules|_local)\//.test(file),
            'Generated or local file in npm package: ' + file);
        assert(!/(^|\/)(test_credentials|ui_test_config)\.json$/.test(file),
            'Test configuration in npm package: ' + file);
    }
    for (const file of required) {
        assert(files.includes(file), 'Required consumer source missing: ' + file);
    }
}

function verify(root = path.resolve(__dirname, '..')) {
    const data = JSON.parse(execFileSync('npm',
        ['pack', '--dry-run', '--ignore-scripts', '--json'],
        {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit']}))[0];
    const files = data.files.map(file => file.path);
    validate(files);
    console.log(`Verified npm package: ${files.length} consumer files`);
    return files;
}

module.exports = {required, validate, verify};
if (require.main === module) {
    verify();
}
