# Site-wide Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the site-wide perf/a11y/motion/responsive/navigation polish for elevenbeans.me in one pass, with a behavior-preserving ES-module split of `script.js`.

**Architecture:** Native ES modules (no bundler). Leaf modules (`state`, `i18n`, `theme`, `overlays`, `ux`) hold isolated responsibilities; feature modules (`terminal`, `agent`) and one entry (`app.js`) wire them. CSS gains design tokens (`--accent-text`, `--blue-text`), a reduced-motion block, overlay/reveal transitions, responsive and print rules. `index.html` gets non-blocking font loading, a skip link, real `<button>` hints, ARIA wiring, and a module script tag.

**Tech Stack:** Vanilla HTML/CSS/JS, native ES modules, Google Fonts, GitHub Pages. Zero deps, no build.

**Spec:** `docs/superpowers/specs/2026-09-18-site-polish-design.md`

---

## Verification harness (used by every task)

No test framework exists and none may be added (zero-dep). Use these commands.

**ESM syntax check** (works for `.js` with `import`/`export`, no `package.json` needed):
```bash
node --input-type=module --check < js/state.js && echo OK
```

**Browser checks:**
```bash
B="$HOME/.opencode/skills/gstack/browse/dist/browse"
(cd /Users/elevenbeans/code/myprofile && python3 -m http.server 8080 >/tmp/myprofile-serve.log 2>&1 &)
sleep 1
"$B" goto http://localhost:8080
"$B" console --errors
```
Stop the server when done: `pkill -f "http.server 8080"`

**Not automatable:** `prefers-reduced-motion` emulation is blocked (`Emulation.setEmulatedMedia` is CDP-denied). Verify the reduced-motion CSS branch by asserting the stylesheet contains it, and by removing the `js` class to prove the no-JS fallback (commands given in tasks). Real reduced-motion behavior is a manual DevTools check at the end.

---

## File Structure

- Create `js/state.js` — crash-safe storage + shared "last focused element" state.
- Create `js/i18n.js` — dictionary, `applyLang`, `t`, `toggleLang`, `langchange` event.
- Create `js/theme.js` — apply/toggle theme, transition class, button ARIA.
- Create `js/overlays.js` — overlay registry, open/close, focus trap, scroll lock, Escape.
- Create `js/ux.js` — reduced-motion helper, scroll reveal, scroll progress, back-to-top.
- Create `js/terminal.js` — terminal filesystem/commands/history (moved from `script.js`).
- Create `js/agent.js` — simulated code agent (moved from `script.js`).
- Create `js/app.js` — entry: init all, wire hints/header/shortcuts, safety net.
- Delete `script.js` (after parity).
- Modify `index.html` — font loading, `js` class, skip link, ARIA, module tag, new elements.
- Modify `styles.css` — tokens, contrast, focus, sr-only/skip-link, reveal, overlay transitions, responsive, print.
- Modify `README.md` — note accessibility/no-JS.

---

## Task 1: Leaf modules (`state`, `i18n`, `theme`, `overlays`, `ux`)

**Files:**
- Create: `js/state.js`
- Create: `js/i18n.js`
- Create: `js/theme.js`
- Create: `js/overlays.js`
- Create: `js/ux.js`

- [ ] **Step 1: Create `js/state.js`**

```js
const memory = new Map();

export const storage = {
  get(key, fallback = null) {
    try {
      const value = window.localStorage.getItem(key);
      if (value !== null) return value;
    } catch (err) {}
    return memory.has(key) ? memory.get(key) : fallback;
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      memory.set(key, value);
    }
  },
};

let lastFocusedElement = null;

export function getLastFocused() {
  return lastFocusedElement;
}

export function setLastFocused(el) {
  lastFocusedElement = el;
}
```

- [ ] **Step 2: Create `js/i18n.js`**

Copy the existing dictionaries from `script.js:6-87` into this file as `i18n.en` and `i18n.zh`, then **add these keys to both dictionaries** (English value first, Chinese second):

| key | en | zh |
|---|---|---|
| `lang-toggle-label` | `中文` | `EN` |
| `skip-link` | `Skip to content` | `跳到主要内容` |
| `opens-new-tab` | `(opens in new tab)` | `（在新标签页打开）` |
| `theme-label-light` | `Switch to dark mode` | `切换到深色模式` |
| `theme-label-dark` | `Switch to light mode` | `切换到浅色模式` |
| `lang-label` | `Switch language` | `切换语言` |
| `back-to-top` | `Back to top` | `回到顶部` |
| `hint-terminal` | `Open terminal` | `打开终端` |
| `hint-agent` | `Open code agent` | `打开代码助手` |
| `terminal-label` | `Terminal` | `终端` |
| `terminal-log-label` | `Terminal output` | `终端输出` |
| `agent-label` | `Code agent` | `代码助手` |
| `agent-log-label` | `Agent messages` | `助手消息` |
| `agent-close` | `Close agent` | `关闭代码助手` |
| `agent-input-label` | `Code agent input` | `代码助手输入` |

Then append the module logic:

```js
import { storage } from './state.js';

let currentLang = storage.get('lang', 'en');
if (currentLang !== 'en' && currentLang !== 'zh') currentLang = 'en';

export function getLang() {
  return currentLang;
}

export function t(key) {
  const dict = i18n[currentLang] || i18n.en;
  if (dict[key] !== undefined) return dict[key];
  if (i18n.en[key] !== undefined) return i18n.en[key];
  return key;
}

export function applyLang(lang) {
  currentLang = lang === 'zh' ? 'zh' : 'en';
  const dict = i18n[currentLang];
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    if (dict[key] !== undefined) el.setAttribute('aria-label', dict[key]);
  });
  document.documentElement.lang = currentLang;
  storage.set('lang', currentLang);
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } }));
}

export function toggleLang() {
  applyLang(currentLang === 'en' ? 'zh' : 'en');
}
```

Note: `i18n` must be declared before the functions use it. Put the `import`, then `export const i18n = { en: {...}, zh: {...} };` (moved dict, with new keys), then `currentLang` and functions.

- [ ] **Step 3: Create `js/theme.js`**

```js
import { storage } from './state.js';
import { t } from './i18n.js';

const toggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

export function isDark() {
  return document.body.classList.contains('dark');
}

export function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  if (toggle) {
    toggle.textContent = dark ? '\u2600' : '\u263E';
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', dark ? t('theme-label-dark') : t('theme-label-light'));
  }
}

let transitionTimer = null;

function withTransition(fn) {
  document.documentElement.classList.add('theme-transitioning');
  fn();
  window.clearTimeout(transitionTimer);
  transitionTimer = window.setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning');
  }, 320);
}

export function toggleTheme() {
  const dark = !isDark();
  withTransition(() => applyTheme(dark));
  storage.set('theme', dark ? 'dark' : 'light');
}

export function initTheme() {
  const stored = storage.get('theme');
  const dark = stored === 'dark' || (!stored && prefersDark.matches);
  applyTheme(dark);
  if (toggle) toggle.addEventListener('click', toggleTheme);
  document.addEventListener('langchange', () => applyTheme(isDark()));
}
```

- [ ] **Step 4: Create `js/overlays.js`**

```js
import { getLastFocused, setLastFocused } from './state.js';

const overlays = new Map();
let openStack = [];

export function register(name, options) {
  if (!options || !options.el) return;
  overlays.set(name, options);
}

export function isOpen(name) {
  const overlay = overlays.get(name);
  return !!overlay && overlay.el.classList.contains('open');
}

export function anyOpen() {
  return openStack.length > 0;
}

export function open(name) {
  const overlay = overlays.get(name);
  if (!overlay || overlay.el.classList.contains('open')) return;
  [...openStack].forEach((n) => close(n));
  setLastFocused(document.activeElement);
  overlay.el.classList.add('open');
  overlay.el.setAttribute('aria-hidden', 'false');
  openStack.push(name);
  document.body.style.overflow = 'hidden';
  if (overlay.onOpen) overlay.onOpen();
  const target = overlay.initialFocus ? overlay.initialFocus() : null;
  if (target && target.focus) target.focus();
}

export function close(name) {
  const overlay = overlays.get(name);
  if (!overlay || !overlay.el.classList.contains('open')) return;
  overlay.el.classList.remove('open');
  overlay.el.setAttribute('aria-hidden', 'true');
  openStack = openStack.filter((n) => n !== name);
  if (overlay.onClose) overlay.onClose();
  if (openStack.length === 0) {
    document.body.style.overflow = '';
    const el = getLastFocused();
    if (el && el.focus) el.focus();
    setLastFocused(null);
  }
}

export function closeAll() {
  [...openStack].forEach((n) => close(n));
}

export function initOverlays() {
  overlays.forEach((overlay) => overlay.el.setAttribute('aria-hidden', 'true'));
  document.addEventListener('keydown', (e) => {
    if (!openStack.length) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close(openStack[openStack.length - 1]);
      return;
    }
    if (e.key === 'Tab') {
      const { el } = overlays.get(openStack[openStack.length - 1]);
      const focusables = Array.from(el.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )).filter((node) => !node.disabled);
      if (!focusables.length) { e.preventDefault(); return; }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first || !el.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last || !el.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
```

- [ ] **Step 5: Create `js/ux.js`**

```js
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function revealAll() {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
}

export function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;
  targets.forEach((el, index) => {
    el.style.setProperty('--reveal-delay', Math.min(index * 40, 120) + 'ms');
  });
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    revealAll();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  targets.forEach((el) => observer.observe(el));
}

export function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  let ticking = false;
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const ratio = max > 0 ? Math.min(doc.scrollTop / max, 1) : 0;
    bar.style.transform = 'scaleX(' + ratio + ')';
    ticking = false;
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

export function initBackToTop() {
  const button = document.querySelector('.back-to-top');
  if (!button) return;
  const onScroll = () => {
    button.classList.toggle('visible', window.scrollY > window.innerHeight * 1.5);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });
}
```

- [ ] **Step 6: Syntax-check all five modules**

Run:
```bash
cd /Users/elevenbeans/code/myprofile
for f in js/state.js js/i18n.js js/theme.js js/overlays.js js/ux.js; do
  node --input-type=module --check < "$f" && echo "OK $f"
done
```
Expected: `OK js/state.js` ... `OK js/ux.js`, no output before each OK.

- [ ] **Step 7: Commit**

```bash
cd /Users/elevenbeans/code/myprofile
git add js/state.js js/i18n.js js/theme.js js/overlays.js js/ux.js
git commit -m "refactor: add state, i18n, theme, overlays, ux modules"
```

---

## Task 2: Feature modules + entry, switch `index.html`, delete `script.js`

**Files:**
- Create: `js/terminal.js`
- Create: `js/agent.js`
- Create: `js/app.js`
- Modify: `index.html` (replace the `<script src="script.js">` line)
- Delete: `script.js`

- [ ] **Step 1: Create `js/terminal.js`**

Copy `script.js:437-465` (the `fileSystem` object) and `script.js:497-568` (the `termCmds` object) **verbatim** into the new file. Then use this module structure (imports + wrappers + init). The helper functions `resolveDir`, `listDir`, `termPrint`, `termPromptText`, `termPrompt` are copied verbatim from `script.js:468-495`; `processCommand` is copied from `script.js:570-589` with the one change shown; the input-history handler at the bottom is copied from `script.js:667-691`.

```js
import { open, close, register } from './overlays.js';

const termInput = document.getElementById('terminalInput');
const termOutput = document.getElementById('terminalOutput');
const terminal = document.getElementById('terminal');
let termHistory = [];
let histIdx = -1;

// --- paste fileSystem (script.js:437-465), currentDir, and helpers here ---
// --- paste termCmds (script.js:497-568) here ---

function processCommand(cmd) {
  termPrompt();
  const parts = cmd.trim().match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  const name = parts[0] && parts[0].toLowerCase();
  const args = parts.slice(1).map((s) => s.replace(/^"|"$/g, ''));
  if (!name) return;
  const agentCommands = ['codex', 'claude', 'opencode'];
  if (agentCommands.includes(name)) {
    close('terminal');
    document.dispatchEvent(new CustomEvent('request-agent', { detail: { source: name } }));
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
```

`currentDir` stays a module-level `let` copied from `script.js:466`.

- [ ] **Step 2: Create `js/agent.js`**

Copy `agentResponses` (`script.js:148-243`) and the functions `findAgentResponse` (`script.js:245-264`), `addAgentMsg` (`266-280`), `addAgentToolCall` (`282-306`), `showAgentThinking` (`308-319`), `simulateAgentResponse` (`321-354`), `escapeHtml` (`356-360`), `marked` (`362-381`), `addAgentWelcome` (`383-391`) verbatim. Use this header/footer and change `simulateAgentResponse`'s exit branch to call `closeAgent` (already does) and `openCodeAgent`/`closeCodeAgent` to use overlays:

```js
import { open, close, register } from './overlays.js';

const agentMessages = document.getElementById('agentMessages');
const agentInput = document.getElementById('agentInput');
const agentOverlay = document.getElementById('codeAgent');
const agentModelLabel = document.querySelector('.agent__header-model');
const agentClose = document.getElementById('agentClose');
let agentSource = 'opencode';
const agentModels = {
  opencode: 'deepseek-v4-flash-free',
  claude: 'claude-sonnet-4-20250514',
  codex: 'gpt-4o-2025-01-22',
};

// --- paste agentResponses, findAgentResponse, addAgentMsg, addAgentToolCall,
// --- showAgentThinking, simulateAgentResponse, escapeHtml, marked,
// --- addAgentWelcome here (verbatim from script.js ranges listed above) ---

export function openAgent(source) {
  if (!agentOverlay) return;
  if (source) agentSource = source;
  if (agentModelLabel) {
    agentModelLabel.textContent = agentSource + '/' + (agentModels[agentSource] || 'deepseek-v4-flash-free');
  }
  if (agentMessages.children.length === 0) {
    agentMessages.innerHTML = '';
    addAgentWelcome();
  }
  open('agent');
}

export function closeAgent() {
  close('agent');
}

export function initAgent() {
  if (!agentOverlay) return;
  register('agent', { el: agentOverlay, initialFocus: () => agentInput });
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
  if (agentClose) agentClose.addEventListener('click', closeAgent);
}
```

Important: in `simulateAgentResponse`, the existing exit branch calls `closeCodeAgent` (`script.js:325`). Rename it to `closeAgent`. `openCodeAgent` and `closeCodeAgent` (`script.js:393-411`) are replaced by the `openAgent`/`closeAgent` above, so delete those two from the pasted code.

- [ ] **Step 3: Create `js/app.js`**

```js
import { applyLang, getLang, toggleLang, t } from './i18n.js';
import { initTheme } from './theme.js';
import { initOverlays } from './overlays.js';
import { initTerminal, openTerminal } from './terminal.js';
import { initAgent, openAgent, closeAgent } from './agent.js';
import { initReveal, revealAll, initScrollProgress, initBackToTop } from './ux.js';

const timeline = document.querySelector('.timeline');
const expToggle = document.getElementById('expToggle');
const heroName = document.getElementById('heroName');

function initExpToggle() {
  if (!expToggle || !timeline) return;
  expToggle.addEventListener('click', () => {
    const expanded = timeline.classList.toggle('expanded');
    expToggle.textContent = t(expanded ? 'exp-toggle-less' : 'exp-toggle-more');
  });
  document.addEventListener('langchange', () => {
    if (timeline.classList.contains('expanded')) {
      expToggle.textContent = t('exp-toggle-less');
    }
  });
}

function initHints() {
  const termHint = document.getElementById('termHint');
  const agentHint = document.getElementById('agentHint');
  if (termHint) termHint.addEventListener('click', openTerminal);
  if (agentHint) agentHint.addEventListener('click', () => openAgent());
}

function initHeader() {
  const langToggle = document.getElementById('langToggle');
  if (langToggle) langToggle.addEventListener('click', toggleLang);
}

function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === 'Backquote') {
      e.preventDefault();
      if (document.getElementById('codeAgent')?.classList.contains('open')) closeAgent();
      else openAgent();
      return;
    }
    if (e.ctrlKey && e.code === 'Backquote' && !e.shiftKey) {
      e.preventDefault();
      openTerminal();
      return;
    }
    if (e.shiftKey && e.code === 'Semicolon' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      openTerminal();
    }
  });
}

function initAgentRequestBridge() {
  document.addEventListener('request-agent', (e) => {
    const source = e.detail && e.detail.source;
    window.setTimeout(() => openAgent(source), 260);
  });
}

function boot() {
  try {
    initTheme();
    initAgent();
    initTerminal();
    initOverlays();
    initExpToggle();
    initHints();
    initHeader();
    initShortcuts();
    initAgentRequestBridge();
    if (heroName) {
      heroName.addEventListener('dblclick', (e) => {
        e.preventDefault();
        openTerminal();
      });
    }
    applyLang(getLang());
    initReveal();
    initScrollProgress();
    initBackToTop();
  } catch (err) {
    console.error('[app] init failed', err);
    revealAll();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

window.addEventListener('error', () => {
  revealAll();
});
```

- [ ] **Step 4: Switch `index.html` to the module entry**

Replace `  <script src="script.js"></script>` (index.html:166) with:
```html
  <script type="module" src="js/app.js"></script>
```

- [ ] **Step 5: Delete the old script**

```bash
cd /Users/elevenbeans/code/myprofile
git rm script.js
```

- [ ] **Step 6: Syntax-check the three new modules**

```bash
cd /Users/elevenbeans/code/myprofile
for f in js/terminal.js js/agent.js js/app.js; do
  node --input-type=module --check < "$f" && echo "OK $f"
done
```
Expected: three `OK` lines.

- [ ] **Step 7: Verify behavior parity in the browser**

```bash
B="$HOME/.opencode/skills/gstack/browse/dist/browse"
(cd /Users/elevenbeans/code/myprofile && python3 -m http.server 8080 >/tmp/myprofile-serve.log 2>&1 &)
sleep 1
"$B" goto http://localhost:8080
"$B" console --errors
"$B" js "document.getElementById('themeToggle').click(); document.body.classList.contains('dark')"
"$B" js "document.getElementById('langToggle').click(); document.documentElement.lang"
"$B" js "document.getElementById('termHint').click(); document.getElementById('terminal').classList.contains('open')"
"$B" js "document.getElementById('agentHint').click(); document.getElementById('codeAgent').classList.contains('open')"
```
Expected: `console --errors` reports no errors; each `js` returns `true`/`true`/`true`/`true` (lang returns `zh` after the toggle, so assert `document.documentElement.lang` is `zh`). Then:
```bash
"$B" fill "#agentInput" "run tests"
"$B" press Enter
sleep 1
"$B" is visible ".agent__tool-call"
```
Expected: `true`. Stop the server: `pkill -f "http.server 8080"`

- [ ] **Step 8: Commit**

```bash
cd /Users/elevenbeans/code/myprofile
git add js/terminal.js js/agent.js js/app.js index.html
git commit -m "refactor: split script.js into ES modules"
```

---

## Task 3: CSS foundation — tokens, contrast, focus, sr-only, skip link, reveal, reduced motion

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add design tokens**

In `:root` (after `--max-w: 720px;`) add:
```css
  --accent-text: #8a5a2b;
  --blue-text: #0969da;
```

In `body.dark` (after `--card-bg: #1a1a1a;`) add:
```css
  --accent-text: #d4a373;
  --blue-text: #58a6ff;
```

- [ ] **Step 2: Apply contrast tokens to text**

Change these declarations:
- `.hero__title` color: `var(--accent)` -> `var(--accent-text)`
- `.timeline__meta` color: `var(--accent)` -> `var(--accent-text)`
- `.exp-toggle` color: `var(--accent)` -> `var(--accent-text)`
- `.term-hint__prompt` color: `var(--accent)` -> `var(--accent-text)`
- `.corner-controls button:hover` color: `var(--accent)` -> `var(--accent-text)`
- `.footer__links a:hover` color: `var(--accent)` -> `var(--accent-text)`
- `.agent-hint` color: keep `var(--text-muted)`; `.agent-hint:hover` color: `#58a6ff` -> `var(--blue-text)`
- `.agent-hint__prompt` color: `#58a6ff` -> `var(--blue-text)`

- [ ] **Step 3: Add generic focus, sr-only, skip-link, reveal rules**

Append near the existing `:focus-visible` rule:
```css
button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 300;
  background: var(--card-bg);
  color: var(--text);
  border: 1px solid var(--accent);
  border-radius: 6px;
  padding: 0.5rem 0.875rem;
  text-decoration: none;
  font-size: 0.9rem;
}
.skip-link:focus {
  left: 1rem;
  top: 1rem;
}

html.js .reveal {
  opacity: 0;
  transform: translateY(10px);
}
.reveal {
  transition: opacity 0.5s ease, transform 0.5s ease;
  transition-delay: var(--reveal-delay, 0ms);
}
.reveal.is-visible {
  opacity: 1;
  transform: none;
}
```

- [ ] **Step 4: Add reduced-motion block at the end of `styles.css`**

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  html.js .reveal { opacity: 1; transform: none; transition: none; }
  .term-hint__cursor,
  .agent-hint__cursor,
  .agent__thinking-dot,
  .agent__msg,
  .agent__tool-call { animation: none; }
  .terminal-overlay,
  .agent-overlay,
  .project-card,
  .project-card__arrow,
  .corner-controls button,
  .tag,
  .back-to-top { transition: none; }
}
```

- [ ] **Step 5: Verify CSS parses and fallback works**

```bash
B="$HOME/.opencode/skills/gstack/browse/dist/browse"
(cd /Users/elevenbeans/code/myprofile && python3 -m http.server 8080 >/tmp/myprofile-serve.log 2>&1 &)
sleep 1
"$B" goto http://localhost:8080
"$B" js "document.documentElement.classList.remove('js'); getComputedStyle(document.querySelector('.section')).opacity"
```
Expected: returns `1` (no-JS fallback: reveal targets stay visible when `js` class is absent). Re-add the class is unnecessary (fresh load each `goto`).
Stop the server: `pkill -f "http.server 8080"`

- [ ] **Step 6: Commit**

```bash
cd /Users/elevenbeans/code/myprofile
git add styles.css
git commit -m "style: add contrast tokens, focus, sr-only, skip-link, reveal, reduced-motion"
```

---

## Task 4: `index.html` — perf font loading, skip link, buttons, ARIA, new elements

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the `js` class and non-blocking font loading**

Replace the font `<link>` at index.html:16 with:
```html
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"></noscript>
```
Immediately after `<meta name="viewport" ...>` add:
```html
  <script>document.documentElement.classList.add('js');</script>
```

- [ ] **Step 2: Make the pre-paint theme script crash-safe**

Replace index.html:20 with:
```html
  <script>
    (function () {
      var stored = null;
      try { stored = localStorage.getItem('theme'); } catch (e) {}
      var dark = stored === 'dark' || (!stored && window.matchMedia && matchMedia('(prefers-color-scheme:dark)').matches);
      document.body.classList.toggle('dark', dark);
    })();
  </script>
```

- [ ] **Step 3: Add skip link and ARIA to header controls**

Immediately after the theme `<script>...</script>` and before `<div class="corner-controls">`, add:
```html
  <a class="skip-link" href="#main" data-i18n="skip-link">Skip to content</a>
```
Replace the two control buttons (index.html:22-23) with:
```html
    <button class="lang-toggle" id="langToggle" data-i18n="lang-toggle-label" data-i18n-aria="lang-label" aria-label="Switch language">中文</button>
    <button class="theme-toggle" id="themeToggle" aria-pressed="false" data-i18n-aria="theme-label-light" aria-label="Switch to dark mode">&#9790;</button>
```
Change `<main>` (index.html:25) to `<main id="main">`.
Add `reveal` to each section heading container: `<section class="section reveal" id="projects">`, and likewise for `#experience` and `#hobbies` (use `class="section reveal"` on all three).

- [ ] **Step 4: Convert hints to buttons and add new-tab labels**

Replace the hints block (index.html:121-128) with:
```html
    <div class="hints-row">
      <button type="button" class="term-hint" id="termHint" data-i18n-aria="hint-terminal" aria-label="Open terminal">
        <span class="term-hint__prompt">&gt;</span> terminal<span class="term-hint__cursor"></span>
      </button>
      <button type="button" class="agent-hint" id="agentHint" data-i18n-aria="hint-agent" aria-label="Open code agent">
        <span class="agent-hint__prompt">&gt;</span> code agent<span class="agent-hint__cursor"></span>
      </button>
    </div>
```

For each of the 5 project cards, change the arrow span to include `aria-hidden` and append a screen-reader-only new-tab note after it:
```html
          <span class="project-card__arrow" aria-hidden="true">&rarr;</span>
          <span class="sr-only" data-i18n="opens-new-tab">(opens in new tab)</span>
```

- [ ] **Step 5: Add `aria-hidden` to decorative timeline dots**

For all 5 occurrences of `<div class="timeline__dot"></div>`, change to `<div class="timeline__dot" aria-hidden="true"></div>`.

- [ ] **Step 6: Add live-region roles to overlays**

Terminal output (index.html:145):
```html
    <div class="terminal-output" id="terminalOutput" role="log" aria-live="polite" aria-label="Terminal output"></div>
```
Agent messages (index.html:159):
```html
      <div class="agent__messages" id="agentMessages" role="log" aria-live="polite" aria-label="Agent messages"></div>
```
Add `aria-hidden="true"` to `.terminal-overlay` and `.agent-overlay`. Add `data-i18n-aria="agent-close"` to `#agentClose` (keep its `aria-label`).

- [ ] **Step 7: Add scroll progress + back-to-top, confirm module tag**

Before `  <script type="module" src="js/app.js"></script>` add:
```html
  <div class="scroll-progress" aria-hidden="true"></div>
  <button type="button" class="back-to-top" aria-label="Back to top" data-i18n-aria="back-to-top">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>
  </button>
```

- [ ] **Step 8: Verify markup and behavior**

```bash
B="$HOME/.opencode/skills/gstack/browse/dist/browse"
(cd /Users/elevenbeans/code/myprofile && python3 -m http.server 8080 >/tmp/myprofile-serve.log 2>&1 &)
sleep 1
"$B" goto http://localhost:8080
"$B" console --errors
"$B" is enabled "#termHint"
"$B" is enabled "#agentHint"
"$B" js "document.querySelector('.skip-link').getAttribute('href')"
"$B" js "Array.from(document.querySelectorAll('[data-i18n-aria]')).every(function(el){return !!el.getAttribute('aria-label')})"
"$B" fill "#termInput" "ls"
"$B" press Enter
"$B" is visible ".terminal-output"
```
Expected: no console errors; both hints enabled (`true`); href `#main`; aria check `true`; terminal output visible.
Stop the server: `pkill -f "http.server 8080"`

- [ ] **Step 9: Commit**

```bash
cd /Users/elevenbeans/code/myprofile
git add index.html
git commit -m "feat: non-blocking fonts, skip link, button hints, a11y ARIA, progress/back-to-top markup"
```

---

## Task 5: CSS motion — overlay transitions, theme transition, micro-interactions

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Convert overlays from `display:none` to visibility transitions**

For `.terminal-overlay`, replace the final `flex-direction: column;` block ending and the `.terminal-overlay.open` rule. The base rule must end with:
```css
  display: flex;
  flex-direction: column;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.25s ease, visibility 0.25s ease;
}
.terminal-overlay.open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
```
(Delete the old `display: none;` from `.terminal-overlay` and the old `.terminal-overlay.open { display: flex; }`.)

For `.agent-overlay`, change its `display: none;` to `display: flex;`, then replace `.agent-overlay.open { display: flex; }` with:
```css
.agent-overlay.open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
```
and add to the `.agent-overlay` base rule:
```css
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.25s ease, visibility 0.25s ease;
```

- [ ] **Step 2: Add the theme-transition and micro-interaction rules**

Append:
```css
html.theme-transitioning body,
html.theme-transitioning .project-card,
html.theme-transitioning .tag,
html.theme-transitioning .corner-controls button,
html.theme-transitioning .exp-toggle,
html.theme-transitioning .timeline__dot,
html.theme-transitioning .footer,
html.theme-transitioning .back-to-top,
html.theme-transitioning .skip-link {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.project-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}
body.dark .project-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
}

.corner-controls button:active,
.tag:active,
.project-card:active {
  transform: translateY(1px);
}
```

- [ ] **Step 3: Add scroll progress + back-to-top styles**

Append:
```css
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: 0 50%;
  z-index: 200;
  pointer-events: none;
}

.back-to-top {
  position: fixed;
  right: calc(1.5rem + env(safe-area-inset-right, 0px));
  bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--card-bg);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
  transition: opacity 0.2s, visibility 0.2s, transform 0.2s, color 0.2s, border-color 0.2s;
  z-index: 150;
}
.back-to-top.visible {
  opacity: 1;
  visibility: visible;
  transform: none;
}
.back-to-top:hover {
  color: var(--accent-text);
  border-color: var(--accent);
}
```

- [ ] **Step 4: Verify transitions and theme switch**

```bash
B="$HOME/.opencode/skills/gstack/browse/dist/browse"
(cd /Users/elevenbeans/code/myprofile && python3 -m http.server 8080 >/tmp/myprofile-serve.log 2>&1 &)
sleep 1
"$B" goto http://localhost:8080
"$B" console --errors
"$B" js "getComputedStyle(document.getElementById('terminal')).visibility"
"$B" js "document.getElementById('termHint').click(); getComputedStyle(document.getElementById('terminal')).visibility"
"$B" js "document.documentElement.className.includes('theme-transitioning')"
"$B" js "document.getElementById('themeToggle').click(); document.documentElement.className.includes('theme-transitioning')"
"$B" js "window.scrollTo(0, document.body.scrollHeight); document.querySelector('.back-to-top').classList.contains('visible')"
```
Expected: no console errors; closed overlay `hidden`, open overlay `visible`; theme-transitioning `false` before click and `true` right after; back-to-top `true` after scrolling.
Stop the server: `pkill -f "http.server 8080"`

- [ ] **Step 5: Commit**

```bash
cd /Users/elevenbeans/code/myprofile
git add styles.css
git commit -m "style: overlay transitions, theme cross-fade, micro-interactions, progress/back-to-top"
```

---

## Task 6: CSS responsive — hints on mobile, fluid type, safe areas, content-visibility

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Show hints at all sizes**

In the base `.term-hint` rule change `display: none;` to `display: inline-flex;`. In the base `.agent-hint` rule change `display: none;` to `display: inline-flex;`. Delete the entire media block:
```css
@media (min-width: 601px) {
  .term-hint,
  .agent-hint {
    display: inline-flex;
  }
}
```

- [ ] **Step 2: Reset button chrome and enlarge touch targets**

Add to `.term-hint` and `.agent-hint` base rules: `background: none; border: 0; font: inherit;`. Add to both: `min-height: 44px;` and increase `.hints-row` gap to `0.25rem`.

- [ ] **Step 3: Fluid type**

Change `.hero__name` font-size to `clamp(2.5rem, 8vw, 4rem);` and `.section__title` font-size to `clamp(1.5rem, 4vw, 1.75rem);`. In the `@media (max-width: 600px)` block, remove the now-redundant `.hero__name { font-size: 2.5rem; }` and `.section__title { font-size: 1.5rem; }` declarations.

- [ ] **Step 4: Safe areas and overlays on small screens**

Add to `.corner-controls` base: `right: calc(1.5rem + env(safe-area-inset-right, 0px));`. In the `@media (max-width: 600px)` block add:
```css
  .terminal-overlay { padding: calc(1rem + env(safe-area-inset-top, 0px)) 1rem calc(1rem + env(safe-area-inset-bottom, 0px)); }
  .agent-overlay { padding: calc(0.75rem + env(safe-area-inset-top, 0px)) 0.75rem calc(0.75rem + env(safe-area-inset-bottom, 0px)); }
  .agent { height: 90vh; height: 90dvh; }
```

- [ ] **Step 5: Content-visibility for below-the-fold sections**

Append:
```css
#experience,
#hobbies,
.footer {
  content-visibility: auto;
  contain-intrinsic-size: auto 600px;
}
```

- [ ] **Step 6: Body safety**

Add to `body`: `overflow-x: hidden; -webkit-text-size-adjust: 100%; text-size-adjust: 100%;`.

- [ ] **Step 7: Verify responsive behavior**

```bash
B="$HOME/.opencode/skills/gstack/browse/dist/browse"
(cd /Users/elevenbeans/code/myprofile && python3 -m http.server 8080 >/tmp/myprofile-serve.log 2>&1 &)
sleep 1
"$B" viewport 360x800
"$B" goto http://localhost:8080
"$B" is visible "#termHint"
"$B" is visible "#agentHint"
"$B" js "document.documentElement.scrollWidth <= window.innerWidth"
"$B" js "document.getElementById('agentHint').click(); document.getElementById('codeAgent').classList.contains('open')"
"$B" screenshot /tmp/polish-360.png
```
Expected: both hints visible; no horizontal overflow (`true`); agent opens on tap; screenshot saved.
Stop the server: `pkill -f "http.server 8080"`

- [ ] **Step 8: Commit**

```bash
cd /Users/elevenbeans/code/myprofile
git add styles.css
git commit -m "style: mobile hints, fluid type, safe areas, content-visibility"
```

---

## Task 7: CSS print styles

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Append print stylesheet**

```css
@media print {
  .corner-controls,
  .hints-row,
  .terminal-overlay,
  .agent-overlay,
  .scroll-progress,
  .back-to-top,
  .skip-link {
    display: none !important;
  }
  body {
    background: #fff;
    color: #000;
  }
  .section,
  .project-card,
  .tag,
  .timeline__entry {
    opacity: 1 !important;
    transform: none !important;
  }
  .timeline__entry:nth-child(n+4) {
    display: block !important;
  }
  .project-card,
  .timeline__entry {
    break-inside: avoid;
  }
  .footer {
    border-top-color: #000;
  }
}
```

- [ ] **Step 2: Verify print output**

```bash
B="$HOME/.opencode/skills/gstack/browse/dist/browse"
(cd /Users/elevenbeans/code/myprofile && python3 -m http.server 8080 >/tmp/myprofile-serve.log 2>&1 &)
sleep 1
"$B" goto http://localhost:8080
"$B" pdf /tmp/myprofile-print.pdf --format a4
ls -l /tmp/myprofile-print.pdf
```
Expected: PDF created with non-zero size. Open it (Read tool) and confirm the corner controls, hints, and progress bar are absent and all 5 experience entries are present.
Stop the server: `pkill -f "http.server 8080"`

- [ ] **Step 3: Commit**

```bash
cd /Users/elevenbeans/code/myprofile
git add styles.css
git commit -m "style: print stylesheet"
```

---

## Task 8: README + final verification sweep

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README features**

Add under `## Features`:
```markdown
- Keyboard accessible (skip link, focus management, ARIA)
- Respects `prefers-reduced-motion`; works without JavaScript
```

- [ ] **Step 2: Full verification sweep**

```bash
B="$HOME/.opencode/skills/gstack/browse/dist/browse"
(cd /Users/elevenbeans/code/myprofile && python3 -m http.server 8080 >/tmp/myprofile-serve.log 2>&1 &)
sleep 1
"$B" goto http://localhost:8080
"$B" console --errors
"$B" responsive /tmp/polish
"$B" viewport 1280x720
"$B" goto http://localhost:8080
"$B" js "document.getElementById('langToggle').click(); document.querySelectorAll('[data-i18n-aria]').length > 0 && Array.from(document.querySelectorAll('[data-i18n-aria]')).every(function(el){return el.getAttribute('aria-label') !== 'Switch language'})"
"$B" js "var el=document.querySelector('.hero__title'); var c=getComputedStyle(el).color; c"
"$B" js "document.querySelector('.scroll-progress') && getComputedStyle(document.querySelector('.scroll-progress')).height"
```
Expected: no console errors; responsive screenshots saved; after language toggle every `data-i18n-aria` label changed away from the English default (`true`); computed `.hero__title` color is the darker accent (e.g. `rgb(138, 90, 43)` from `#8a5a2b`); progress bar height `2px`.
Stop the server: `pkill -f "http.server 8080"`

- [ ] **Step 3: Manual reduced-motion check** (cannot be automated — `Emulation.setEmulatedMedia` is CDP-denied)

In Chrome DevTools > Rendering > "Emulate CSS media feature prefers-reduced-motion: reduce", reload and confirm: no scroll-reveal animation, overlays appear instantly, theme toggle does not cross-fade, back-to-top jumps instantly, and the terminal cursor/agent thinking dots do not blink. Report result to the user.

- [ ] **Step 4: Commit**

```bash
cd /Users/elevenbeans/code/myprofile
git add README.md
git commit -m "docs: note accessibility and no-JS support"
```

---

## Self-Review

**Spec coverage:**
- A. Performance — Task 4 Steps 1-2 (fonts, `js` class, crash-safe pre-paint), Task 6 Step 5 (`content-visibility`), Task 2 (`defer` via module), Task 1 Step 1 (storage guard). Covered.
- B. Accessibility — Task 4 (skip link, buttons, ARIA, live regions), Task 3 (focus, sr-only, reduced-motion, contrast tokens), Task 1 (overlays focus trap). Covered.
- C. Motion — Task 5 (theme transition, overlay transitions, micro-interactions), Task 3 (reveal CSS), Task 1 Step 5 (reveal/scroll JS). Covered.
- D. Responsive — Task 6. Covered.
- E. Navigation — Task 5 Step 3 (progress/back-to-top CSS), Task 1 Step 5 (JS), Task 7 (print). Covered.
- F. Code organization — Tasks 1-2 (module split). Covered.
- G. Verification — harness + each task's verify step + Task 8. Covered.

**Placeholder scan:** No "TBD"/"handle edge cases". "Paste X verbatim from script.js ranges" is exact (the source file exists at execution time; Task 2 deletes it only in Step 5, after the modules are created in Steps 1-2).

**Type/interface consistency:** `open`/`close`/`register`/`initOverlays` names match between `overlays.js` and their callers (`terminal.js`, `agent.js`, `app.js`). `openTerminal`/`closeTerminal`/`initTerminal` and `openAgent`/`closeAgent`/`initAgent` are consistent. `request-agent` event detail key is `source` in both dispatcher (`terminal.js`) and bridge (`app.js`). `storage`, `getLastFocused`, `setLastFocused`, `t`, `getLang`, `applyLang`, `toggleLang`, `prefersReducedMotion`, `revealAll`, `initReveal`, `initScrollProgress`, `initBackToTop` names are consistent across definition and import sites.

**Known limitation:** reduced-motion browser emulation is CDP-denied, so Step 3 of Task 8 is a required manual check.

## Out of Scope
- No content/copy changes beyond the new a11y strings.
- No redesign, palette overhaul, or font change.
- No terminal/agent behavior changes (refactor for parity only).
- No analytics, service worker, PWA, or build tooling.
- No self-hosted fonts.
