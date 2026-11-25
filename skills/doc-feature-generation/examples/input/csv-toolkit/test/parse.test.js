import test from 'node:test';
import assert from 'node:assert';
import { parseCsv } from '../src/index.js';

test('parses rows and fields', () => {
  assert.deepStrictEqual(parseCsv('a,b\nc,d'), [['a', 'b'], ['c', 'd']]);
});

test('keeps delimiters and doubled quotes inside quoted fields', () => {
  assert.deepStrictEqual(parseCsv('"a, b","say ""hi"""'), [['a, b', 'say "hi"']]);
});

test('maps records by header names', () => {
  assert.deepStrictEqual(parseCsv('name,qty\nbook,2', { header: true }), [{ name: 'book', qty: '2' }]);
});

test('reports the line of an unterminated quoted field', () => {
  assert.throws(() => parseCsv('a\n"b,c'), /unterminated quoted field \(line 2\)/);
});
