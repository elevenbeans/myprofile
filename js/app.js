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
      return;
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
