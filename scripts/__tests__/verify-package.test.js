/*
 * Copyright (c) 2026-present, salesforce.com, inc.
 * All rights reserved.
 */

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {test} = require('node:test');
const vm = require('node:vm');
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

test('packs through an npm command shim from a directory containing spaces', t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'msdk npm package '));
    t.after(() => fs.rmSync(root, {recursive: true, force: true}));
    const bin = path.join(root, 'test bin');
    fs.mkdirSync(bin);
    fs.writeFileSync(path.join(bin, 'npm.js'), `
const fs = require('node:fs');
fs.writeFileSync('npm-invocation.json', JSON.stringify({
    args: process.argv.slice(2), cwd: process.cwd(),
}));
process.stdout.write(${JSON.stringify(JSON.stringify([
    {files: required.map(file => ({path: file}))},
]))});
`);
    if (process.platform === 'win32') {
        fs.writeFileSync(path.join(bin, 'npm.cmd'),
            `@"${process.execPath}" "%~dp0npm.js" %*\r\n`);
    } else {
        fs.writeFileSync(path.join(bin, 'npm'),
            '#!/usr/bin/env node\nrequire("./npm.js");\n', {mode: 0o755});
    }
    const originalPath = process.env.PATH;
    t.after(() => { process.env.PATH = originalPath; });
    process.env.PATH = bin + path.delimiter + originalPath;

    // Model Windows' inability to execute npm.cmd directly, while exercising
    // the real process launcher and JSON output from the fixture command shim.
    const module = {exports: {}};
    vm.runInNewContext(fs.readFileSync(require.resolve('../verify-package'),
        'utf8'), {module, __dirname: path.resolve(__dirname, '..'), console,
        require(name) {
            if (name === 'node:child_process') {
                return {...childProcess, execFileSync(command, ...args) {
                    if (command === 'npm' || command === 'npm.cmd') {
                        throw Object.assign(new Error('Command shim needs a shell'),
                            {code: 'ENOENT'});
                    }
                    return childProcess.execFileSync(command, ...args);
                }};
            }
            return require(name);
        },
    });
    assert.deepEqual(Array.from(module.exports.verify(root)), required);
    const invocation = JSON.parse(fs.readFileSync(path.join(root,
        'npm-invocation.json')));
    assert.deepEqual(invocation.args,
        ['pack', '--dry-run', '--ignore-scripts', '--json']);
    assert.equal(fs.realpathSync(invocation.cwd), fs.realpathSync(root));
});
