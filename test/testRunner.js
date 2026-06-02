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
