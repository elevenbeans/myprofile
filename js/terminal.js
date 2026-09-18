import { open, close, register } from './overlays.js';

const termInput = document.getElementById('terminalInput');
const termOutput = document.getElementById('terminalOutput');
const terminal = document.getElementById('terminal');
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
    termPrint('Type `ai` to open the AI assistant.', 'highlight');
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
  const name = parts[0] && parts[0].toLowerCase();
  const args = parts.slice(1).map((s) => s.replace(/^"|"$/g, ''));
  if (!name) return;
  const assistantCommands = ['ai'];
  if (assistantCommands.includes(name)) {
    close('terminal');
    document.dispatchEvent(new CustomEvent('request-assistant', { detail: { source: name } }));
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

export function openTerminal() {
  if (!terminal) return;
  termOutput.innerHTML = '';
  termPrint('elevenbeans.me terminal v1.0', 'info');
  termPrint("Type `help` for available commands. Press 'Esc' to exit.", 'dim');
  termInput.value = '';
  open('terminal');
}

export function closeTerminal() {
  close('terminal');
}

export function initTerminal() {
  if (!terminal) return;
  register('terminal', {
    el: terminal,
    initialFocus: () => termInput,
    onClose: () => { termInput.value = ''; },
  });
  if (!termInput) return;
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
