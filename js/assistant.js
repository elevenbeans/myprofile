import { open, close, register } from './overlays.js';
import { resolveLocalCommand } from './assistant-commands.js';
import { storage } from './state.js';
import { t, getLang } from './i18n.js';

const assistantMessages = document.getElementById('assistantMessages');
const assistantInput = document.getElementById('assistantInput');
const assistantOverlay = document.getElementById('assistant');
const assistantModelLabel = document.querySelector('.assistant__header-model');
const assistantSessionLabel = document.querySelector('.assistant__header-session');
const assistantClose = document.getElementById('assistantClose');
const assistantStatus = document.getElementById('assistantStatus');

const MEMORY_KEY = 'assistant.memory.v1';
const MAX_HISTORY = 50;
const STREAM_TIMEOUT_MS = 90000;
const MODEL_LABEL = 'elevenbeans \u00B7 qwen3:4b (local)';
const CHAT_ENDPOINT =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'http://localhost:3001/api/profile-chat'
    : 'https://nas.elevenbeans.me/api/profile-chat';

const CJK_RE = /[\u3400-\u9FFF]/;
const EN_NAME_RE = /(?:my name is|call me)\s+([A-Za-z\u4e00-\u9fff][\w\u4e00-\u9fff .-]{0,40})/i;
const ZH_NAME_RE = /我叫([\u4e00-\u9fff\w]{1,20})/;
const OFFLINE_MARKER = '[\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528]';
const PREF_ZH = 'prefers \u4E2D\u6587';
const PREF_EN = 'prefers English';

function defaultMemory() {
  const now = Date.now();
  return { v: 1, history: [], name: null, prefs: [], firstSeen: now, lastSeen: now, visits: 0 };
}

function loadMemory() {
  try {
    const raw = storage.get(MEMORY_KEY, null);
    if (!raw) return defaultMemory();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== 1) return defaultMemory();
    const history = Array.isArray(parsed.history)
      ? parsed.history
          .filter(
            (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
          )
          .slice(-MAX_HISTORY)
      : [];
    return {
      v: 1,
      history,
      name: typeof parsed.name === 'string' ? parsed.name : null,
      prefs: Array.isArray(parsed.prefs)
        ? parsed.prefs.filter((p) => typeof p === 'string').slice(0, 6)
        : [],
      firstSeen: typeof parsed.firstSeen === 'number' ? parsed.firstSeen : Date.now(),
      lastSeen: typeof parsed.lastSeen === 'number' ? parsed.lastSeen : Date.now(),
      visits: typeof parsed.visits === 'number' ? parsed.visits : 0,
    };
  } catch (err) {
    return defaultMemory();
  }
}

let memory = loadMemory();
const streamState = { active: false, controller: null };
let visitCounted = false;
let greetedThisSession = false;

function saveMemory() {
  memory.lastSeen = Date.now();
  try {
    storage.set(MEMORY_KEY, JSON.stringify(memory));
  } catch (err) {}
}

function clearStoredMemory() {
  storage.remove(MEMORY_KEY);
}

function capHistory() {
  if (memory.history.length > MAX_HISTORY) {
    memory.history = memory.history.slice(-MAX_HISTORY);
  }
}

function buildProfile() {
  const profile = {};
  if (memory.name) profile.name = memory.name;
  if (memory.prefs.length) profile.prefs = memory.prefs.slice(0, 6);
  return Object.keys(profile).length ? profile : undefined;
}

function detectLocale(input) {
  if (!input) return getLang();
  return CJK_RE.test(input) ? 'zh' : 'en';
}

function captureName(input) {
  let name = null;
  const en = input.match(EN_NAME_RE);
  if (en) {
    name = en[1];
  } else {
    const zh = input.match(ZH_NAME_RE);
    if (zh) name = zh[1];
  }
  if (!name) return;
  name = name.trim().replace(/[.,!?;:\u3002\uFF0C\uFF01\uFF1F]+$/, '').trim();
  if (name) memory.name = name.slice(0, 60);
}

function rememberPrefs(locale) {
  const pref = locale === 'zh' ? PREF_ZH : PREF_EN;
  const other = locale === 'zh' ? PREF_EN : PREF_ZH;
  memory.prefs = Array.from(new Set([...memory.prefs.filter((p) => p !== other), pref])).slice(-6);
}

function scrollMessages() {
  if (assistantMessages) assistantMessages.scrollTop = assistantMessages.scrollHeight;
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

function addAssistantMsg(type, content, cls) {
  const div = document.createElement('div');
  div.className = 'assistant__msg';
  const header = document.createElement('div');
  header.className = 'assistant__msg-header ' + (type === 'user' ? 'u' : 'a');
  header.textContent = type === 'user' ? t('assistant-role-user') : t('assistant-role-assistant');
  div.appendChild(header);
  const body = document.createElement('div');
  body.className = 'assistant__msg-body' + (cls ? ' ' + cls : '');
  body.innerHTML = content;
  div.appendChild(body);
  assistantMessages.appendChild(div);
  scrollMessages();
  return { div, body };
}

function renderStreaming(body, text) {
  body.innerHTML = marked(text) + '<span class="assistant__cursor"></span>';
  scrollMessages();
}

function renderError(body, message) {
  body.textContent = message;
  body.classList.add('assistant__msg-error');
  scrollMessages();
  announce(message);
}

function addAssistantToolCall(tool) {
  const tc = document.createElement('div');
  tc.className = 'assistant__tool-call';
  const hdr = document.createElement('div');
  hdr.className = 'assistant__tool-header ' + tool.type;
  const icons = { bash: '\u25CB', edit: '\u270E', read: '\u25C1' };
  hdr.innerHTML =
    '<span class="assistant__tool-icon">' +
    (icons[tool.type] || '\u25CB') +
    '</span>' +
    '<span class="assistant__tool-title">' +
    (tool.title || ({ bash: 'Run bash', edit: 'Edit file', read: 'Read file' }[tool.type] || 'Tool')) +
    '</span>' +
    '<span class="assistant__tool-arrow">\u2193</span>';
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
  scrollMessages();
}

function showAssistantThinking() {
  const div = document.createElement('div');
  div.className = 'assistant__thinking';
  div.id = 'assistantThinking';
  div.textContent = t('assistant-thinking');
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    dot.className = 'assistant__thinking-dot';
    dot.textContent = '.';
    div.appendChild(dot);
  }
  assistantMessages.appendChild(div);
  scrollMessages();
  return div;
}

function addWelcomeMessage(key) {
  addAssistantMsg('assistant', marked(t(key)));
  const last = assistantMessages.lastElementChild;
  if (last) last.classList.add('assistant__welcome');
}

function addAssistantWelcome() {
  addWelcomeMessage('assistant-welcome');
}

function addAssistantWelcomeBack() {
  addWelcomeMessage('assistant-welcome-back');
}

function renderHistory() {
  memory.history.forEach((m) => {
    if (m.role === 'user') addAssistantMsg('user', escapeHtml(m.content));
    else addAssistantMsg('assistant', marked(m.content));
  });
}

function setStreaming(active) {
  streamState.active = active;
  if (assistantInput) assistantInput.disabled = active;
  if (assistantMessages) {
    assistantMessages.setAttribute('aria-busy', active ? 'true' : 'false');
  }
}

function announce(text) {
  if (assistantStatus) assistantStatus.textContent = text;
}

function updateSessionLabel() {
  if (assistantSessionLabel) {
    assistantSessionLabel.textContent = t('assistant-session') + ' #' + Math.max(1, memory.visits || 1);
  }
}

function abortStreaming() {
  const controller = streamState.controller;
  if (controller) {
    try {
      controller.abort();
    } catch (err) {}
  }
}

async function runBackendReply(locale) {
  const { div, body } = addAssistantMsg('assistant', '');
  const thinking = showAssistantThinking();
  setStreaming(true);

  let full = '';
  let started = false;
  let finalReply = '';
  let timedOut = false;
  let timeoutId = 0;
  const outbound = memory.history.map((m) => ({ role: m.role, content: m.content }));

  try {
    const controller = new AbortController();
    streamState.controller = controller;
    timeoutId = window.setTimeout(() => {
      timedOut = true;
      try {
        controller.abort();
      } catch (err) {}
    }, STREAM_TIMEOUT_MS);

    const res = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: outbound, locale, profile: buildProfile() }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = new Error('HTTP ' + res.status);
      err.status = res.status;
      throw err;
    }

    if (!res.body || typeof res.body.getReader !== 'function') {
      full = await res.text();
      if (!started) {
        thinking.remove();
        started = true;
      }
      renderStreaming(body, full);
    } else {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        if (!started) {
          thinking.remove();
          started = true;
        }
        renderStreaming(body, full);
      }
      full += decoder.decode();
    }

    if (!started) {
      thinking.remove();
      started = true;
    }

    const trimmed = full.trim();
    if (!trimmed || trimmed === OFFLINE_MARKER || trimmed.includes(OFFLINE_MARKER)) {
      renderError(body, t('assistant-offline'));
    } else {
      body.innerHTML = marked(full);
      scrollMessages();
      if (trimmed) {
        finalReply = trimmed;
        memory.history.push({ role: 'assistant', content: trimmed });
        capHistory();
        saveMemory();
      }
    }
  } catch (err) {
    thinking.remove();
    if (err && err.name === 'AbortError') {
      if (timedOut) {
        renderError(body, t('assistant-offline'));
      } else if (started) {
        body.innerHTML = marked(full);
      } else {
        div.remove();
      }
    } else {
      renderError(body, t('assistant-error'));
    }
  } finally {
    window.clearTimeout(timeoutId);
    thinking.remove();
    setStreaming(false);
    streamState.controller = null;
    scrollMessages();
    if (finalReply) announce(finalReply);
  }
}

function submitAssistantInput(raw) {
  const input = raw.trim();
  if (!input || streamState.active) return;
  if (assistantInput) assistantInput.value = '';
  addAssistantMsg('user', escapeHtml(input));

  const locale = detectLocale(input);
  const command = resolveLocalCommand(input, locale);

  if (command && command.type === 'close') {
    closeAssistant();
    return;
  }
  if (command && command.type === 'clear') {
    abortStreaming();
    if (assistantMessages) assistantMessages.innerHTML = '';
    return;
  }
  if (command && command.type === 'forget') {
    handleForget();
    return;
  }

  captureName(input);
  rememberPrefs(locale);
  memory.history.push({ role: 'user', content: input });
  capHistory();
  saveMemory();

  if (command && command.type === 'reply') {
    addAssistantMsg('assistant', marked(command.text));
    if (Array.isArray(command.tools)) command.tools.forEach((tool) => addAssistantToolCall(tool));
    if (command.followup) {
      window.setTimeout(() => addAssistantToolCall(command.followup), 450);
    }
    memory.history.push({ role: 'assistant', content: command.text });
    capHistory();
    saveMemory();
    return;
  }

  runBackendReply(locale);
}

function handleForget() {
  abortStreaming();
  clearStoredMemory();
  memory = defaultMemory();
  greetedThisSession = false;
  if (assistantMessages) assistantMessages.innerHTML = '';
  addAssistantMsg('assistant', marked(t('assistant-forgotten')));
}

export function openAssistant(source) {
  if (!assistantOverlay) return;
  if (assistantModelLabel) assistantModelLabel.textContent = MODEL_LABEL;
  if (assistantMessages.children.length === 0) {
    assistantMessages.innerHTML = '';
    if (memory.history.length > 0) {
      if (!greetedThisSession) {
        addAssistantWelcomeBack();
        greetedThisSession = true;
      }
      renderHistory();
    } else {
      addAssistantWelcome();
      greetedThisSession = true;
    }
  }
  open('assistant');
}

export function closeAssistant() {
  abortStreaming();
  close('assistant');
}

export function initAssistant() {
  if (!assistantOverlay) return;
  memory = loadMemory();
  if (!visitCounted) {
    memory.visits = (memory.visits || 0) + 1;
    visitCounted = true;
    saveMemory();
  }
  if (assistantModelLabel) assistantModelLabel.textContent = MODEL_LABEL;
  updateSessionLabel();
  document.addEventListener('langchange', updateSessionLabel);
  register('assistant', {
    el: assistantOverlay,
    initialFocus: () => assistantInput,
    onClose: abortStreaming,
  });
  if (assistantInput) {
    assistantInput.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      if (e.isComposing || e.keyCode === 229) return;
      if (streamState.active) return;
      const val = assistantInput.value.trim();
      if (!val) return;
      submitAssistantInput(val);
    });
  }
  if (assistantClose) assistantClose.addEventListener('click', closeAssistant);
}
