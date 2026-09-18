import { applyLang, getLang, toggleLang, t } from './i18n.js';
import { initTheme } from './theme.js';
import { initOverlays, isOpen } from './overlays.js';
import { initTerminal, openTerminal } from './terminal.js';
import { initAssistant, openAssistant, closeAssistant } from './assistant.js';
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
  const assistantHint = document.getElementById('assistantHint');
  if (termHint) termHint.addEventListener('click', openTerminal);
  if (assistantHint) assistantHint.addEventListener('click', () => openAssistant());
}

function initHeader() {
  const langToggle = document.getElementById('langToggle');
  if (langToggle) langToggle.addEventListener('click', toggleLang);
}

function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === 'Backquote') {
      e.preventDefault();
      if (document.getElementById('assistant')?.classList.contains('open')) closeAssistant();
      else openAssistant();
      return;
    }
    if (e.ctrlKey && e.code === 'Backquote' && !e.shiftKey) {
      e.preventDefault();
      openTerminal();
      return;
    }
    if (e.shiftKey && e.code === 'Semicolon' && !e.ctrlKey && !e.metaKey) {
      if (isOpen('terminal') || isOpen('assistant')) return;
      e.preventDefault();
      openTerminal();
      return;
    }
  });
}

function initAssistantRequestBridge() {
  document.addEventListener('request-assistant', (e) => {
    const source = e.detail && e.detail.source;
    window.setTimeout(() => openAssistant(source), 260);
  });
}

function boot() {
  try {
    initTheme();
    initAssistant();
    initTerminal();
    initOverlays();
    initExpToggle();
    initHints();
    initHeader();
    initShortcuts();
    initAssistantRequestBridge();
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
    window.__appReady = true;
  } catch (err) {
    console.error('[app] init failed', err);
    revealAll();
    window.__appReady = true;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

window.addEventListener('error', () => {
  revealAll();
  window.__appReady = true;
});
