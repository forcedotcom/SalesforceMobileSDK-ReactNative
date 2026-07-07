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

// Monotonic run counter. runTest() claims the next value for the test it starts;
// the harness advances it (via abandonActiveTest) when a test exceeds its cap. A
// run whose generation has been superseded neither installs a resolver nor runs
// its body, so a timed-out test can no longer clobber the next test's resolver or
// execute its body concurrently against the shared store / sync manager.
//
// KNOWN RESIDUAL: tests call the module-level testDone() rather than a per-test
// handle, so a timed-out test whose promise chain later RESUMES and calls
// testDone() can still resolve the currently-active test's resolver, misattributing
// one verdict WITHIN an already-failed run. Closing that fully means giving every
// test its own done() callback — a change across all shared *.test.js (and the iOS
// suite). This guard fixes the dangerous cases (setUp clobber, concurrent body
// execution) without touching the shared suite.
let generation = 0;
let activeTest = null; // { gen, resolve } for the running test, or null

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
  if (activeTest) {
    const resolve = activeTest.resolve;
    activeTest = null;
    resolve(error || null);
  }
}

// Called by the harness when a test exceeds its per-suite cap. Advances the
// generation so an abandoned runTest bails at its post-setUp check instead of
// clobbering the next test, and settles the active resolver so runTest can
// proceed to tearDown.
export function abandonActiveTest(error) {
  generation++;
  testDone(error);
}

export async function runTest(suiteName, testName) {
  const suite = suites[suiteName];
  if (!suite) return new Error(`Suite '${suiteName}' not found`);
  const testEntry = suite.tests.find(t => t.name === testName);
  if (!testEntry) return new Error(`Test '${testName}' not found in suite '${suiteName}'`);

  const myGen = ++generation;

  if (suite.setUp) {
    try { await suite.setUp(); } catch (e) { return e; }
  }
  // If a timeout advanced the generation while we awaited setUp, this run has
  // been superseded: do not install a resolver or run the body (which would race
  // the next test against the shared store / sync manager).
  if (myGen !== generation) {
    return new Error(`Test '${testName}' superseded (timed out during setUp)`);
  }

  const error = await new Promise((resolve) => {
    activeTest = { gen: myGen, resolve };
    try {
      testEntry.fn();
    } catch (e) {
      activeTest = null;
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
