/*
 * Copyright (c) 2026-present, salesforce.com, inc.
 * All rights reserved.
 */

const assert = require('node:assert/strict');
const {execSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {test} = require('node:test');

test('documented build emits changed source and declarations', t => {
    const root = path.resolve(__dirname, '../..');
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'msdk-dist-'));
    t.after(() => fs.rmSync(fixture, {recursive: true, force: true}));
    for (const relative of ['package.json', 'tsconfig.json', 'tsconfig.build.json',
        'src', 'dist']) {
        fs.cpSync(path.join(root, relative), path.join(fixture, relative),
            {recursive: true});
    }
    fs.symlinkSync(path.join(root, 'node_modules'),
        path.join(fixture, 'node_modules'), 'dir');
    fs.appendFileSync(path.join(fixture, 'src/index.ts'),
        '\nexport const distributionEmissionProbe = "fixture";\n');
    execSync('npm run build', {cwd: fixture, stdio: 'pipe'});
    for (const relative of ['dist/index.js', 'dist/index.d.ts']) {
        assert.match(fs.readFileSync(path.join(fixture, relative), 'utf8'),
            /distributionEmissionProbe/);
    }
});
