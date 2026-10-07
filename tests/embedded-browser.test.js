import assert from 'node:assert/strict';
import { isEmbeddedBrowser } from '../js/embedded-browser.js';

let passed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('PASS ' + name);
  } catch (err) {
    failures.push(name);
    console.log('FAIL ' + name);
    console.log('     ' + err.message);
  }
}

test('detects WeChat (MicroMessenger) on iOS', () => {
  const ua =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.44(0x18002c2c) NetType/WIFI Language/zh_CN';
  assert.equal(isEmbeddedBrowser(ua), true);
});

test('detects WeChat on Android', () => {
  const ua =
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.44';
  assert.equal(isEmbeddedBrowser(ua), true);
});

test('detects generic Android WebView (; wv)', () => {
  assert.equal(
    isEmbeddedBrowser(
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36; wv)'
    ),
    true
  );
});

test('detects other in-app browsers', () => {
  for (const ua of [
    'Mozilla/5.0 ... QQ/8.9.0',
    'Mozilla/5.0 ... Weibo/13.0',
    'Mozilla/5.0 ... AlipayClient/10.3',
    'Mozilla/5.0 ... DingTalk/7.0',
    'Mozilla/5.0 ... [FBAN/FBIOS;FBAV/400.0]',
  ]) {
    assert.equal(isEmbeddedBrowser(ua), true, ua);
  }
});

test('does not flag standard browsers', () => {
  const safari =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  const chrome =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  assert.equal(isEmbeddedBrowser(safari), false);
  assert.equal(isEmbeddedBrowser(chrome), false);
});

test('handles missing / non-string user agents', () => {
  assert.equal(isEmbeddedBrowser(undefined), false);
  assert.equal(isEmbeddedBrowser(null), false);
  assert.equal(isEmbeddedBrowser(''), false);
  assert.equal(isEmbeddedBrowser(123), false);
});

console.log(`\n${passed} passed, ${failures.length} failed`);

if (failures.length > 0) {
  process.exitCode = 1;
  console.log('Failed: ' + failures.join(', '));
}
