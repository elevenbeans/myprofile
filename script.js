    const toggle = document.getElementById('themeToggle');
    const langToggle = document.getElementById('langToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    let currentLang = localStorage.getItem('lang') || 'en';

    const i18n = {
      en: {
        'hero-title': 'Software Engineer (AI Wrangler)',
        'hero-tagline': 'Minimalism first.\nThinking, logic, execution.',
        'section-experience': 'Experience',
        'section-projects': 'Projects',
        'section-hobbies': 'Interests',
        'exp-1-company': 'Trip.com Group',
        'exp-1-role': 'Senior FE Engineer & Team Leader',
        'exp-1-date': '2016.07 \u2013 2020.12',
        'exp-1-desc': 'Building travel booking systems at global scale.',
        'exp-2-company': 'Travix \u00b7 Cheaptickets.nl \u00b7 Budgetair.com',
        'exp-2-role': 'Technical Manager',
        'exp-2-date': '2021 \u2013 now',
        'exp-2-desc': 'International travel platforms and OTA price comparison.',
        'exp-3-company': 'Alibaba',
        'exp-3-role': 'Software Engineer',
        'exp-3-date': '2015 \u2013 2016',
        'exp-3-desc': 'E-commerce platform development.',
        'exp-4-company': "Xi'an Jiaotong University",
        'exp-4-major': 'Computer Science',
        'exp-4-date': '2012 \u2013 2015',
        'exp-5-company': 'Sichuan University',
        'exp-5-major': 'Computer Science',
        'exp-5-date': '2008 \u2013 2012',
        'project-nas-title': 'NAS Portal',
        'project-nas-desc': 'Self-hosted media & file management dashboard.',
        'project-blog-title': 'Blog',
        'project-blog-desc': 'Thoughts on engineering, travel, and side projects.',
        'project-game-title': 'Game of Life',
        'project-game-desc': "Conway's Game of Life simulation.",
        'tag-1': 'Self-hosting',
        'tag-2': 'Travel',
        'tag-3': 'Coffee',
        'tag-4': 'Cat',
        'tag-5': 'Music',
        'tag-6': 'Whisky',
        'tag-7': 'Vibe Coding',
        'exp-toggle-more': 'Show more',
        'exp-toggle-less': 'Show less'
      },
      zh: {
        'hero-title': '\u8F6F\u4EF6\u5DE5\u7A0B\u5E08\uFF08AI \u9A6F\u517D\u5E08\uFF09',
        'hero-tagline': '\u6781\u7B80\u7B2C\u4E00\u3002\n\u601D\u8DEF\uFF0C\u903B\u8F91\uFF0C\u6267\u884C\u529B\u3002',
        'section-experience': '\u5DE5\u4F5C\u7ECF\u5386',
        'section-projects': '\u9879\u76EE',
        'section-hobbies': '\u5174\u8DA3\u7231\u597D',
        'exp-1-company': '\u643A\u7A0B\u96C6\u56E2',
        'exp-1-role': '\u8D44\u6DF1\u524D\u7AEF\u5DE5\u7A0B\u5E08 & TL',
        'exp-1-date': '2016.07 \u2013 2020.12',
        'exp-1-desc': '\u6784\u5EFA\u5168\u7403\u89C4\u6A21\u7684\u65C5\u884C\u9884\u8BA2\u7CFB\u7EDF\u3002',
        'exp-2-company': 'Travix \u00b7 Cheaptickets.nl \u00b7 Budgetair.com',
        'exp-2-role': '\u6280\u672F\u7ECF\u7406',
        'exp-2-date': '2021 \u2013 \u81F3\u4ECA',
        'exp-2-desc': '\u56FD\u9645\u65C5\u884C\u5E73\u53F0\u548COTA\u6BD4\u4EF7\u670D\u52A1\u3002',
        'exp-3-company': '\u963F\u91CC\u5DF4\u5DF4',
        'exp-3-role': '\u8F6F\u4EF6\u5DE5\u7A0B\u5E08',
        'exp-3-date': '2015 \u2013 2016',
        'exp-3-desc': '\u7535\u5546\u5E73\u53F0\u5F00\u53D1\u3002',
        'exp-4-company': '\u897F\u5B89\u4EA4\u901A\u5927\u5B66',
        'exp-4-major': '\u8BA1\u7B97\u673A\u79D1\u5B66\u4E0E\u6280\u672F',
        'exp-4-date': '2012 \u2013 2015',
        'exp-5-company': '\u56DB\u5DDD\u5927\u5B66',
        'exp-5-major': '\u8BA1\u7B97\u673A\u79D1\u5B66\u4E0E\u6280\u672F',
        'exp-5-date': '2008 \u2013 2012',
        'project-nas-title': 'NAS \u95E8\u6237',
        'project-nas-desc': '\u81EA\u6258\u7BA1\u5A92\u4F53\u4E0E\u6587\u4EF6\u7BA1\u7406\u9762\u677F\u3002',
        'project-blog-title': '\u535A\u5BA2',
        'project-blog-desc': '\u5173\u4E8E\u5DE5\u7A0B\u3001\u65C5\u884C\u548C\u526F\u4E1A\u7684\u601D\u8003\u3002',
        'project-game-title': '\u751F\u547D\u6E38\u620F',
        'project-game-desc': '\u5EB7\u5A01\u751F\u547D\u6E38\u620F\u6A21\u62DF\u3002',
        'tag-1': '\u81EA\u6258\u7BA1',
        'tag-2': '\u65C5\u884C',
        'tag-3': '\u5496\u5561',
        'tag-4': '\u732B',
        'tag-5': '\u97F3\u4E50',
        'tag-6': '\u5A01\u58EB\u5FCC',
        'tag-7': 'Vibe Coding',
        'exp-toggle-more': '\u5C55\u5F00\u66F4\u591A',
        'exp-toggle-less': '\u6536\u8D77'
      }
    };

    function applyLang(lang) {
      currentLang = lang;
      const dict = i18n[lang];
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
      });
      if (expToggle && timeline.classList.contains('expanded')) {
        expToggle.textContent = dict['exp-toggle-less'];
      }
      langToggle.textContent = lang === 'en' ? '\u4E2D\u6587' : 'EN';
      document.documentElement.lang = lang;
      localStorage.setItem('lang', lang);
    }

    function applyTheme(dark) {
      document.body.classList.toggle('dark', dark);
      toggle.textContent = dark ? '\u2600' : '\u263E';
    }

    const expToggle = document.getElementById('expToggle');
    const timeline = document.querySelector('.timeline');

    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark.matches)) {
      applyTheme(true);
    }

    applyLang(currentLang);

    toggle.addEventListener('click', () => {
      const isDark = !document.body.classList.contains('dark');
      applyTheme(isDark);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    langToggle.addEventListener('click', () => {
      applyLang(currentLang === 'en' ? 'zh' : 'en');
    });

    if (expToggle && timeline) {
      expToggle.addEventListener('click', () => {
        const expanded = timeline.classList.toggle('expanded');
        const key = expanded ? 'exp-toggle-less' : 'exp-toggle-more';
        expToggle.textContent = i18n[currentLang][key];
      });
    }

    const agentOverlay = document.getElementById('codeAgent');
    const agentMessages = document.getElementById('agentMessages');
    const agentInput = document.getElementById('agentInput');
    const agentModelLabel = document.querySelector('.agent__header-model');
    let agentSource = 'opencode';
    const agentModels = {
      opencode: 'deepseek-v4-flash-free',
      claude: 'claude-sonnet-4-20250514',
      codex: 'gpt-4o-2025-01-22',
    };

    const agentResponses = [
      {
        keywords: ['hello', 'hi', 'hey', '你好', 'yo', 'hiya'],
        tools: [],
        respond: () => "Hey there! I'm your code agent, running right inside this static page.\n\nI can simulate tool calls, answer questions about this site, or just chat. Try:\n- `who are you`\n- `what can you do`\n- `explain this page`\n- `run tests`\n- `fix something`\n- `write code`\n- `browse files`\n- `deploy`",
      },
      {
        keywords: ['who are you', 'who', 'what are you', '你是谁', 'what is this'],
        tools: [
          { type: 'bash', cmd: 'whoami', output: 'opencode (simulated AI code agent)\nModel: deepseek-v4-flash-free\nRuntime: static HTML page\nUptime: since you opened me' },
        ],
        respond: () => "I'm a simulated AI code agent — think of me as opencode running in your browser.\n\nI'm not connected to any real LLM, but I can put on a convincing show. Here's my system info:",
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
          { type: 'bash', cmd: 'npm test', output: 'PASS  src/__tests__/app.test.tsx\n  ✓ renders without crashing (12ms)\n  ✓ handles dark mode toggle (8ms)\n  ✓ switches language (6ms)\n  ✓ opens terminal on dblclick (15ms)\n  ✓ agent overlay opens on "ai" command (10ms)\n\nTests: 5 passed, 5 total\nTime: 0.3s' },
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
        respond: () => "This is a single-file personal profile page for **elevenbeans** — a software engineer from Amsterdam.\n\nIt contains:\n- Hero section\n- Work timeline (Trip.com, Travix, Alibaba)\n- Projects (NAS Portal, Blog, Budgetair, Cheaptickets, Game of Life)\n- Interests tags (7 of them)\n- A hidden **retro terminal** easter egg (Ctrl+`)\n- And **me** — the hidden code agent easter egg!\n\n100% static HTML/CSS/JS, zero dependencies.",
      },
      {
        keywords: ['deploy', '发布', 'ship', 'publish'],
        tools: [
          { type: 'bash', cmd: 'npm run build', output: '✓ Building...\n✓ Static files generated\n✓ Assets optimized\n✓ Bundle size: 14.2 KB' },
          { type: 'bash', cmd: 'gh pr create --title "feat: add hidden code agent"', output: '✓ Creating pull request...\n→ https://github.com/elevenbeans/elevenbeans.me/pull/42' },
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

    function findAgentResponse(input) {
      const lower = input.toLowerCase().trim();
      if (lower === 'exit' || lower === 'quit' || lower === 'close') return null;
      for (const entry of agentResponses) {
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

    function addAgentMsg(type, content, cls) {
      const div = document.createElement('div');
      div.className = 'agent__msg';
      const header = document.createElement('div');
      header.className = 'agent__msg-header ' + (type === 'user' ? 'u' : 'a');
      header.textContent = type === 'user' ? 'You' : 'Agent';
      div.appendChild(header);
      const body = document.createElement('div');
      body.className = 'agent__msg-body';
      if (cls) body.className += ' ' + cls;
      body.innerHTML = content;
      div.appendChild(body);
      agentMessages.appendChild(div);
      agentMessages.scrollTop = agentMessages.scrollHeight;
    }

    function addAgentToolCall(tool) {
      const tc = document.createElement('div');
      tc.className = 'agent__tool-call';
      const hdr = document.createElement('div');
      hdr.className = 'agent__tool-header ' + tool.type;
      const icons = { bash: '\u25CB', edit: '\u270E', read: '\u25C1' };
      hdr.innerHTML = '<span class="agent__tool-icon">' + (icons[tool.type] || '\u25CB') + '</span>'
        + '<span class="agent__tool-title">' + (tool.title || ({ bash: 'Run bash', edit: 'Edit file', read: 'Read file' }[tool.type] || 'Tool')) + '</span>'
        + '<span class="agent__tool-arrow">\u2193</span>';
      tc.appendChild(hdr);
      if (tool.cmd) {
        const cmdEl = document.createElement('div');
        cmdEl.className = 'agent__tool-output';
        cmdEl.textContent = '$ ' + tool.cmd;
        tc.appendChild(cmdEl);
      }
      if (tool.output) {
        const outEl = document.createElement('div');
        outEl.className = 'agent__tool-output';
        outEl.textContent = tool.output;
        tc.appendChild(outEl);
      }
      agentMessages.appendChild(tc);
      agentMessages.scrollTop = agentMessages.scrollHeight;
    }

    function showAgentThinking() {
      const div = document.createElement('div');
      div.className = 'agent__thinking';
      div.id = 'agentThinking';
      div.innerHTML = 'thinking'
        + '<span class="agent__thinking-dot">.</span>'
        + '<span class="agent__thinking-dot">.</span>'
        + '<span class="agent__thinking-dot">.</span>';
      agentMessages.appendChild(div);
      agentMessages.scrollTop = agentMessages.scrollHeight;
      return div;
    }

    function simulateAgentResponse(input) {
      addAgentMsg('user', escapeHtml(input));

      if (['exit', 'quit', 'close'].includes(input.toLowerCase().trim())) {
        setTimeout(closeCodeAgent, 500);
        return;
      }

      const thinking = showAgentThinking();
      const entry = findAgentResponse(input);
      const delay = 600 + Math.random() * 500;

      setTimeout(() => {
        thinking.remove();
        const resp = entry.respond();
        addAgentMsg('agent', marked(resp));

        let totalDelay = 0;
        if (entry.tools && entry.tools.length > 0) {
          entry.tools.forEach((tool, i) => {
            totalDelay = (i + 1) * (500 + Math.random() * 400);
            setTimeout(() => addAgentToolCall(tool), totalDelay);
          });
        }

        if (entry.afterTools) {
          const finalDelay = totalDelay + 700;
          setTimeout(() => {
            const extra = entry.afterTools();
            addAgentToolCall(extra);
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
      return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre>$2</pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*(\S[^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    }

    function addAgentWelcome() {
      const div = document.createElement('div');
      div.className = 'agent__msg agent__welcome';
      const body = document.createElement('div');
      body.className = 'agent__msg-body';
      body.style.color = '#8b949e';
      body.style.fontSize = '0.8rem';
      body.innerHTML = marked('Simulating the opencode experience. Try `help`, `explain this page`, `run tests`, `write code`, `about elevenbeans`.');
      div.appendChild(body);
      agentMessages.appendChild(div);
    }

    function openCodeAgent(source) {
      if (source) agentSource = source;
      agentModelLabel.textContent = agentSource + '/' + (agentModels[agentSource] || 'deepseek-v4-flash-free');
      if (agentMessages.children.length === 0) {
        agentMessages.innerHTML = '';
        addAgentWelcome();
      }
      agentOverlay.classList.add('open');
      agentInput.focus();
      document.body.style.overflow = 'hidden';
    }

    function closeCodeAgent() {
      agentOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (agentInput) {
      agentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = agentInput.value.trim();
          if (!val) return;
          agentInput.value = '';
          simulateAgentResponse(val);
        }
      });
    }

    document.getElementById('agentClose').addEventListener('click', closeCodeAgent);

    const agentHint = document.getElementById('agentHint');
    if (agentHint) {
      agentHint.addEventListener('click', () => openCodeAgent());
    }

    const terminal = document.getElementById('terminal');
    const termInput = document.getElementById('terminalInput');
    const termOutput = document.getElementById('terminalOutput');
    let termHistory = [];
    let histIdx = -1;

    const fileSystem = {
      'home': {
        'elevenbeans': {
          'Experience': {
            '.tag': 'dir',
            'frontend-dev.md': '.tag: file\nFrontend development at a startup.\nStack: React, TypeScript, Tailwind.',
            'freelance.md': '.tag: file\nFreelance web developer.\nStack: Various.',
          },
          'Projects': {
            '.tag': 'dir',
            'NAS Portal': '.tag: dir\nSelf-hosted media & file management dashboard.',
            'Blog': '.tag: dir\nThoughts on engineering, travel, and side projects.',
            'Budgetair.com': '.tag: dir\nOTA flight booking platform.',
            'Cheaptickets.nl': '.tag: dir\nFlight search and comparison.',
            'Game of Life': '.tag: dir\nConway\'s Game of Life simulation.',
          },
          'Interests': {
            '.tag': 'dir',
            'Self-hosting': '.tag: file\nRunning my own infrastructure for fun and privacy.',
            'Travel': '.tag: file\nExploring new places and cultures.',
            'Coffee': '.tag: file\nEspresso, pour-over, and everything in between.',
            'Cat': '.tag: file\nProud cat dad.',
            'Music': '.tag: file\nPlay guitar and produce beats.',
            'Whisky': '.tag: file\nSingle malt enthusiast.',
            'Vibe Coding': '.tag: file\nAI-assisted development flow state.',
          },
        },
      },
    };
    let currentDir = ['home', 'elevenbeans'];

    function resolveDir(path) {
      let node = fileSystem;
      for (const seg of path) {
        if (!node[seg] || typeof node[seg] === 'string') return null;
        node = node[seg];
      }
      return node;
    }

    function listDir(node) {
      return Object.keys(node).filter(k => k !== '.tag');
    }

    function termPrint(text, className) {
      const line = document.createElement('div');
      if (className) line.className = className;
      line.textContent = text;
      termOutput.appendChild(line);
      termOutput.scrollTop = termOutput.scrollHeight;
    }

    function termPromptText() {
      return '/home/' + currentDir.slice(1).join('/');
    }

    function termPrompt() {
      termPrint(termPromptText() + ' $ ' + termInput.value, 'dim');
    }

    const termCmds = {
      whoami() { termPrint('elevenbeans', 'highlight'); },
      date() { termPrint(new Date().toString(), 'info'); },
      pwd() { termPrint(termPromptText(), 'info'); },
      help() {
        termPrint('Available commands:');
        Object.keys(termCmds).forEach(c => termPrint('  ' + c));
        termPrint('', '');
        termPrint('Use `cd <dir>` to navigate, `ls` to list contents.', 'dim');
        termPrint('Try: cd Experience, cd Projects, cd ..', 'dim');
        termPrint('', '');
        termPrint('Type `codex`, `claude`, or `opencode` to open the code agent.', 'highlight');
      },
      ls() {
        const node = resolveDir(currentDir);
        if (!node) { termPrint('Error: lost in filesystem', 'error'); return; }
        const entries = listDir(node);
        if (entries.length === 0) { termPrint('(empty)', 'dim'); return; }
        const formatted = entries.map(e => {
          const child = node[e];
          return typeof child === 'object' && child !== null ? e + '/' : e;
        });
        termPrint(formatted.join('  '), 'info');
      },
      cd(args) {
        if (!args || args.length === 0) {
          currentDir = ['home', 'elevenbeans'];
          return;
        }
        const target = args[0];
        if (target === '..') {
          if (currentDir.length > 2) currentDir.pop();
          return;
        }
        if (target === '/') {
          currentDir = ['home', 'elevenbeans'];
          return;
        }
        const parts = target.split('/').filter(Boolean);
        let testDir = [...currentDir];
        for (const p of parts) {
          if (p === '..') { if (testDir.length > 2) testDir.pop(); }
          else if (p === '.' || p === '~') { /* no-op */ }
          else {
            const node = resolveDir(testDir);
            if (!node || !node[p] || typeof node[p] === 'string') {
              termPrint('cd: no such directory: ' + target, 'error');
              return;
            }
            testDir.push(p);
          }
        }
        currentDir = testDir;
      },
      clear() { termOutput.innerHTML = ''; },
      exit() { closeTerminal(); },
      neofetch() {
        termPrint('', '');
        termPrint('       .---.         elevenbeans@web', 'highlight');
        termPrint('      /     \\        ----------------', 'dim');
        termPrint('     |.---.()|       OS: Static Site v1.0', '');
        termPrint('      \\ o   /        Host: GitHub Pages', '');
        termPrint('       \\___/         Kernel: HTML5 + CSS3 + JS', '');
        termPrint('', '');
        termPrint('                     Uptime: since 2026', '');
        termPrint('                     Shell: /bin/bash', '');
        termPrint('', '');
      },
      uname() { termPrint('HTML5/CSS3/JS static-site unknown 2026-01-01', 'info'); },
      echo(args) { termPrint(args.join(' '), ''); },
      sudo() { termPrint('Nice try. 💀', 'error'); }
    };

    function processCommand(cmd) {
      termPrompt();
      const parts = cmd.trim().match(/(?:[^\s"]+|"[^"]*")+/g) || [];
      const name = parts[0]?.toLowerCase();
      const args = parts.slice(1).map(s => s.replace(/^"|"$/g, ''));
      if (!name) return;
      const agentCommands = ['codex', 'claude', 'opencode'];
      if (agentCommands.includes(name)) {
        closeTerminal();
        setTimeout(() => openCodeAgent(name), 300);
        return;
      }
      if (termCmds[name]) {
        if (name === 'echo' || name === 'cd') termCmds[name](args);
        else if (name === 'uname') termCmds.uname();
        else termCmds[name]();
      } else {
        termPrint('Command not found: ' + name + '. Try `help`.', 'error');
      }
    }

    function openTerminal() {
      terminal.classList.add('open');
      termInput.value = '';
      termOutput.innerHTML = '';
      termPrint('elevenbeans.me terminal v1.0', 'info');
      termPrint('Type `help` for available commands. Press \'Esc\' to exit.', 'dim');
      termInput.focus();
      document.body.style.overflow = 'hidden';
    }

    function closeTerminal() {
      terminal.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.addEventListener('keydown', (e) => {
      if (!terminal) return;
      const isOpen = terminal.classList.contains('open');
      const agentOpen = agentOverlay.classList.contains('open');
      if (e.ctrlKey && e.shiftKey && e.code === 'Backquote') {
        e.preventDefault();
        if (agentOpen) closeCodeAgent();
        else openCodeAgent();
        return;
      }
      if (e.ctrlKey && e.code === 'Backquote' && !e.shiftKey) {
        e.preventDefault();
        openTerminal();
        return;
      }
      if (e.shiftKey && e.code === 'Semicolon' && !isOpen && !agentOpen && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        openTerminal();
        return;
      }
      if (e.key === 'Escape') {
        if (agentOpen) { e.preventDefault(); closeCodeAgent(); return; }
        if (isOpen) { e.preventDefault(); closeTerminal(); return; }
      }
    });

    const heroName = document.getElementById('heroName');
    if (heroName) {
      heroName.addEventListener('dblclick', (e) => {
        e.preventDefault();
        openTerminal();
      });
      heroName.style.cursor = 'default';
    }

    const termHint = document.getElementById('termHint');
    if (termHint) {
      termHint.addEventListener('click', openTerminal);
    }

    if (termInput) {
      termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const cmd = termInput.value;
          termHistory.push(cmd);
          histIdx = termHistory.length;
          processCommand(cmd);
          termInput.value = '';
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (histIdx > 0) {
            histIdx--;
            termInput.value = termHistory[histIdx] || '';
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (histIdx < termHistory.length - 1) {
            histIdx++;
            termInput.value = termHistory[histIdx] || '';
          } else {
            histIdx = termHistory.length;
            termInput.value = '';
          }
        }
      });
    }
