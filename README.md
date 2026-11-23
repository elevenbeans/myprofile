# elevenbeans.me

Personal profile page. Vanilla HTML/CSS/JS with native ES modules — no framework, no build step, no runtime dependencies.

## Features

- Work timeline, project showcase, and interests, including [Earth Online](https://elevenbeans.me/earth-online/) — an interactive 3D Earth with 46 cities, live weather and shared scores
- Dark/light theme with system preference detection (no first-paint flash)
- i18n (EN / 中文)
- Hidden retro terminal (double-click the name, `Ctrl+\``, or the hints row)
- Hidden AI assistant (`ai` in the terminal, the hint button, or `Ctrl+Shift+\``) — streams real replies from the NAS `profile-chat` endpoint, grounded in the projects' own docs, with localStorage memory and offline easter-egg commands. The endpoint negotiates an NDJSON event stream (`text` / `tool_call` / `tool_result` / `done`), so real `get_project_doc` executions render as tool cards instead of being invisible prompt injection; the client falls back to plain text when events are unavailable
- The API allowlists `*.elevenbeans.me` origins, so in-app browsers (e.g. WeChat) are blocked; the assistant shows a "use a standard browser" hint and the offline commands still work
- Keyboard accessible (skip link, focus management, ARIA, live regions)
- Respects `prefers-reduced-motion`; core content works without JavaScript
- Non-blocking font loading, scroll reveal, scroll progress, back-to-top, print styles

## Structure

- `index.html` — markup; i18n via `data-i18n` / `data-i18n-aria` / `data-i18n-placeholder`
- `styles.css` — styling, themes, reduced-motion and print rules
- `js/` — ES modules: `app.js` (entry) plus `state`, `i18n`, `theme`, `overlays`, `ux`, `terminal`, `assistant`, `assistant-events`, `assistant-commands`, `embedded-browser`
- `earth-online/` — standalone interactive 3D Earth (46 cities, live weather, shared scores, MapLibre/OSM Orbital Blueprint city views); served at `/earth-online/` with no build step
- `tests/assistant-commands.test.js` — zero-dependency Node tests for the local command layer
- `tests/assistant-events.test.js` — zero-dependency Node tests for the NDJSON event parser (chunk splits, malformed lines, flush)
- `tests/embedded-browser.test.js` — zero-dependency Node tests for in-app browser detection

## Local development

ES modules need an HTTP origin, so serve the folder:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

The assistant calls the NAS endpoint. On `localhost` it uses `http://localhost:3001/api/profile-chat` (the NAS portal dev server); everywhere else it uses `https://nas.elevenbeans.me/api/profile-chat`. If the endpoint is unreachable, the offline easter-egg commands still work.

## Earth Online

The project showcase links to [`/earth-online/`](./earth-online/), a self-contained static app: NASA globe, live Open-Meteo weather, a shared 46-city score board, and MapLibre/OSM Orbital Blueprint city views with wireframe landmarks, automatic day/night palettes, a local passport with landmark scans, daily routes and city postcards, plus crawlable static city pages. Its README is the project doc used by the NAS profile-chat assistant. There is no build step; GitHub Pages serves the folder directly.

## Tests

```bash
npm test        # runs the assistant-commands, assistant-events and embedded-browser tests
```

## Asset versioning

`styles.css` and `js/*.js` are loaded with a `?v=N` query string because GitHub Pages caches them for 4 hours. After changing CSS or JS, bump `v` in `index.html` and in the `from './…js?v=N'` imports so returning visitors get the new files.

## Deploy

Push to `main` — GitHub Pages auto-deploys to elevenbeans.me.

## Related

- Earth Online: https://elevenbeans.me/earth-online/
- NAS portal + assistant: https://nas.elevenbeans.me
- Blog: https://blog.elevenbeans.me
