# Personal Profile One-Pager — Design Spec

## Overview

A minimalist, premium-styled single-page profile for **elevenbeans** (software engineer). Zero images, pure typography, instant load. Deployable anywhere via a single `index.html`.

## Tech Stack

- **Single `index.html`** with embedded CSS — no build step, no dependencies
- **Google Fonts (Inter)** — single font import
- **Zero JavaScript** (except dark mode toggle)
- **No images** — every visual element is typographic or CSS-based

## Visual Style

| Property | Value |
|---|---|
| Palette | Near-black `#0a0a0a` on off-white `#f5f5f5` |
| Accent | Warm sand `#d4a373` — links, hover states, borders |
| Font | Inter (400, 500, 700 weights) |
| Copy max-width | 720px |
| Hero name | 4rem / 700 weight |
| Section headings | 1.75rem / 600 weight |
| Body | 1rem / 1.8 line-height |
| Dark mode | Inverted light-on-dark via CSS class toggle |

## Page Structure

### 1. Hero Section
- **elevenbeans** (large heading)
- **software eng** (smaller subtitle)
- Tagline / short bio — to be confirmed with user

### 2. Experience
Chronological timeline with company logos replaced by styled text badges:
- **Trip.com Group** — role, duration
- **Travix** — role, duration
- **Cheaptickets.nl / Budgetair.com** — role, duration

Each entry: company name, role, years, 1-line description.

### 3. Projects
Card-style links to external destinations:
- **NAS Portal** — self-hosted NAS dashboard, link
- **Personal Blog** — link

Brief description per project, external link indicator.

### 4. Hobbies
Short list of personal interest tags — to be confirmed with user.

### 5. Footer
Minimal bar with social/contact links (GitHub, LinkedIn, email).

## Interaction

- **Dark mode toggle** (top-right corner, sun/moon icon via CSS)
- **Smooth scroll** between anchor sections
- **Link hover**: accent underline transition

## Constraints

- File must be fully self-contained: one `index.html` with all CSS inline
- Deploy target: GitHub Pages
- Blog and NAS sections link to external URLs — to be confirmed with user

## Out of Scope

- No build tooling
- No JavaScript framework
- No analytics
- No comment system
- No CMS
