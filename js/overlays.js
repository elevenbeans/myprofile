import { getLastFocused, setLastFocused } from './state.js?v=1';

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
  if (target && target.focus) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => target.focus());
    });
  }
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
