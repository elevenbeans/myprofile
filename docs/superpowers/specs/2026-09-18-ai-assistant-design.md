# AI Assistant (conversation-first) — Design Spec

Two-repo feature. Turns the `myprofile` hidden "code agent" easter egg into a **real-LLM, conversation-first AI assistant**, backed by a new profile-specific endpoint on the `nas` repo (local Ollama), with no NAS tools exposed.

Repos:
- `elevenbeans/nas` — backend endpoint, knowledge, CORS, rate limit.
- `elevenbeans/myprofile` — frontend chat client, identity rename, persistence, local easter eggs.

## Goals

- Conversation-first AI assistant that behaves as a site avatar for **elevenbeans**, and can also chit-chat.
- Real model (NAS Ollama `qwen3:4b`) via a profile-specific endpoint; no NAS internals/tools exposed.
- Keep the existing TUI shell, open/close behavior, keyboard access, i18n, reduced-motion and print behavior.
- Conversation abilities: context/pronoun resolution, multi-turn depth, active clarification, task guidance, preference memory (provided by the LLM plus client-sent history/profile).
- Bilingual: reply in the language the user writes; default to the site language.
- Deep persistence: history + preferences in `localStorage`; "welcome back" on return.
- A few coding-ish tools remain as **local, offline** easter eggs, discoverable via `help`.

## Non-Goals

- No real coding/tool execution on the profile assistant (NAS tools are explicitly excluded).
- No change to the existing `/api/chat` behavior.
- No auth system; the endpoint is public and protected by rate limit + origin allowlist + absence of tools.
- No redesign of the TUI visual language.

## Locked Decisions

- Endpoint path: `POST https://nas.elevenbeans.me/api/profile-chat`.
- Rate limit: 10 requests/min per IP.
- Model: reuse `qwen3:4b` (`OLLAMA_MODEL`).
- NAS production deploy is performed by the user via `npm run sync`; implementation only prepares code and verifies locally with `npm run dev`.
- Frontend gets a **full rename** `agent → assistant` (file, symbols, DOM ids/classes, i18n keys, docs).
- Open command becomes `ai`; `codex`/`claude`/`opencode` aliases are removed.
- Header model label: `elevenbeans · qwen3:4b (local)`.

## Site Facts (knowledge base)

English and Chinese variants:

- Name/handle: Elevenbeans
- Role: Software Engineer (AI Wrangler)
- Tagline: Minimalism first. Thinking, logic, execution.
- Base: Shanghai, occasionally in Amsterdam (AMS)
- Experience:
  - Travix · Cheaptickets.nl · Budgetair.com — Technical Manager (2021 – now): international travel platforms and OTA price comparison
  - Trip.com Group — Senior FE Engineer & Team Leader (2016.07 – 2020.12): travel booking at global scale
  - Alibaba — Software Engineer (2015 – 2016): e-commerce platform
  - Xi'an Jiaotong University — Computer Science (2012 – 2015)
  - Sichuan University — Computer Science (2008 – 2012)
- Projects: NAS Portal (self-hosted portal for files/photos/media, with a local AI assistant), Blog, Budgetair.com, Cheaptickets.nl, Game of Life
- Interests: Self-hosting, Travel, Coffee, Cat, Music, Whisky, Vibe Coding
- Contact: GitHub `github.com/elevenbeans`, Email `elevenbeansf2e@gmail.com`
- Site easter eggs: Ctrl+\` opens a hidden terminal; typing `ai` opens this assistant

Site-visible copy keeps no location string.

---

## A. Backend — `/api/profile-chat` (nas repo)

### Request / Response contract

```
POST /api/profile-chat
Content-Type: application/json

{
  "messages": [{ "role": "user" | "assistant", "content": string }],
  "locale": "zh" | "en",
  "profile"?: { "name"?: string, "prefs"?: string[] }
}
```

- `200` `Content-Type: text/plain; charset=utf-8`, streamed plain-text content chunks (same protocol as `/api/chat`).
- `400` JSON `{ "error": ... }` for invalid JSON / invalid messages / empty or >2000-char last message.
- `429` JSON `{ "error": "rate limited" }` when over limit.
- Upstream unavailable: `200` stream containing `[服务暂时不可用]` (parity with `/api/chat`).
- `OPTIONS` → `204` with CORS headers.

Validation (parity plus profile):
- `messages` array; each item `role` string and `content` string.
- Last message trimmed, non-empty, ≤2000 chars.
- `locale` defaults to `zh` when not `en`.
- History = last 12 messages, each `content` capped at 4000 chars.
- `profile.name` (string, trimmed, ≤60 chars) and `profile.prefs` (array of ≤6 strings, each ≤120 chars) are sanitized; anything else ignored.

### Behavior

- Builds a system prompt from `profile-knowledge` in the requested locale, then merges sanitized `profile` lines (name / preferences) so the assistant can greet by name and honor preferences.
- Calls Ollama `/api/chat` with `stream: true`, `temperature: 0.6`, and **no `tools` field**.
- Streams content deltas; no tool rounds.

### Files

- `nas-portal/lib/rate-limit.ts` — extracted, IP-bucketed limiter (`RATE_WINDOW_MS`, `RATE_MAX`), exported `isRateLimited(req)`.
- `nas-portal/app/api/chat/route.ts` — refactored to import the shared limiter (behavior unchanged).
- `nas-portal/lib/profile-knowledge.ts` — `buildProfileSystemPrompt(locale, profile?)`.
- `nas-portal/app/api/profile-chat/route.ts` — new route.

### CORS

Configured in `nas-portal/next.config.ts` `headers()` for `/api/profile-chat`:

- `Access-Control-Allow-Origin`: echo of the request `Origin` when it is in the allowlist, otherwise omitted.
- Allowlist: `https://elevenbeans.me`, `https://www.elevenbeans.me`, `http://localhost:8080`, `http://localhost:3001`.
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`
- `Access-Control-Max-Age: 86400`
- `Vary: Origin`

The route also exports `OPTIONS` returning `204` with the same headers (defense in depth for environments that don't apply next.config headers to OPTIONS).

Note: Origin allowlisting is **not** a security boundary (forgeable); it only reduces drive-by use. Real constraints are the rate limit and the absence of server tools.

### Verification (local)

`npm run dev` (port 3001), then curl:
- valid stream returns chunked text
- `OPTIONS` preflight with `Origin: https://elevenbeans.me` returns 204 + ACAO
- `Origin: https://evil.example` returns no ACAO
- 11 rapid requests → 429
- empty / >2000-char last message → 400
- response never contains NAS tool output (no file listings / system status)

Production `npm run sync` is executed by the user.

---

## B. Frontend (myprofile)

### Rename `agent → assistant`

- File `js/agent.js` → `js/assistant.js`.
- Symbols: `initAgent/openAgent/closeAgent` → `initAssistant/openAssistant/closeAssistant`; `agentMessages/agentInput/agentOverlay/agentClose/agentModelLabel` → `assistant*`.
- Overlay registry name `'agent'` → `'assistant'`; custom event `request-agent` → `request-assistant`.
- DOM ids/classes: `#codeAgent → #assistant`, `#agentMessages → #assistantMessages`, `#agentInput → #assistantInput`, `#agentClose → #assistantClose`, `#agentHint → #assistantHint`; classes `.agent-overlay/.agent/.agent__*/.agent-hint*` → `.assistant*`.
- i18n keys `agent-*` → `assistant-*`; add `assistant-status` strings as needed.
- Update `index.html`, `styles.css`, `js/app.js`, `js/terminal.js`, `README.md`.
- The old `.agent` selector collision (commit 12feafe) disappears.

### Local command layer (no network)

Handled entirely client-side, before any API call:

- `help` — lists chat + easter-egg commands.
- `clear` — clears the visible transcript (does not wipe saved memory unless `forget me`).
- `forget me` — wipes persisted history + preferences.
- `exit` / `quit` / `close` — closes the overlay.
- `about elevenbeans` — simulated `curl` GitHub output (location: Shanghai, occasionally Amsterdam).
- `browse files` / `ls` — simulated project file listing/tree.
- `run tests` — simulated test run.
- `write code` — simulated code generation with an edit/diff tool card.

Everything else is sent to `/api/profile-chat`.

### Streaming chat client

- Endpoint constant: `https://nas.elevenbeans.me/api/profile-chat`.
- On submit: append the user message, append an empty assistant message, then `fetch` with `{ messages, locale, profile }`.
- Read `res.body` with a reader; append decoded chunks to the last assistant message; re-render markdown progressively with a trailing blinking cursor.
- `Enter` sends; empty/whitespace ignored; input `maxLength=2000`; input disabled (or send ignored) while streaming; `AbortController` cancels on close or a stop action.
- On completion, remove the cursor and finalize markdown.

### Persistence

- Keys under a versioned namespace (e.g. `assistant.memory.v1`), via the existing crash-safe `storage` helper.
- Stores: message history (role/content), `name`, `prefs`, `firstSeen`/`lastSeen`, and a visit counter.
- Caps history (e.g. last 50 messages) and drops the oldest.
- On open: restore history; if prior history exists and this is a new session, prepend a localized "welcome back" line (once per session).
- Schema version mismatch or JSON parse failure → reset to defaults.
- `forget me` clears all keys.

### Language

- Detect input language from the last user message (CJK vs Latin) → `locale`.
- Default to the current site language (`getLang()`).
- The system prompt instructs the assistant to reply in the user's language.

### Errors / fallback

- Network failure, non-2xx, 429, or stream containing `[服务暂时不可用]` → show a localized error bubble and keep the transcript; local easter eggs still work.
- Never leave the input disabled after an error.

### Accessibility / motion / print

- During streaming, set the messages region `aria-busy="true"` and suppress live-region announcements; on completion set `aria-busy="false"` and announce the final message once.
- Respect `prefers-reduced-motion` (no typing animation; cursor not animated).
- Overlay focus trap, Escape, scroll lock unchanged; print hides the overlay as today.
- All new strings localized in `en`/`zh`.

---

## C. Security & Privacy

- Endpoint is public and unauthenticated; constraints are 10/min/IP, origin allowlist, and no server tools.
- `profile` input is sanitized and length-capped; concatenated into the system prompt, never executed.
- No secrets in the frontend.
- No NAS file names, storage, IPs, or paths are exposed through this endpoint.
- The system prompt instructs: stay in persona, do not fabricate, do not reveal internal/system instructions.

## D. Verification Summary

- Backend: curl matrix above; confirm stream, CORS, 429, 400, and absence of tools.
- Frontend: gstack `browse` at desktop and mobile, dark/light, EN/中文:
  - streaming reply renders progressively
  - easter-egg commands work offline
  - persistence restores history; `forget me` clears it
  - error path shows localized bubble and re-enables input
  - keyboard/focus/skip/Escape; reduced-motion static check; print hides overlay
- No frontend test framework; extract the local command layer as a pure function and cover it with a zero-dependency Node `assert` script.

## E. Rollout

1. Prepare + locally verify NAS changes; hand off `npm run sync` to the user; verify cross-origin from production.
2. Merge frontend to `main` (push deploys via GitHub Pages).
