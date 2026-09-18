# elevenbeans.me

Personal profile page. Vanilla HTML/CSS/JS with native ES modules — no framework, no build step, no runtime dependencies.

## Features

- Work timeline, project showcase, and interests
- Dark/light theme with system preference detection (no first-paint flash)
- i18n (EN / 中文)
- Hidden retro terminal (double-click the name, `Ctrl+\``, or the hints row)
- Hidden AI assistant (`ai` in the terminal, the hint button, or `Ctrl+Shift+\``) — streams real replies from the NAS `profile-chat` endpoint, grounded in the projects' own docs, with localStorage memory and offline easter-egg commands
- Keyboard accessible (skip link, focus management, ARIA, live regions)
- Respects `prefers-reduced-motion`; core content works without JavaScript
- Non-blocking font loading, scroll reveal, scroll progress, back-to-top, print styles

## Structure

- `index.html` — markup; i18n via `data-i18n` / `data-i18n-aria` / `data-i18n-placeholder`
- `styles.css` — styling, themes, reduced-motion and print rules
- `js/` — ES modules: `app.js` (entry) plus `state`, `i18n`, `theme`, `overlays`, `ux`, `terminal`, `assistant`, `assistant-commands`
- `tests/assistant-commands.test.js` — zero-dependency Node tests for the local command layer

## Local development

ES modules need an HTTP origin, so serve the folder:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

The assistant calls the NAS endpoint. On `localhost` it uses `http://localhost:3001/api/profile-chat` (the NAS portal dev server); everywhere else it uses `https://nas.elevenbeans.me/api/profile-chat`. If the endpoint is unreachable, the offline easter-egg commands still work.

## Tests

```bash
npm test        # runs tests/assistant-commands.test.js
```

## Asset versioning

`styles.css` and `js/*.js` are loaded with a `?v=N` query string because GitHub Pages caches them for 4 hours. After changing CSS or JS, bump `v` in `index.html` and in the `from './…js?v=N'` imports so returning visitors get the new files.

## Deploy

Push to `main` — GitHub Pages auto-deploys to elevenbeans.me.

## Related

- NAS portal + assistant: https://nas.elevenbeans.me
- Blog: https://blog.elevenbeans.me
