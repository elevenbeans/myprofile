// Zero-dependency tests for the assistant Markdown subset.
// Run with: node tests/assistant-markdown.test.js

import assert from 'node:assert/strict';
import { renderMarkdown } from '../js/assistant-markdown.js';

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

test('renders an inline markdown link', () => {
  const html = renderMarkdown('See [Earth](https://elevenbeans.me/earth-online/).');
  assert.equal(
    html,
    'See <a href="https://elevenbeans.me/earth-online/" target="_blank" rel="noopener noreferrer">Earth</a>.'
  );
});

test('renders a URL as the link label', () => {
  const html = renderMarkdown('[https://blog.elevenbeans.me](https://blog.elevenbeans.me)');
  assert.match(html, /^<a href="https:\/\/blog\.elevenbeans\.me"/);
  assert.match(html, />https:\/\/blog\.elevenbeans\.me<\/a>$/);
});

test('renders mailto links', () => {
  const html = renderMarkdown('[email](mailto:elevenbeansf2e@gmail.com)');
  assert.match(html, /href="mailto:elevenbeansf2e@gmail\.com"/);
});

test('does not turn javascript: into a link', () => {
  const html = renderMarkdown('[x](javascript:alert(1))');
  assert.equal(html, '[x](javascript:alert(1))');
  assert.equal(html.includes('<a '), false);
});

test('escapes HTML in labels', () => {
  const html = renderMarkdown('[<b>hi</b>](https://x.test)');
  assert.match(html, /&lt;b&gt;hi&lt;\/b&gt;/);
  assert.equal(html.includes('<b>'), false);
});

test('leaves links inside inline code alone', () => {
  const html = renderMarkdown('`[x](https://x.test)`');
  assert.equal(html, '<code>[x](https://x.test)</code>');
});

test('leaves links inside fenced code alone', () => {
  const html = renderMarkdown('```md\n[x](https://x.test)\n```');
  assert.equal(html, '<pre>[x](https://x.test)\n</pre>');
});

test('keeps bold and line breaks', () => {
  const html = renderMarkdown('**hi**\nthere');
  assert.equal(html, '<strong>hi</strong><br>there');
});

test('leaves broken markdown as text', () => {
  assert.equal(renderMarkdown('[x](https://x.test'), '[x](https://x.test');
  assert.equal(renderMarkdown('[x]'), '[x]');
});

test('handles empty input', () => {
  assert.equal(renderMarkdown(''), '');
  assert.equal(renderMarkdown(undefined), '');
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
