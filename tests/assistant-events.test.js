// Zero-dependency tests for the assistant NDJSON stream parser.
// Run with: node tests/assistant-events.test.js

import assert from 'node:assert/strict';
import { createEventStreamParser } from '../js/assistant-events.js';

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

test('parses complete lines', () => {
  const parser = createEventStreamParser();
  const events = parser.push(
    '{"type":"text","value":"hello"}\n{"type":"done"}\n'
  );
  assert.deepEqual(events, [
    { type: 'text', value: 'hello' },
    { type: 'done' },
  ]);
});

test('buffers a line split across chunks', () => {
  const parser = createEventStreamParser();
  assert.deepEqual(parser.push('{"type":"text","val'), []);
  assert.deepEqual(parser.push('ue":"hi"}\n'), [{ type: 'text', value: 'hi' }]);
});

test('parses multiple events in one chunk and keeps the remainder', () => {
  const parser = createEventStreamParser();
  const events = parser.push(
    '{"type":"tool_call","id":"a","name":"get_project_doc","args":{"project":"blog"}}\n{"type":"text","val'
  );
  assert.deepEqual(events, [
    {
      type: 'tool_call',
      id: 'a',
      name: 'get_project_doc',
      args: { project: 'blog' },
    },
  ]);
  assert.deepEqual(parser.flush(), []);
});

test('ignores malformed lines and keeps going', () => {
  const parser = createEventStreamParser();
  const events = parser.push(
    'not json\n{"type":"text","value":"ok"}\n{broken}\n{"type":"done"}\n'
  );
  assert.deepEqual(events, [
    { type: 'text', value: 'ok' },
    { type: 'done' },
  ]);
});

test('skips blank lines and handles CRLF', () => {
  const parser = createEventStreamParser();
  const events = parser.push(
    '\r\n{"type":"text","value":"a"}\r\n\r\n{"type":"text","value":"b"}\r\n'
  );
  assert.deepEqual(events, [
    { type: 'text', value: 'a' },
    { type: 'text', value: 'b' },
  ]);
});

test('flush parses a trailing line without a newline', () => {
  const parser = createEventStreamParser();
  assert.deepEqual(parser.push('{"type":"text","value":"tail"}'), []);
  assert.deepEqual(parser.flush(), [{ type: 'text', value: 'tail' }]);
  assert.deepEqual(parser.flush(), []);
});

test('ignores empty chunks', () => {
  const parser = createEventStreamParser();
  assert.deepEqual(parser.push(''), []);
  assert.deepEqual(parser.push(undefined), []);
});

let failed = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`  \u2717 ${name}`);
    console.error(err);
  }
}

console.log(`\nTests: ${tests.length - failed} passed, ${tests.length} total`);
if (failed > 0) process.exit(1);
