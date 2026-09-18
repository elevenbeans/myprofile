import { storage } from './state.js?v=3';
import { t } from './i18n.js?v=3';

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

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function withTransition(fn) {
  if (prefersReducedMotion()) {
    fn();
    return;
  }
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
