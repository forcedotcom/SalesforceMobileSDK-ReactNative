function assert(value, message) {
    if (!value) throw new Error(message || 'Assertion failed');
}
assert.equal = (actual, expected, message) => {
    if (actual !== expected) throw new Error(message || `Expected ${expected} but got ${actual}`);
};
assert.isTrue = (value, message) => { assert(value === true, message); };
assert.isFalse = (value, message) => { assert(value === false, message); };
assert.isArray = (value, message) => { assert(Array.isArray(value), message); };
assert.isObject = (value, message) => { assert(value !== null && typeof value === 'object' && !Array.isArray(value), message); };
assert.include = (haystack, needle, message) => {
    assert(typeof haystack === 'string' ? haystack.includes(needle) : false, message);
};
assert.deepInclude = (haystack, needle, message) => {
    if (Array.isArray(haystack)) {
        const found = haystack.some(item => JSON.stringify(item) === JSON.stringify(needle));
        assert(found, message);
    } else {
        assert(JSON.stringify(haystack).includes(JSON.stringify(needle)), message);
    }
};
assert.deepEqual = (actual, expected, message) => {
    assert(JSON.stringify(actual) === JSON.stringify(expected), message || `Expected deep equal`);
};
assert.isDefined = (value, message) => { assert(value !== undefined, message); };
assert.isNumber = (value, message) => { assert(typeof value === 'number', message); };
assert.isNull = (value, message) => { assert(value === null, message); };
assert.containsAllKeys = (obj, keys, message) => {
    const missing = keys.filter(k => !(k in obj));
    assert(missing.length === 0, message || `Missing keys: ${missing.join(', ')}`);
};
assert.sameDeepMembers = (arr1, arr2, message) => {
    // NB: a JSON.stringify *array* replacer whitelists property names at EVERY
    // depth, so nested keys absent from the top level get silently dropped from
    // both sides — comparing {cfg:{k:1}} equal to {cfg:{k:2}} (a false pass).
    // Canonicalize recursively instead: sort object keys at every level while
    // preserving array order.
    const canonical = (v) => {
        if (Array.isArray(v)) return v.map(canonical);
        if (v && typeof v === 'object') {
            const out = {};
            Object.keys(v).sort().forEach(k => { out[k] = canonical(v[k]); });
            return out;
        }
        return v;
    };
    const sortedStringify = (obj) => JSON.stringify(canonical(obj));
    const s1 = arr1.map(i => sortedStringify(i)).sort();
    const s2 = arr2.map(i => sortedStringify(i)).sort();
    assert(JSON.stringify(s1) === JSON.stringify(s2), message || 'Arrays do not have same deep members');
};

export { assert };
