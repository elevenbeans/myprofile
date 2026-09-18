import assert from 'node:assert/strict';
import { resolveLocalCommand } from '../js/assistant-commands.js';

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

function reply(input, locale = 'en') {
  const result = resolveLocalCommand(input, locale);
  assert.equal(result && result.type, 'reply', `expected reply for ${JSON.stringify(input)}`);
  assert.equal(typeof result.text, 'string');
  return result;
}

function bashTool(result) {
  assert.ok(Array.isArray(result.tools), 'expected tools array');
  const tool = result.tools.find((t) => t.type === 'bash');
  assert.ok(tool, 'expected a bash tool');
  return tool;
}

test('help returns a reply and lists local commands', () => {
  const result = reply('help');
  assert.match(result.text, /about/i);
  assert.match(result.text, /browse files/i);
  assert.match(result.text, /run tests/i);
  assert.match(result.text, /write code/i);
  assert.match(result.text, /clear/i);
  assert.match(result.text, /exit/i);
});

test('help aliases: ?, commands, 帮助', () => {
  assert.equal(resolveLocalCommand('?').type, 'reply');
  assert.equal(resolveLocalCommand('commands').type, 'reply');
  assert.equal(resolveLocalCommand('帮助').type, 'reply');
});

test('about returns a reply with a simulated curl bash tool', () => {
  const result = reply('about');
  const tool = bashTool(result);
  assert.match(tool.cmd, /curl/);
  assert.match(tool.cmd, /api\.github\.com\/users\/elevenbeans/);
});

test('about aliases: about elevenbeans, who is elevenbeans, 背景', () => {
  for (const input of ['about elevenbeans', 'who is elevenbeans', '背景']) {
    const tool = bashTool(reply(input));
    assert.match(tool.cmd, /curl/);
  }
});

test('about output contains Shanghai and Amsterdam', () => {
  const tool = bashTool(reply('about'));
  assert.ok(tool.output.includes('Shanghai'), 'missing Shanghai');
  assert.ok(tool.output.includes('Amsterdam'), 'missing Amsterdam');
  assert.ok(tool.output.includes('AMS'), 'missing AMS');
});

test('about output contains the expected bio', () => {
  const tool = bashTool(reply('about'));
  assert.ok(tool.output.includes('Minimalism first. Thinking, logic, execution.'));
});

test('browse files returns a reply with an ls -la bash tool', () => {
  const result = reply('browse files');
  const tool = bashTool(result);
  assert.match(tool.cmd, /ls/);
  for (const entry of ['index.html', 'styles.css', 'js/', 'CNAME']) {
    assert.ok(tool.output.includes(entry), `listing missing ${entry}`);
  }
  assert.ok(!tool.output.includes('script.js'), 'script.js should be gone');
});

test('browse aliases: browse, ls, files, 文件', () => {
  for (const input of ['browse', 'ls', 'files', '文件']) {
    const tool = bashTool(reply(input));
    assert.match(tool.cmd, /ls/);
  }
});

test('run tests returns a reply with an npm test bash tool', () => {
  const result = reply('run tests');
  const tool = bashTool(result);
  assert.equal(tool.cmd, 'npm test');
  assert.match(tool.output, /PASS/);
  assert.match(tool.output, /passed/);
});

test('run tests aliases: run test, test, npm test, 测试', () => {
  for (const input of ['run test', 'test', 'npm test', '测试']) {
    const tool = bashTool(reply(input));
    assert.equal(tool.cmd, 'npm test');
  }
});

test('write code returns a bash tool plus a followup edit tool', () => {
  const result = reply('write code');
  const bash = bashTool(result);
  assert.match(bash.cmd, /cat > hello\.ts/);
  assert.ok(result.followup, 'expected a followup tool');
  assert.equal(result.followup.type, 'edit');
  assert.equal(result.followup.title, 'Created hello.ts');
  assert.match(result.followup.output, /function/);
  assert.ok(result.followup.output.includes('elevenbeans.me'));
});

test('write code aliases: write, generate, create, make, 写代码', () => {
  for (const input of ['write', 'generate', 'create', 'make', '写代码']) {
    const result = reply(input);
    assert.ok(result.followup, `expected followup for ${input}`);
    assert.equal(result.followup.type, 'edit');
  }
});

test('clear returns { type: "clear" }', () => {
  assert.deepEqual(resolveLocalCommand('clear'), { type: 'clear' });
  assert.deepEqual(resolveLocalCommand('清屏'), { type: 'clear' });
});

test('forget returns { type: "forget" }', () => {
  assert.deepEqual(resolveLocalCommand('forget me'), { type: 'forget' });
  assert.deepEqual(resolveLocalCommand('forget'), { type: 'forget' });
  assert.deepEqual(resolveLocalCommand('reset'), { type: 'forget' });
  assert.deepEqual(resolveLocalCommand('忘记我'), { type: 'forget' });
});

test('exit returns { type: "close" }', () => {
  assert.deepEqual(resolveLocalCommand('exit'), { type: 'close' });
  assert.deepEqual(resolveLocalCommand('quit'), { type: 'close' });
  assert.deepEqual(resolveLocalCommand('close'), { type: 'close' });
  assert.deepEqual(resolveLocalCommand('退出'), { type: 'close' });
});

test('help text differs between en and zh', () => {
  const en = reply('help', 'en');
  const zh = reply('help', 'zh');
  assert.notEqual(en.text, zh.text);
});

test('reply text is localized for en and zh', () => {
  assert.notEqual(reply('about', 'en').text, reply('about', 'zh').text);
  assert.notEqual(reply('browse files', 'en').text, reply('browse files', 'zh').text);
  assert.notEqual(reply('run tests', 'en').text, reply('run tests', 'zh').text);
  assert.notEqual(reply('write code', 'en').text, reply('write code', 'zh').text);
});

test('unknown chat returns null', () => {
  for (const input of ['hello there', 'what is your name?', 'tell me a joke']) {
    assert.equal(resolveLocalCommand(input), null, `${input} should be null`);
  }
});

test('"test" does not swallow long sentences', () => {
  assert.equal(resolveLocalCommand("what's the latest test of X"), null);
  assert.equal(resolveLocalCommand('is this a good ls command'), null);
});

test('input is trimmed and case-insensitive', () => {
  assert.equal(resolveLocalCommand('  HELP  ').type, 'reply');
  assert.equal(resolveLocalCommand('About Elevenbeans').type, 'reply');
  assert.equal(resolveLocalCommand('About Elevenbeans').tools[0].output.includes('Shanghai'), true);
  assert.deepEqual(resolveLocalCommand('  EXIT '), { type: 'close' });
  assert.deepEqual(resolveLocalCommand('Forget Me'), { type: 'forget' });
});

console.log(`\n${passed} passed, ${failures.length} failed`);

if (failures.length > 0) {
  process.exitCode = 1;
  console.log('Failed: ' + failures.join(', '));
}
