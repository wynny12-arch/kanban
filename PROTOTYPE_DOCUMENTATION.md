# Prototype Documentation — Kanban Board PWA
### How a Fully Featured Productivity App Was Built Through Conversation

---

## What This Document Is

This is a record of how a fully functional, cross-device Kanban board application was designed, built, debugged, and deployed — not through traditional software development, but through **Vibe Coding**: a process of describing what you want in natural language and iterating with an AI coding assistant until the result works exactly as intended.

No prior JavaScript expertise was required. No build tools. No framework knowledge. Just clear thinking about what the product should do, and a willingness to iterate.

---

## The Vibe Coding Process

### What Is Vibe Coding?

Vibe Coding is a development methodology where the human acts as **product owner and QA tester** while the AI acts as **engineer and architect**. The human describes outcomes ("I want tasks to drag to reorder on my phone"), the AI produces working code, the human tests it, reports what happened, and the loop repeats.

The key insight is: **you don't need to understand the code to direct it**. You need to understand the product.

### How This Project Was Built

The entire application was developed through a single ongoing conversation with Claude Code. There was no separate design phase, no sprint planning, no tickets. The workflow looked like this:

```
Human describes a feature or problem
        ↓
AI reads the existing code, proposes approach, writes implementation
        ↓
Human uploads the file, tests on real devices (Mac + Pixel phone)
        ↓
Human reports exactly what happened ("it shows dashes", "goes back to original position")
        ↓
AI diagnoses the root cause, fixes it
        ↓
Repeat
```

### The Progression of the Build

The app grew organically through this conversation in distinct phases:

| Phase | What Was Built |
|---|---|
| 1 | Basic kanban board — 3 columns, add/edit/delete tasks |
| 2 | Cloud sync via JSONbin — cross-device state |
| 3 | Supabase Storage — cross-device file attachments |
| 4 | GitHub Pages deployment |
| 5 | PWA — installable on Android home screen |
| 6 | Tag search fix, priority sorting, manual reorder |
| 7 | Live data widgets — weather, FX, markets, clocks, crypto |
| 8 | Mobile widget bottom sheet |
| 9 | Touch drag-and-drop for Pixel |
| 10 | Desktop drag-and-drop reordering for Mac |
| 11 | NVIDIA ticker, Adelaide clock, new-task-at-top |

Each phase was a conversation, not a project plan.

---

## Architecture Decisions

### Decision 1: Single HTML File

**What:** The entire application — all HTML structure, CSS styles, and JavaScript logic — lives in one `index.html` file.

**Why:** Simplicity above everything else. A single file means:
- Zero build tools (no npm, webpack, Vite, or similar)
- Zero dependencies to install or manage
- Deploy by uploading one file to GitHub Pages
- Update by uploading a new version of that file
- The app works offline, on any device, with no installation beyond the browser

**Trade-off:** The file grows large (~1,800 lines). At production scale this would be split into modules. For a personal productivity tool used by one person, it's the right call.

**AI's role:** The AI maintained context across the entire file through every iteration, reading and editing precisely the sections that needed changing without breaking anything else.

---

### Decision 2: localStorage as the Primary Data Store

**What:** All task data is serialised to JSON and stored in the browser's `localStorage` under the key `kanban_v2`.

**Why:**
- Zero latency reads and writes — the UI is always instant
- Works completely offline
- No server costs, no database to manage
- Data survives page refreshes and browser restarts

**Trade-off:** localStorage is per-device. Opening the app on a different browser or device starts with empty data. This is solved by the cloud sync layer on top.

---

### Decision 3: JSONbin as the Cloud Sync Layer

**What:** JSONbin.io is a free JSON storage API. The app pushes its entire state (as a JSON blob) to a JSONbin "bin" after every save. On another device, you pull the latest state manually.

**Why:**
- Completely free, no account required beyond an API key
- Dead simple API — one POST to save, one GET to load
- No schema, no migrations — the JSON structure can change at will
- The "master key" is stored locally on each device; no login flow needed

**Trade-off:** Last-write-wins. If you edit on two devices simultaneously, one will overwrite the other on pull. Acceptable for a single-user tool.

**What was NOT used:** Firebase, Supabase database, PocketBase, or any realtime sync. Those add complexity; JSONbin is good enough for the use case.

---

### Decision 4: Supabase Storage for File Attachments

**What:** When Supabase credentials are configured, file attachments (images, PDFs, emails) are uploaded to a Supabase Storage bucket. Only the public URL is stored in the task state — not the file data itself.

**Why this was needed:** The original approach stored file data as base64 strings inside the JSON state. This worked on the device that attached the file, but JSONbin has a size limit. Large files (images, PDFs) caused the cloud sync to fail silently — the file data was stripped, and on another device the attachment showed as "locked" (unavailable).

**The solution:** Files live in Supabase. URLs live in the task state. The state stays small and syncs cleanly. Any device can access the file via its public URL without needing Supabase credentials.

**RLS policy learning:** The new Supabase key format (`sb_publishable_...`) is not compatible with Row Level Security policies that use `TO anon`. The fix was to remove the role restriction from storage policies entirely.

---

### Decision 5: GitHub Pages for Hosting

**What:** The app is hosted as a static site on GitHub Pages, served from the root of a public repository.

**Why:**
- Free, permanent hosting
- HTTPS by default (required for PWA installation and geolocation)
- Deploy by committing a file — no CI/CD pipeline
- Custom path (`/kanban/`) works with the PWA manifest

**Alternative considered:** Netlify was the original host. Moved to GitHub Pages for simplicity — one fewer account, one fewer service.

---

### Decision 6: No Framework, No npm

**What:** Vanilla JavaScript throughout. No React, Vue, Svelte, or any UI library.

**Why:** For a single-developer personal tool, a framework adds:
- A build step (now you need Node.js, npm, a bundler)
- A learning curve for anyone reading the code later
- Dependency updates to manage
- Abstractions that obscure what the code is actually doing

Vanilla JS with DOM manipulation is perfectly capable for this scale. The AI assistant is equally effective with framework code, but the human directing the project benefits from the simplicity.

---

### Decision 7: PWA Over Native App

**What:** The app is installable on Android via the browser's "Add to Home Screen" feature. It runs in standalone mode (no browser chrome), has its own icon, and loads from cache when offline.

**Why:** A native Android app would require:
- A Google Play developer account
- Kotlin or React Native knowledge
- App submission and review
- Updates via the Play Store

A PWA requires:
- A `manifest.json` (10 lines)
- A `sw.js` service worker (30 lines)
- HTTPS hosting (already had it)

The result is indistinguishable from a native app for this use case.

---

## How AI Tools Were Used

### The Honest Account

This application was built entirely through conversation with Claude Code. The human wrote zero lines of JavaScript, zero lines of CSS, and zero lines of HTML directly. Every character of code was written by the AI in response to natural language descriptions.

### What the Human Contributed

- **Product vision:** "I want a kanban board that works on my phone and my Mac"
- **Feature prioritisation:** deciding what to build next
- **Real-device testing:** uploading files, opening on the Pixel, reporting exact behaviour
- **Problem description:** "the blue dotted border appears around the column but when I drop it, it bounces back" — this description alone contained enough information for the AI to diagnose the root cause (HTML5 drag events intercepting touch events)
- **Domain knowledge:** knowing which stocks, which cities, which currencies mattered
- **Quality judgment:** "nice work" / "still not working" / "solid unavailable now"

### What the AI Contributed

- **All code** — reading, writing, editing, debugging
- **Architecture decisions** — proposing the JSONbin/Supabase approach, the single-file structure
- **API research** — finding free CORS-enabled data sources for weather, FX, markets, crypto
- **Root cause diagnosis** — from user-reported symptoms to specific code bugs
- **Defensive implementation** — adding fallbacks, error handling, graceful degradation

### Specific Examples of AI-Assisted Problem Solving

**Problem:** "Upload failed: Storage upload failed (400) — new row violates row-level security policy"
**AI diagnosis:** Supabase's new `sb_publishable_` key format doesn't match `TO anon` in RLS policies
**Fix:** Updated SQL policies to remove the `TO anon` role restriction

---

**Problem:** "Tasks lift and move but go back to where they came from when I drop them"
**AI diagnosis:** First suspected stale `tdDropTarget` state. Then identified the real cause — `elementFromPoint()` returns the `.cards` container (not a card) when the finger releases in the 8px gap between cards, causing the drop handler to find no valid target and silently abort
**Fix:** Added `tdNearestCard()` — if no card is found at the exact release point, snap to the nearest card within 80px

---

**Problem:** "The blue dotted border appears around the whole column" (mobile drag)
**AI diagnosis:** `card.draggable = true` causes Chrome on Android to intercept long-press as an HTML5 drag event, swallowing the touch events that our custom touch drag relies on
**Fix:** `card.draggable = navigator.maxTouchPoints === 0` — disables HTML5 drag on touch devices entirely

---

**Problem:** Markets widget shows "Unavailable" — went through Yahoo Finance (CORS blocked) → Alpha Vantage (25/day limit) → CoinGecko (now requires paid key) → Twelve Data (paywall) → FMP (legacy endpoints) → allorigins proxy (rate limiting)
**AI approach:** Each failure was diagnosed, a new source tried, and a fallback strategy built. Final solution: two CORS proxies (corsproxy.io + allorigins.win) with automatic fallback, and progressive row-by-row loading so a single failure doesn't blank the whole widget

---

### The Iteration Speed

A feature that would take a junior developer a day to research, implement, and debug was typically resolved in 2–5 conversation turns. The bottleneck was not writing code — it was the human uploading the file to GitHub, reopening the PWA on the Pixel, and reporting what they saw.

---

## Technical Challenges and How They Were Solved

### Challenge 1: Cross-Device File Attachments

**Problem:** Attaching a PDF on the Mac showed a padlock icon on the Pixel.
**Root cause:** Base64 file data exceeded JSONbin's size limit and was silently stripped during sync.
**Solution:** Supabase Storage. Files are uploaded separately, only the URL travels through JSONbin.

### Challenge 2: Weather Widget Failing on Mobile

**Problem:** Weather worked on Mac, showed "Unavailable" on Pixel PWA.
**Root cause:** The geolocation API timed out silently in standalone PWA mode on Android; the `ipapi.co` fallback was also failing on the mobile carrier's network.
**Solution:** Switched from geolocation-first to IP-based location only (`ipinfo.io`). Faster, no permission required, works on all networks. Replaced `wttr.in` (unreliable) with Open-Meteo (highly reliable, free, CORS-enabled).

### Challenge 3: Service Worker Cache Stale Content

**Problem:** After uploading a new `index.html`, the Pixel continued showing the old version.
**Root cause:** Users were resuming the PWA from the Android task switcher (restoring the existing page) rather than doing a fresh navigation.
**Solution:** Documented the fix — swipe the app away in Android recents, then reopen. Navigation is network-first in the service worker, so a fresh open always fetches the latest HTML.

### Challenge 4: Touch Drag vs HTML5 Drag Conflict

**Problem:** On Android Chrome, long-pressing a `draggable="true"` element triggers the browser's built-in HTML5 drag system, which intercepts all touch events and prevents custom `touchstart`/`touchmove`/`touchend` handlers from firing.
**Solution:** Detect touch devices with `navigator.maxTouchPoints === 0` and set `card.draggable = false` on touch devices. Also wrapped all HTML5 drag zone listeners in the same check so the blue column highlight cannot appear on mobile at all.

### Challenge 5: Market Data APIs

Every free financial data API tried had at least one blocking issue:

| API | Issue |
|---|---|
| Yahoo Finance | CORS blocked from browser |
| Alpha Vantage | 25 requests/day — exhausted in minutes |
| CoinGecko | Changed policy, now requires paid key |
| Twelve Data `/quote` | Requires "Grow" paid plan |
| Financial Modeling Prep | "Legacy endpoint" error on free tier |
| allorigins.win (proxy) | Rate limits on simultaneous requests |

**Final solution:** Yahoo Finance through two CORS proxies (`corsproxy.io` + `allorigins.win`) in a try/fallback chain. One proxy request per symbol, staggered 800ms apart, each row renders independently.

---

## What "Done" Looks Like

The finished prototype:

- **Runs on two devices** (Mac browser + Android PWA) with shared state
- **Works offline** — loads from service worker cache with no internet
- **Installs as a home screen app** on Android with its own icon and splash
- **Syncs task data** across devices via JSONbin cloud sync
- **Syncs file attachments** across devices via Supabase Storage
- **Shows live data** — weather, exchange rates, stock indices, crypto prices, world clocks
- **Supports drag and drop** on both desktop (mouse) and mobile (touch)
- **Full task management** — create, edit, delete, prioritise, tag, set due dates, attach files, undo
- **Multi-board support** — multiple independent kanban boards
- **Search and filter** — real-time search across all task fields
- **Light and dark mode**

All of this in a single 1,800-line HTML file with no runtime dependencies.

---

## What This Proves

### For Product Teams

A working, testable, cross-platform prototype can be produced in hours rather than weeks. The prototype is not a mockup or a wireframe — it is a real, deployed, usable application. Stakeholders can install it on their phone and use it today.

### For Individuals

You do not need to be a developer to build software. You need to know what you want, be able to describe it clearly, and be willing to test and iterate. The AI handles the technical implementation.

### For AI-Assisted Development

The most valuable skill in Vibe Coding is **precise problem description**. The more specifically you can describe what went wrong ("the blue dotted border appears around the whole column, and when I drop it bounces back to its starting position"), the more precisely the AI can diagnose and fix it. Vague feedback ("it's not working") produces less useful responses.

---

## What Would Come Next (If Productionised)

If this prototype were taken to a production product, the following would be addressed:

| Area | Prototype Approach | Production Approach |
|---|---|---|
| Code structure | Single HTML file | Bundled modules (Vite + TypeScript) |
| State management | Global JS variables | Zustand or similar |
| Sync | JSONbin (last-write-wins) | Supabase Realtime or CRDTs |
| Auth | None (key-based) | Supabase Auth |
| Testing | Manual on real devices | Playwright E2E + unit tests |
| Error monitoring | None | Sentry |
| Market data | CORS proxy chain | Own backend proxy |
| Multi-user | Not supported | Supabase RLS per-user policies |

---

## Closing Note

This prototype took longer to document than it took to build.

The Vibe Coding process is most powerful when the human stays focused on **what** and trusts the AI with **how**. Every time the direction shifted — "actually, can it do both?" or "let's go back to putting in free useful widgets on the right hand side" — the AI adapted without losing the existing work.

The result is a real tool that gets used every day, not a demo that lives in a Figma file.

---

*Built through conversation with Claude Code. Deployed on GitHub Pages. Running on a Pixel phone.*
