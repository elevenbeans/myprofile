// Pure, DOM-free, network-free local command resolver for the AI assistant.
//
// Matching rules (kept deliberately conservative so ordinary chat falls
// through to the backend):
//   1. Normalize once: `input.trim().toLowerCase()`.
//   2. Single-token commands match ONLY the whole normalized string. This
//      keeps ambiguous words (`test`, `ls`, `make`, `close`) from firing on
//      longer chat such as "what's the latest test of X".
//   3. Multi-word commands are phrases; they match the whole string or a
//      prefix followed by a space, so "about elevenbeans" / "run tests please"
//      resolve while unrelated sentences do not.
//   4. Anything unmatched returns `null` (caller sends it over the network).
//   5. Order is intentional: the richer reply commands are checked before the
//      state-changing ones (clear/forget/close).
//
// Reply text is localized: English when `locale === 'en'`, Chinese otherwise.
// Tool `cmd`/`output` strings stay English/technical on purpose.

const EXACT_HELP = new Set(['help', '?', 'commands', '帮助']);
const EXACT_ABOUT = new Set(['about', '背景']);
const EXACT_BROWSE = new Set(['browse', 'ls', 'files', '文件']);
const EXACT_TESTS = new Set(['test', '测试']);
const EXACT_WRITE = new Set(['write', 'generate', 'create', 'make', '写代码']);
const EXACT_CLEAR = new Set(['clear', '清屏']);
const EXACT_FORGET = new Set(['forget me', 'forget', 'reset', '忘记我']);
const EXACT_CLOSE = new Set(['exit', 'quit', 'close', '退出']);

const PHRASE_ABOUT = ['about elevenbeans', 'who is elevenbeans'];
const PHRASE_BROWSE = ['browse files'];
const PHRASE_TESTS = ['run tests', 'run test', 'npm test'];
const PHRASE_WRITE = ['write code'];

function matches(s, phrases, exact) {
  if (exact.has(s)) return true;
  return phrases.some((p) => s === p || s.startsWith(p + ' '));
}

function isZh(locale) {
  return locale !== 'en';
}

function helpText(locale) {
  if (isZh(locale)) {
    return [
      '我是你的 AI 助手 —— 直接用自然语言和我聊天即可。',
      '',
      '本地命令（离线运行）：',
      '- `about` —— 了解 elevenbeans',
      '- `browse files` —— 查看项目文件',
      '- `run tests` —— 模拟运行测试',
      '- `write code` —— 生成一个小文件',
      '- `clear` —— 清空当前对话',
      '- `forget me` —— 清除已保存的记忆',
      '- `exit` —— 关闭此面板',
    ].join('\n');
  }
  return [
    "I'm your AI assistant — ask me anything and I'll reply in natural language.",
    '',
    'Local commands (these run offline):',
    '- `about` — who is elevenbeans',
    '- `browse files` — list the project files',
    '- `run tests` — simulate the test suite',
    '- `write code` — generate a small file',
    '- `clear` — clear the transcript',
    '- `forget me` — wipe saved memory',
    '- `exit` — close this overlay',
  ].join('\n');
}

function aboutReply(locale) {
  const output = JSON.stringify(
    {
      login: 'elevenbeans',
      name: 'Elevenbeans',
      location: 'Shanghai, occasionally in Amsterdam (AMS)',
      bio: 'Minimalism first. Thinking, logic, execution.',
    },
    null,
    2
  );
  return {
    type: 'reply',
    text: isZh(locale)
      ? '这是 **elevenbeans** 的 GitHub 资料：'
      : "Here's the GitHub profile for **elevenbeans**:",
    tools: [
      {
        type: 'bash',
        cmd: 'curl -s https://api.github.com/users/elevenbeans',
        output,
      },
    ],
  };
}

function browseReply(locale) {
  const output = [
    'drwxr-xr-x  11 elevenbeans  staff   352B Sep 18 12:00 .',
    'drwxr-xr-x   5 elevenbeans  staff   160B Sep 18 12:00 ..',
    '-rw-r--r--   1 elevenbeans  staff   143B Sep 18 12:00 CNAME',
    '-rw-r--r--   1 elevenbeans  staff    12K Sep 18 12:00 index.html',
    'drwxr-xr-x  10 elevenbeans  staff   320B Sep 18 12:00 js/',
    '-rw-r--r--   1 elevenbeans  staff    19K Sep 18 12:00 styles.css',
  ].join('\n');
  return {
    type: 'reply',
    text: isZh(locale)
      ? '项目根目录下有以下文件：'
      : "Here's what's in the project root:",
    tools: [{ type: 'bash', cmd: 'ls -la', output }],
  };
}

function testsReply(locale) {
  const output = [
    'PASS  tests/assistant-commands.test.js',
    '  ✓ help returns a reply and lists local commands (3ms)',
    '  ✓ about output contains Shanghai and Amsterdam (1ms)',
    '  ✓ write code returns a bash tool plus a followup edit tool (2ms)',
    '',
    'Tests: 3 passed, 3 total',
    'Time: 0.2s',
  ].join('\n');
  return {
    type: 'reply',
    text: isZh(locale) ? '正在运行测试套件……' : 'Running the test suite...',
    tools: [{ type: 'bash', cmd: 'npm test', output }],
  };
}

function writeCodeReply(locale) {
  const code = [
    'function greet(name: string): string {',
    '  return `Hello, ${name}! Welcome to elevenbeans.me`;',
    '}',
    '',
    "const visitor = 'friend';",
    'console.log(greet(visitor));',
  ].join('\n');
  return {
    type: 'reply',
    text: isZh(locale) ? '好的，我来写点东西：' : 'Sure! Let me write something for you:',
    tools: [{ type: 'bash', cmd: 'cat > hello.ts', output: '' }],
    followup: { type: 'edit', title: 'Created hello.ts', output: code },
  };
}

export function resolveLocalCommand(input, locale = 'en') {
  if (typeof input !== 'string') return null;
  const s = input.trim().toLowerCase();
  if (!s) return null;

  if (EXACT_HELP.has(s)) return { type: 'reply', text: helpText(locale) };
  if (matches(s, PHRASE_ABOUT, EXACT_ABOUT)) return aboutReply(locale);
  if (matches(s, PHRASE_BROWSE, EXACT_BROWSE)) return browseReply(locale);
  if (matches(s, PHRASE_TESTS, EXACT_TESTS)) return testsReply(locale);
  if (matches(s, PHRASE_WRITE, EXACT_WRITE)) return writeCodeReply(locale);
  if (EXACT_CLEAR.has(s)) return { type: 'clear' };
  if (EXACT_FORGET.has(s)) return { type: 'forget' };
  if (EXACT_CLOSE.has(s)) return { type: 'close' };
  return null;
}
