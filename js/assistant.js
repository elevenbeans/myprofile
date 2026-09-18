import { open, close, register } from './overlays.js';

const assistantMessages = document.getElementById('assistantMessages');
const assistantInput = document.getElementById('assistantInput');
const assistantOverlay = document.getElementById('assistant');
const assistantModelLabel = document.querySelector('.assistant__header-model');
const assistantClose = document.getElementById('assistantClose');
let assistantSource = 'opencode';
const assistantModels = {
  opencode: 'deepseek-v4-flash-free',
  claude: 'claude-sonnet-4-20250514',
  codex: 'gpt-4o-2025-01-22',
};

const assistantResponses = [
  {
    keywords: ['hello', 'hi', 'hey', '你好', 'yo', 'hiya'],
    tools: [],
    respond: () => "Hey there! I'm your AI assistant, running right inside this static page.\n\nI can simulate tool calls, answer questions about this site, or just chat. Try:\n- `who are you`\n- `what can you do`\n- `explain this page`\n- `run tests`\n- `fix something`\n- `write code`\n- `browse files`\n- `deploy`",
  },
  {
    keywords: ['who are you', 'who', 'what are you', '你是谁', 'what is this'],
    tools: [
      { type: 'bash', cmd: 'whoami', output: 'opencode (simulated AI assistant)\nModel: deepseek-v4-flash-free\nRuntime: static HTML page\nUptime: since you opened me' },
    ],
    respond: () => "I'm a simulated AI assistant — think of me as opencode running in your browser.\n\nI'm not connected to any real LLM, but I can put on a convincing show. Here's my system info:",
  },
  {
    keywords: ['can you do', 'help', 'commands', '能力', 'what'],
    tools: [],
    respond: () => "I can simulate the opencode TUI experience right here. Try:\n\n- `write code` — I'll generate something\n- `explain this page` — I'll analyze the site\n- `run tests` — mock test execution\n- `fix something` — mock code edit with diff\n- `deploy` — mock deployment flow\n- `browse files` — list project files\n- `about elevenbeans` — who built this site\n- `42` — the meaning of life\n- `open the pod bay doors` — see what happens",
  },
  {
    keywords: ['write code', 'generate', 'create', '写代码', 'make'],
    tools: [
      { type: 'bash', cmd: 'cat > hello.ts', output: '' },
    ],
    respond: () => "Sure! Let me write something for you:",
    afterTools: () => ({
      type: 'edit',
      title: 'Created hello.ts',
      output: `function greet(name: string): string {\n  return \`Hello, \${name}! Welcome to elevenbeans.me\`;\n}\n\nconst visitor = 'friend';\nconsole.log(greet(visitor));`,
    }),
  },
  {
    keywords: ['run test', 'test', '测试', 'npm test'],
    tools: [
      { type: 'bash', cmd: 'npm test', output: 'PASS  src/__tests__/app.test.tsx\n  ✓ renders without crashing (12ms)\n  ✓ handles dark mode toggle (8ms)\n  ✓ switches language (6ms)\n  ✓ opens terminal on dblclick (15ms)\n  ✓ assistant overlay opens on "ai" command (10ms)\n\nTests: 5 passed, 5 total\nTime: 0.3s' },
    ],
    respond: () => "Running the test suite...",
  },
  {
    keywords: ['fix', 'bug', '错误', '修', 'typo', 'broken'],
    tools: [
      { type: 'read', title: 'Reading index.html:534', output: '<span class="term-hint__cursor"></span>' },
    ],
    respond: () => "Found a potential issue. Let me take a look:",
    afterTools: () => ({
      type: 'edit',
      title: 'Fixed CSS animation reference',
      output: `- <span class="term-hint__cursor"></span>\n+ <span class="term-hint__cursor" style="animation: blink 1s step-end infinite"></span>\n\n✓ Fixed missing animation reference`,
    }),
  },
  {
    keywords: ['explain', 'what is', '是什么', '解释', 'describe', 'tell me about'],
    tools: [
      { type: 'bash', cmd: 'cat index.html | head -50', output: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>elevenbeans</title>\n  ...' },
    ],
    respond: () => "This is a single-file personal profile page for **elevenbeans** — a software engineer from Amsterdam.\n\nIt contains:\n- Hero section\n- Work timeline (Trip.com, Travix, Alibaba)\n- Projects (NAS Portal, Blog, Budgetair, Cheaptickets, Game of Life)\n- Interests tags (7 of them)\n- A hidden **retro terminal** easter egg (Ctrl+`)\n- And **me** — the hidden AI assistant easter egg!\n\n100% static HTML/CSS/JS, zero dependencies.",
  },
  {
    keywords: ['deploy', '发布', 'ship', 'publish'],
    tools: [
      { type: 'bash', cmd: 'npm run build', output: '✓ Building...\n✓ Static files generated\n✓ Assets optimized\n✓ Bundle size: 14.2 KB' },
      { type: 'bash', cmd: 'gh pr create --title "feat: add hidden AI assistant"', output: '✓ Creating pull request...\n→ https://github.com/elevenbeans/elevenbeans.me/pull/42' },
    ],
    respond: () => "Let me ship this to production...",
    afterTools: () => ({
      type: 'bash',
      title: 'Deploy to GitHub Pages',
      output: '✓ Deploy preview ready\n→ https://elevenbeans.me\n🚀 Production deployment complete!',
    }),
  },
  {
    keywords: ['browse', 'ls', 'file', '文件', 'list'],
    tools: [
      { type: 'bash', cmd: 'ls -la', output: 'drwxr-xr-x  11 elevenbeans  staff   352B May 30 12:00 .\ndrwxr-xr-x   5 elevenbeans  staff   160B May 30 12:00 ..\n-rw-r--r--   1 elevenbeans  staff   18KB May 30 12:00 index.html\n-rw-r--r--   1 elevenbeans  staff   174B May 30 12:00 CNAME' },
    ],
    respond: () => "Here's what's in the project root:",
  },
  {
    keywords: ['about', 'elevenbeans', 'who is', 'bio', '背景'],
    tools: [
      { type: 'bash', cmd: 'curl -s https://api.github.com/users/elevenbeans', output: '{\n  "login": "elevenbeans",\n  "name": "Elevenbeans",\n  "location": "Amsterdam",\n  "bio": "Minimalism first. Thinking, logic, execution."\n}' },
    ],
    respond: () => "**elevenbeans** is a software engineer based in Amsterdam. Career:\n\n- **Trip.com Group** — Sr FE Engineer & Team Lead (2016–2020)\n- **Travix / Cheaptickets / Budgetair** — Tech Manager (2021–now)\n- **Alibaba** — Software Engineer (2015–2016)\n\nStudied CS at Sichuan Univ & Xi'an Jiaotong Univ.\n\nProjects: NAS Portal, Blog, Game of Life, Budgetair.com",
  },
  {
    keywords: ['42'],
    tools: [],
    respond: () => "42. The answer to life, the universe, and everything.\n\nBut you already knew that, didn't you?",
  },
  {
    keywords: ['pod bay', 'hal', 'open the door', 'dave'],
    tools: [
      { type: 'bash', cmd: 'pod_bay_door --status', output: 'HAL 9000: I\'m sorry, Dave. I\'m afraid I can\'t do that.' },
    ],
    respond: () => "I'm sorry, Dave. I'm afraid I can't do that.\n\n(This mission is too important for me to allow you to jeopardize it.)",
  },
];

function findAssistantResponse(input) {
  const lower = input.toLowerCase().trim();
  if (lower === 'exit' || lower === 'quit' || lower === 'close') return null;
  for (const entry of assistantResponses) {
    if (entry.keywords.some(k => lower.includes(k))) return entry;
  }
  return {
    keywords: [],
    tools: Math.random() > 0.5 ? [{ type: 'bash', cmd: 'echo processing...', output: 'Done.' }] : [],
    respond: () => {
      const fallbacks = [
        `I'm not sure what to do with \`${input}\`. Try \`help\` to see what I can do.`,
        `Hmm, I don't have a handler for "${input}". Type \`help\` for options!`,
        `I'm just a simulation, so "${input}" isn't something I can respond to. Try \`what can you do\` for ideas.`,
        `Not sure about "${input}". Want to try something else? Try \`explain this page\` or \`run tests\`.`,
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    },
  };
}

function addAssistantMsg(type, content, cls) {
  const div = document.createElement('div');
  div.className = 'assistant__msg';
  const header = document.createElement('div');
  header.className = 'assistant__msg-header ' + (type === 'user' ? 'u' : 'a');
  header.textContent = type === 'user' ? 'You' : 'Assistant';
  div.appendChild(header);
  const body = document.createElement('div');
  body.className = 'assistant__msg-body';
  if (cls) body.className += ' ' + cls;
  body.innerHTML = content;
  div.appendChild(body);
  assistantMessages.appendChild(div);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

function addAssistantToolCall(tool) {
  const tc = document.createElement('div');
  tc.className = 'assistant__tool-call';
  const hdr = document.createElement('div');
  hdr.className = 'assistant__tool-header ' + tool.type;
  const icons = { bash: '\u25CB', edit: '\u270E', read: '\u25C1' };
  hdr.innerHTML = '<span class="assistant__tool-icon">' + (icons[tool.type] || '\u25CB') + '</span>'
    + '<span class="assistant__tool-title">' + (tool.title || ({ bash: 'Run bash', edit: 'Edit file', read: 'Read file' }[tool.type] || 'Tool')) + '</span>'
    + '<span class="assistant__tool-arrow">\u2193</span>';
  tc.appendChild(hdr);
  if (tool.cmd) {
    const cmdEl = document.createElement('div');
    cmdEl.className = 'assistant__tool-output';
    cmdEl.textContent = '$ ' + tool.cmd;
    tc.appendChild(cmdEl);
  }
  if (tool.output) {
    const outEl = document.createElement('div');
    outEl.className = 'assistant__tool-output';
    outEl.textContent = tool.output;
    tc.appendChild(outEl);
  }
  assistantMessages.appendChild(tc);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

function showAssistantThinking() {
  const div = document.createElement('div');
  div.className = 'assistant__thinking';
  div.id = 'assistantThinking';
  div.innerHTML = 'thinking'
    + '<span class="assistant__thinking-dot">.</span>'
    + '<span class="assistant__thinking-dot">.</span>'
    + '<span class="assistant__thinking-dot">.</span>';
  assistantMessages.appendChild(div);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
  return div;
}

function simulateAssistantResponse(input) {
  addAssistantMsg('user', escapeHtml(input));

  if (['exit', 'quit', 'close'].includes(input.toLowerCase().trim())) {
    setTimeout(closeAssistant, 500);
    return;
  }

  const thinking = showAssistantThinking();
  const entry = findAssistantResponse(input);
  const delay = 600 + Math.random() * 500;

  setTimeout(() => {
    thinking.remove();
    const resp = entry.respond();
    addAssistantMsg('assistant', marked(resp));

    let totalDelay = 0;
    if (entry.tools && entry.tools.length > 0) {
      entry.tools.forEach((tool, i) => {
        totalDelay = (i + 1) * (500 + Math.random() * 400);
        setTimeout(() => addAssistantToolCall(tool), totalDelay);
      });
    }

    if (entry.afterTools) {
      const finalDelay = totalDelay + 700;
      setTimeout(() => {
        const extra = entry.afterTools();
        addAssistantToolCall(extra);
      }, finalDelay);
    }
  }, delay);
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function marked(s) {
  const inline = [];
  const blocks = [];
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w*)\n([\s\S]*?)```/g, (m, lang, code) => {
      blocks.push(code);
      return '\u0002' + (blocks.length - 1) + '\u0002';
    })
    .replace(/`([^`]+)`/g, (m, code) => {
      inline.push(code);
      return '\u0001' + (inline.length - 1) + '\u0001';
    })
    .replace(/\*\*(\S[^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/\u0002(\d+)\u0002/g, (m, i) => '<pre>' + blocks[+i] + '</pre>')
    .replace(/\u0001(\d+)\u0001/g, (m, i) => '<code>' + inline[+i] + '</code>');
}

    function addAssistantWelcome() {
      const div = document.createElement('div');
      div.className = 'assistant__msg assistant__welcome';
      const body = document.createElement('div');
      body.className = 'assistant__msg-body';
      body.innerHTML = marked('Simulating the opencode experience. Try `help`, `explain this page`, `run tests`, `write code`, `about elevenbeans`.');
      div.appendChild(body);
      assistantMessages.appendChild(div);
    }

export function openAssistant(source) {
  if (!assistantOverlay) return;
  if (source) assistantSource = source;
  if (assistantModelLabel) {
    assistantModelLabel.textContent = assistantSource + '/' + (assistantModels[assistantSource] || 'deepseek-v4-flash-free');
  }
  if (assistantMessages.children.length === 0) {
    assistantMessages.innerHTML = '';
    addAssistantWelcome();
  }
  open('assistant');
}

export function closeAssistant() {
  close('assistant');
}

export function initAssistant() {
  if (!assistantOverlay) return;
  register('assistant', { el: assistantOverlay, initialFocus: () => assistantInput });
  if (assistantInput) {
    assistantInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = assistantInput.value.trim();
        if (!val) return;
        assistantInput.value = '';
        simulateAssistantResponse(val);
      }
    });
  }
  if (assistantClose) assistantClose.addEventListener('click', closeAssistant);
}
