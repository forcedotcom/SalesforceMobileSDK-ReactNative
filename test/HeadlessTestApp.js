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

/*
 * Headless test driver for ANDROID instrumented tests only.
 *
 * Unlike TestApp.js (the interactive, button-per-test UI that iOS XCUITest drives),
 * this component takes NO UI input. On mount it runs the entire shared test suite
 * once and reports each result as a single-line logcat sentinel:
 *
 *   SFTESTBEGIN::
 *   SFTESTRESULT::{"s":"<suite>","n":"<test>","ok":true|false,"e":"<error?>"}
 *   SFTESTDONE::{"total":N,"passed":N,"failed":N}
 *
 * The Kotlin harness (BaseReactNativeTest.kt) streams logcat (tag ReactNativeJS),
 * parses these lines into per-test results, and asserts. No UIAutomator, no
 * scrolling, no gesture guessing — which is what made the old harness flaky on
 * Firebase Test Lab's slow ARM emulators.
 *
 * This file is imported ONLY by androidTests/index.js, so it is never bundled for
 * iOS. Do NOT import it from iosTests/index.js.
 */

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { getSuites, runTest, testDone } from './testRunner';

// Register all suites via import side-effects (same set as TestApp.js).
import './harness.test';
import './oauth.test';
import './net.test';
import './smartstore.test';
import './mobilesync.test';

// Per-suite hard caps (ms). testRunner has no internal timeout, so each test MUST
// be bounded here or a single hung test would stall the whole run.
const SUITE_TIMEOUTS = {
  Harness: 30000,
  OAuth: 90000,
  Net: 120000,
  SmartStore: 90000,
  MobileSync: 240000,
};
const DEFAULT_TIMEOUT = 60000;

// Module-level guard so a StrictMode double-mount / remount runs the suite once.
let started = false;

function emit(line) {
  // One physical line per call; read from logcat by the Kotlin harness.
  console.log(line);
}

async function runOne(suiteName, testName) {
  const cap = SUITE_TIMEOUTS[suiteName] || DEFAULT_TIMEOUT;
  // IMPORTANT: the timer MUST be cleared once the race settles. Promise.race does
  // not cancel the loser, so a timer left running after the test wins would fire
  // later and call testDone() on WHATEVER test is running then — corrupting an
  // unrelated (usually slower, later) test with a spurious timeout.
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => {
      const err = new Error('timeout after ' + cap + 'ms');
      // Clear testRunner's singleton resolver so the NEXT test starts clean.
      testDone(err);
      resolve(err);
    }, cap);
  });
  try {
    return await Promise.race([runTest(suiteName, testName), timeout]);
  } catch (e) {
    return e instanceof Error ? e : new Error(String(e));
  } finally {
    clearTimeout(timer);
  }
}

function toMessage(error) {
  if (!error) return '';
  return String(error.message || error).replace(/\s+/g, ' ').slice(0, 500);
}

async function runAllHeadless() {
  let total = 0;
  let passed = 0;
  let failed = 0;
  emit('SFTESTBEGIN::');
  try {
    const suites = getSuites();
    for (const [suiteName, suite] of Object.entries(suites)) {
      for (const test of suite.tests) {
        total += 1;
        const error = await runOne(suiteName, test.name);
        if (error) {
          failed += 1;
        } else {
          passed += 1;
        }
        emit(
          'SFTESTRESULT::' +
            JSON.stringify({ s: suiteName, n: test.name, ok: !error, e: toMessage(error) })
        );
      }
    }
  } catch (e) {
    // Fail-closed: surface the runner-level failure but still emit DONE below.
    emit(
      'SFTESTRESULT::' +
        JSON.stringify({ s: 'runner', n: 'runAll', ok: false, e: toMessage(e) })
    );
  } finally {
    emit('SFTESTDONE::' + JSON.stringify({ total, passed, failed }));
  }
}

export default function HeadlessTestApp() {
  useEffect(() => {
    if (started) return;
    started = true;
    runAllHeadless();
  }, []);
  return (
    <View>
      <Text accessibilityLabel="headlessStatus">Running headless tests…</Text>
    </View>
  );
}
