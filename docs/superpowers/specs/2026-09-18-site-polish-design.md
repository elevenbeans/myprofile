# elevenbeans.me — Site-wide Polish (Perf / A11y / Motion / Responsive / Navigation) Design Spec

## Overview

A one-shot, site-wide quality pass over the existing personal profile page covering five areas:

1. Load performance
2. Accessibility
3. Motion & interaction feel
4. Mobile / responsive behavior
5. Navigation & convenience

This is **not** a redesign. All visible content, copy, layout intent, and the hidden terminal / code-agent easter eggs stay. The work is polish plus targeted bug fixes.

## Constraints (locked)

- **Zero dependencies, no build step.** No third-party libraries, no bundler, no minifier, no font subsetting.
- Fonts continue to load from Google Fonts (no self-hosting).
- Deploy target unchanged: push to `main` → GitHub Pages.
- File set stays static: `index.html`, `styles.css`, `js/*.js`.

## Decisions (locked with user)

- **One-shot delivery** — all five areas in a single change set.
- **F1 code organization** — split `script.js` into native ES modules (`<script type="module">`), still zero-dep/no-build.
- **Accent text contrast accepted** — light mode accent *text* darkens to satisfy WCAG AA; borders/arrows keep the original accent. This is a visible design change in light mode only.

---

## A. Load Performance

### Requirements
- The Google Fonts stylesheet must not block first render.
- Below-the-fold sections must not cost layout/paint work until scrolled near.
- JS must not block HTML parsing.
- Theme preference must be read before first paint (no flash), and reading it must be crash-safe.

### Changes
1. **Non-blocking font load.** Replace the plain stylesheet link with:
   ```html
   <link rel="preload" as="style"
         href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
   <link rel="stylesheet"
         href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
         media="print" onload="this.media='all'">
   <noscript>
     <link rel="stylesheet"
           href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
   </noscript>
   ```
   Keep existing `preconnect` hints (incl. `crossorigin` for gstatic). `&display=swap` stays.
2. **Font weights unchanged** (400/500/600/700) — no visual change.
3. **`content-visibility: auto`** on `#experience`, `#hobbies`, and `.footer`, with `contain-intrinsic-size` set to a conservative estimate to prevent scrollbar jumping.
   - Must **not** be applied to `#projects` (likely in initial viewport) or to any scroll-reveal target in a way that breaks `IntersectionObserver` observation. Reveal observation is done on children, not the `content-visibility` box.
4. **`defer` on the module entry** — modules are deferred by default; keep a single `<script type="module" src="js/app.js">`. Remove the old `<script src="script.js">`.
5. **localStorage guard.** All storage reads/writes go through a `storage` helper (in `js/state.js`) that wraps `localStorage` in try/catch and falls back to an in-memory map on failure (Safari private mode throws).
6. **Keep the inline pre-paint theme script** in `<body>` start; rewrite it to call the same storage fallback logic inline (small, self-contained). Add `document.documentElement.classList.add('js')` here so reveal-hiding styles only activate when JS is running.

### Acceptance
- Lighthouse (mobile) render-blocking-requests issue resolved for the font; no layout shift from font swap beyond existing behavior.
- No scrollbar jump when scrolling past `content-visibility` sections.
- Site still renders and is fully usable with JS disabled.

---

## B. Accessibility

### Requirements
- All interactive controls operable by keyboard.
- No WCAG AA contrast failures on text.
- Modals announced and focus-managed.
- Motion respects `prefers-reduced-motion`.

### Changes
1. **Hints become real buttons.** `#termHint` and `#agentHint` change from `div[role=button][tabindex=0]` to `<button type="button">`. This fixes the current bug where Enter/Space do nothing. Styling is reset for button usage.
2. **Skip link.** Add `<a class="skip-link" href="#main">Skip to content</a>` as the first focusable element; add `id="main"` to `<main>`. `.skip-link` is visually hidden until focused.
3. **ARIA wiring.**
   - Theme toggle: `aria-pressed` mirrors dark state; `aria-label` is dynamic and localized.
   - Language toggle: `aria-label` localized.
   - Timeline `.timeline__dot` and project-card `.project-card__arrow`: `aria-hidden="true"`.
   - External project links: append `<span class="sr-only">(opens in new tab)</span>` (localized).
4. **Live regions.**
   - Terminal output: `role="log" aria-live="polite"`.
   - Agent messages container: `role="log" aria-live="polite"`. Tool-call nodes are appended within the live region; keep messages terse enough that announcements stay useful.
5. **Contrast fix.** Add `--accent-text`:
   - Light: `#8a5a2b` (≥4.5:1 on `#f5f5f5`).
   - Dark: reuse `#d4a373`.
   Apply `--accent-text` to text usages: `.hero__title`, `.timeline__meta`, `.exp-toggle`, hint labels, footer link hover. Borders, arrows, dots keep `--accent`.
6. **Reduced motion.** A global `@media (prefers-reduced-motion: reduce)` block disables `blink`, `agentFadeIn`, `thinkDot`, scroll-reveal transforms, overlay transitions, and smooth scrolling. JS exposes `prefersReducedMotion()` (in `js/ux.js`) for behavior branches.
7. **Generic focus style.** Add `button:focus-visible` alongside the existing `a:focus-visible` rule.
8. **Localize all new strings** (labels, skip link, opens-in-new-tab) via both `data-i18n` and the i18n dictionary.

### Acceptance
- Tab through the page: every control reachable, visible focus ring, hints activatable with Enter/Space.
- Axe/Lighthouse a11y audit shows no contrast or keyboard violations.
- With reduced motion on, only cursor-style blinking and smooth-scroll are suppressed appropriately; nothing animates.

---

## C. Motion & Interaction Feel

### Requirements
- Transitions feel smooth but never fire on initial page load.
- Scroll reveal is progressive-enhancement safe (content visible without JS).
- All effects degrade under reduced motion.

### Changes
1. **Theme transition.** On toggle, add `html.theme-transitioning`; after ~300ms (or `transitionend` with timeout fallback) remove it. The class enables color transitions on `body`, cards, tags, borders, and buttons. Never applied on load.
2. **Scroll reveal.** `IntersectionObserver` (threshold ~0.12, rootMargin bottom negative) toggles `.is-visible` on `.section`, `.project-card`, `.timeline__entry`, `.tag`. Hidden state is scoped to `html.js .reveal { opacity: 0; transform: translateY(10px) }`, so no-JS/failed-JS keeps everything visible. Stagger via `--reveal-delay` per index, capped (~120ms max).
   - Fallback: if `IntersectionObserver` is unavailable, add `.is-visible` to all targets immediately.
   - Safety: if module init throws, a window `error` listener (or try/catch in `app.js`) removes reveal-hiding (reveal-all).
3. **Overlay transitions.** Terminal and agent overlays switch from `display:none ↔ flex` to always-mounted `opacity/visibility/transform` transitions. Closed state: `opacity:0; visibility:hidden; pointer-events:none`. `.open`: `opacity:1; visibility:visible`. `aria-hidden` toggles in sync. `prefers-reduced-motion` makes it instant.
4. **Micro-interactions.** Project card hover gains a soft shadow plus existing lift; buttons gain `:active` scale/opacity feedback. Existing arrow and cursor animations stay.
5. **Hero entrance** (optional, low-risk): subtle fade-up on load, suppressed under reduced motion.

### Acceptance
- No transition flicker on first paint.
- Scrolling reveals sections once; re-scrolling does not re-trigger.
- Opening/closing terminal and agent animates smoothly; focus behavior unchanged.

---

## D. Mobile / Responsive

### Requirements
- Terminal and agent reachable on touch devices.
- Touch targets ≥ 44px.
- No horizontal overflow; safe-area aware.

### Changes
1. **Discoverability bug fix.** Remove the `display:none`-below-601px rule for `.term-hint`/`.agent-hint`; show a compact hints row at all sizes. Touch users can now open both easter eggs. (Keyboard shortcuts remain desktop-only extras.)
2. **Touch targets.** Hint buttons and corner controls get ≥44px effective hit area on small screens.
3. **Safe areas.** Corner controls, overlays, and back-to-top use `env(safe-area-inset-*)`.
4. **Fluid type.** `.hero__name` and `.section__title` use `clamp()` instead of hard breakpoint jumps. Keep existing `@media (max-width:600px)` for spacing.
5. **Overlay padding** reduced on small screens; agent panel height respects `dvh`.
6. `text-size-adjust: 100%`; guard against horizontal overflow (`overflow-x: hidden` on `body` as a safety net).

### Acceptance
- At 360px width: both easter eggs open via tap; nothing overflows horizontally; controls clear of notch/home indicator.
- At 768px and 1280px: layout unchanged from intent.

---

## E. Navigation & Convenience

### Changes
1. **Scroll progress bar.** Fixed 2px accent bar at top, width driven by `scrollTop / (scrollHeight - clientHeight)`, updated via a `requestAnimationFrame`-throttled scroll listener. No CSS transition under reduced motion.
2. **Back-to-top button.** Fixed bottom-right; hidden until scrolled past ~1.5 viewports; smooth scroll (instant under reduced motion); labelled and keyboard accessible; safe-area aware.
3. **Smooth scrolling.** `html { scroll-behavior: smooth }` with reduced-motion override; used by skip link and back-to-top.
4. **Print stylesheet.** `@media print`: hide corner controls, hints, overlays, progress bar, back-to-top; expand collapsed `.timeline__entry` on mobile breakpoints; black-on-white; avoid page breaks inside timeline entries.

### Acceptance
- Progress bar tracks scroll accurately with no jank.
- Back-to-top appears/hides correctly and returns to top.
- Print preview is clean and includes all experience entries.

---

## F. Code Organization (F1 — ES Modules)

### Requirements
- Native ES modules, no bundler. Shared state isolated; modules single-purpose; initialization wired in one entry.

### Structure
```
js/
  state.js      storage helpers (crash-safe), shared UI state (last-focused, open overlay)
  theme.js      theme apply/toggle, transition class, aria-pressed (localized labels via i18n)
  i18n.js       dictionary, applyLang, current lang, langchange event
  overlays.js   open/close, focus trap, body scroll lock, escape handling, aria-hidden
  terminal.js   filesystem, commands, history, rendering
  agent.js      simulated responses, markdown, tool-call rendering
  ux.js         reduced-motion helper, scroll progress, back-to-top, scroll reveal
app.js          feature-detect + init all modules, global error safety net
```

### Interfaces / data flow
- `state.js`: `storage.get(key, fallback)` / `storage.set(key, value)`; `getLastFocused()` / `setLastFocused(el)`.
- `i18n.js`: `t(key)`, `applyLang(lang)`, `getLang()`, dispatches `langchange` on `document`. Modules subscribe to refresh their localized labels (theme button label, exp toggle text).
- `overlays.js`: `register(name, { el, onOpen, onClose })`, `open(name)`, `close(name)`, `isOpen(name)`. Opening a second overlay closes the first without double-restoring focus. Manages body `overflow` lock and the shared focus trap / Escape / Tab handling currently in the global keydown listener.
- `terminal.js` / `agent.js`: self-contained; use `overlays` and `state`; expose `init()`.
- `ux.js`: `prefersReducedMotion()`, `initReveal()`, `initScrollProgress()`, `initBackToTop()`.
- `app.js`: adds nothing to `html.js` (already set inline), initializes modules inside try/catch, wires global keyboard shortcuts (Ctrl+`, Ctrl+Shift+`, Shift+;), and owns the reveal-all safety net.

### Error handling
- Storage failures degrade silently to memory.
- Missing `IntersectionObserver` → reveal all.
- Any init exception → catch, log, and ensure no content stays hidden (remove `.reveal` hiding / add `.is-visible`).
- Overlay functions are no-ops if their DOM node is missing.

### Migration note
The old `script.js` is deleted once parity is reached. No inline event handlers exist today, so no HTML on* attributes need removal.

---

## G. Verification

No test framework exists and none will be added (zero-dep constraint). Verification is manual, evidence-based, via the gstack `browse` tool plus local static server.

### Checklist
- Viewports: 360 / 768 / 1280.
- Themes: light, dark, and first-load with system dark preference (no flash).
- Languages: EN and 中文 (all new strings translated; no untranslated aria-labels).
- Reduced motion emulated: no reveal/overlay/theme transitions, no back-to-top smooth scroll; blink/thinking suppressed.
- Keyboard-only pass: skip link, all controls reachable with visible focus, hints via Enter/Space, overlays trap focus and restore on Escape.
- Console: zero errors/warnings.
- No horizontal overflow at 360px.
- JS-disabled render: full content visible, site usable.
- Print preview: controls hidden, all experience entries present.
- Lighthouse runs (mobile + desktop) before/after; no regression in Best Practices/SEO, a11y improved.

### Ship
- Local verification first, then normal push to `main` (GitHub Pages auto-deploy).

## Out of Scope
- No content/copy changes beyond new a11y strings.
- No visual redesign, palette overhaul, or font change.
- No new features for the terminal or agent (behavior parity; internal refactor only).
- No analytics, service worker, PWA, or build tooling.
- No self-hosted fonts.
