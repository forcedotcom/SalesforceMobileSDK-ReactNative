/*
 * Copyright (c) 2026-present, salesforce.com, inc.
 * All rights reserved.
 * Redistribution and use of this software in source and binary forms, with or
 * without modification, are permitted provided that the following conditions
 * are met:
 * - Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * - Neither the name of salesforce.com, inc. nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission of salesforce.com, inc.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

const suites = {};
let currentSuiteName = null;
let currentTestResolve = null;

export function registerSuite(name, { setUp, tearDown } = {}) {
  suites[name] = { setUp: setUp || null, tearDown: tearDown || null, tests: [] };
  currentSuiteName = name;
}

export function registerTest(testFn) {
  if (!currentSuiteName) throw new Error('registerTest called before registerSuite');
  suites[currentSuiteName].tests.push({ name: testFn.name, fn: testFn });
}

export function getSuites() {
  return suites;
}

export function testDone(error) {
  if (currentTestResolve) {
    currentTestResolve(error || null);
    currentTestResolve = null;
  }
}

export async function runTest(suiteName, testName) {
  const suite = suites[suiteName];
  if (!suite) return new Error(`Suite '${suiteName}' not found`);
  const testEntry = suite.tests.find(t => t.name === testName);
  if (!testEntry) return new Error(`Test '${testName}' not found in suite '${suiteName}'`);

  if (suite.setUp) {
    try { await suite.setUp(); } catch (e) { return e; }
  }

  const error = await new Promise((resolve) => {
    currentTestResolve = resolve;
    try {
      testEntry.fn();
    } catch (e) {
      resolve(e);
    }
  });

  if (suite.tearDown) {
    try { await suite.tearDown(); } catch (e) { /* ignore tearDown errors */ }
  }

  return error;
}

export async function runSuite(suiteName) {
  const suite = suites[suiteName];
  if (!suite) return {};
  const results = {};
  for (const test of suite.tests) {
    results[test.name] = await runTest(suiteName, test.name);
  }
  return results;
}

export async function runAll() {
  const results = {};
  for (const suiteName of Object.keys(suites)) {
    results[suiteName] = await runSuite(suiteName);
  }
  return results;
}
