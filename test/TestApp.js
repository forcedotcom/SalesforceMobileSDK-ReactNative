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

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { getSuites, runTest, runSuite, runAll } from './testRunner';

import './harness.test';
import './oauth.test';
import './net.test';
import './smartstore.test';
import './mobilesync.test';

const STATUS_PENDING = 'pending';
const STATUS_RUNNING = 'running';
const STATUS_PASS = 'pass';
const STATUS_FAIL = 'fail';

export default function TestApp() {
  const suites = getSuites();
  const [results, setResults] = useState({});

  const setTestResult = useCallback((suiteName, testName, status, error) => {
    setResults(prev => ({
      ...prev,
      [`${suiteName}/${testName}`]: { status, error }
    }));
  }, []);

  const handleRunTest = useCallback(async (suiteName, testName) => {
    setTestResult(suiteName, testName, STATUS_RUNNING, null);
    const error = await runTest(suiteName, testName);
    setTestResult(suiteName, testName, error ? STATUS_FAIL : STATUS_PASS, error);
  }, [setTestResult]);

  const handleRunSuite = useCallback(async (suiteName) => {
    const suite = suites[suiteName];
    for (const test of suite.tests) {
      setTestResult(suiteName, test.name, STATUS_RUNNING, null);
      const error = await runTest(suiteName, test.name);
      setTestResult(suiteName, test.name, error ? STATUS_FAIL : STATUS_PASS, error);
    }
  }, [suites, setTestResult]);

  const handleRunAll = useCallback(async () => {
    for (const suiteName of Object.keys(suites)) {
      await handleRunSuite(suiteName);
    }
  }, [suites, handleRunSuite]);

  const getStatus = (suiteName, testName) => {
    const key = `${suiteName}/${testName}`;
    return results[key] || { status: STATUS_PENDING, error: null };
  };

  return (
    <ScrollView style={styles.container} testID="testList" accessibilityLabel="testList">
      <Text style={styles.title}>React Native SDK Tests</Text>
      <TouchableOpacity
        style={styles.runAllButton}
        testID="runAll"
        accessibilityLabel="runAll"
        onPress={handleRunAll}
      >
        <Text style={styles.runAllText}>Run All Tests</Text>
      </TouchableOpacity>

      {Object.entries(suites).map(([suiteName, suite]) => (
        <View key={suiteName} style={styles.suite}>
          <View style={styles.suiteHeader}>
            <Text style={styles.suiteName}>{suiteName}</Text>
            <TouchableOpacity
              testID={`runSuite_${suiteName}`}
              accessibilityLabel={`runSuite_${suiteName}`}
              onPress={() => handleRunSuite(suiteName)}
            >
              <Text style={styles.runButton}>Run All</Text>
            </TouchableOpacity>
          </View>

          {suite.tests.map(({ name }) => {
            const { status, error } = getStatus(suiteName, name);
            return (
              <View key={name} style={styles.testRow}>
                <View style={styles.testInfo}>
                  {status === STATUS_PASS && <Text testID={`result_${name}_pass`} accessibilityLabel={`result_${name}_pass`} style={styles.pass}>✓</Text>}
                  {status === STATUS_FAIL && <Text testID={`result_${name}_fail`} accessibilityLabel={`result_${name}_fail`} style={styles.fail}>✗</Text>}
                  {status === STATUS_RUNNING && <Text style={styles.running}>⋯</Text>}
                  {status === STATUS_PENDING && <Text style={styles.pending}>○</Text>}
                  <Text style={styles.testName}>{name}</Text>
                  <TouchableOpacity
                    testID={`run_${name}`}
                    accessibilityLabel={`run_${name}`}
                    onPress={() => handleRunTest(suiteName, name)}
                  >
                    <Text style={styles.runButton}>Run</Text>
                  </TouchableOpacity>
                </View>
                {status === STATUS_FAIL && error && (
                  <Text testID={`error_${name}`} accessibilityLabel={`error_${name}`} style={styles.errorText}>
                    {String(error.message || error)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  runAllButton: { backgroundColor: '#0070d2', padding: 12, borderRadius: 6, marginBottom: 16, alignItems: 'center' },
  runAllText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  suite: { marginBottom: 20 },
  suiteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  suiteName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  testRow: { paddingVertical: 6, paddingLeft: 8, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  testInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  testName: { flex: 1, fontSize: 14, marginLeft: 8 },
  runButton: { color: '#0070d2', fontWeight: '600', fontSize: 14, paddingHorizontal: 8 },
  pass: { color: '#2e844a', fontSize: 16, width: 20 },
  fail: { color: '#c23934', fontSize: 16, width: 20 },
  running: { color: '#706e6b', fontSize: 16, width: 20 },
  pending: { color: '#b0adab', fontSize: 16, width: 20 },
  errorText: { color: '#c23934', fontSize: 12, marginTop: 4, marginLeft: 28 },
});
