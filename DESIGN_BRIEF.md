# Design Briefing — Kanban Board PWA

## Overview

A single-page, self-contained personal productivity app delivered as a Progressive Web App (PWA). Built as one HTML file with embedded CSS and JavaScript — no framework, no build step, no backend. Installable on Android (Pixel) and accessible via browser on Mac. Data persists via localStorage with optional cloud sync through JSONbin and file storage through Supabase.

---

## Visual Language

**Dark-first design** with a full light mode toggle. The palette is based on Slate (Tailwind-inspired):

| Token | Dark | Light | Role |
|---|---|---|---|
| `--bg` | `#0f172a` | `#f1f5f9` | Page background |
| `--surface` | `#1e293b` | `#ffffff` | Sidebar, topbar, columns |
| `--surface2` | `#0f172a` | `#f8fafc` | Cards, inputs |
| `--accent` | `#3b82f6` | `#2563eb` | Blue — interactive elements |
| `--text` | `#e2e8f0` | `#1e293b` | Primary text |
| `--muted` | `#64748b` | `#94a3b8` | Placeholder, labels |

**Status colours** (consistent across both themes):

- Todo — slate (`#94a3b8`)
- In Progress — blue (`#3b82f6`)
- Done — green (`#22c55e`)
- High priority — red (`#ef4444`)
- Medium priority — amber (`#f59e0b`)
- Low priority — green (`#22c55e`)

**Typography:** System font stack (`-apple-system, BlinkMacSystemFont, Segoe UI, Roboto`). Labels are uppercase, 0.7–0.73rem, letter-spaced. Card titles are 0.875rem. Body text is 0.88rem.

**Border radius:** Consistent rounded language — 8px for inputs/buttons, 10px for cards, 14px for columns, 16px for modals, 99px for pills and badges.

**Motion:** Subtle — 0.15s transitions on borders, colours, opacity. A `card-pop` keyframe (scale 1.03→1) plays on task movement. Ghost cards rotate 2° and scale up 4% during touch drag.

---

## Layout

**Three-zone shell:**

```
┌──────────┬──────────────────────────────────────┐
│          │ Topbar                               │
│ Sidebar  ├──────────────────────────────────────┤
│  220px   │ Stats bar                            │
│          ├──────────────────────────────────────┤
│          │ Board (3 columns, horizontal scroll) │
│          │                                      │
│ Widgets  │                                      │
│ at foot  │                                      │
└──────────┴──────────────────────────────────────┘
```

**Sidebar (220px fixed):**
- Logo + app name
- Board switcher list (multi-board support)
- "+ Add board" dashed button
- Cloud sync status button
- Supabase file storage button
- Live widget panel (collapsible)
- Footer with theme toggle

**Topbar:**
- Board title
- Search input (searches title, description, and all tags)
- Priority filter pills (All / High / Med / Low)
- Sort toggle (Priority ↔ Manual)
- 📊 Live button (mobile only — opens widget bottom sheet)
- Add Task button

**Stats bar:**
- Task counts per column
- Overall completion progress bar

**Board:** Three equal-width columns (Todo → In Progress → Done) in a horizontal flex layout with 20px gaps. Minimum 640px width with horizontal scroll on small screens.

---

## Components

### Column
- 14px rounded panel on surface background
- Colour-coded dot + uppercase label + task count badge
- "+ Add task" dashed button at bottom

### Card
- `surface2` background, 10px radius, 1px border
- Hover: border brightens + subtle drop shadow
- Contains: title, optional description (collapsible at 3 lines), priority badge, tags, due date, attachment badges, action buttons
- Action row: ↑↓ move buttons (Manual mode), ←→ column buttons, edit (✎) and delete (✕) icons

### Priority Badges
Pill-shaped with coloured fill at ~13% opacity and matching border:

| Priority | Colour |
|---|---|
| High | Red `#ef4444` |
| Medium | Amber `#f59e0b` |
| Low | Green `#22c55e` |

### Tag Pills
Auto-coloured per tag text (hash-based colour assignment), pill shape, 0.68rem font size. Multiple tags per task, searchable.

### Due Date Labels
Contextual colour states:

| State | Condition | Style |
|---|---|---|
| Default | Future | Neutral border |
| Soon | Within 3 days | Blue tint |
| Today | Due today | Amber tint |
| Overdue | Past due | Red tint |

### Modal (Add / Edit Task)
- 440px centred panel, 16px radius, blurred backdrop overlay
- Fields: Title, Description, Priority (select), Due date, Tags (chip input), Attachments
- Attachment zone: drag-and-drop or click to upload
- Supports: images (compressed, thumbnail preview), PDFs, `.eml` email files
- Email attachments render with subject, sender, and collapsible body preview
- Files uploaded to Supabase Storage when configured; URL synced via JSONbin for cross-device access

### Toast Notifications
Slide up from bottom centre of screen. Auto-dismiss after 3 seconds. Includes optional **Undo** button for task deletion.

### Image Lightbox
Full-screen dark overlay with the image centred and rounded. Click anywhere to close.

---

## Live Widgets (Sidebar)

Five auto-refreshing data cards stacked in the sidebar footer:

| Widget | Data Source | Refresh Interval |
|---|---|---|
| ☁️ Weather | ipinfo.io + Open-Meteo | Every 10 minutes |
| 💱 FX vs GBP | Frankfurter.app | Every hour |
| 📈 Markets | Yahoo Finance (via CORS proxy) | Every 10 minutes |
| 🕐 World Clocks | JS `Date` / `Intl.DateTimeFormat` | Every second |
| ₿ Crypto | Kraken public API | Every 5 minutes |

**Markets widget shows:** FTSE 100, S&P 500, NVIDIA — each with current price and daily % change (green up / red down).

**World Clocks shows:** London, New York, Istanbul, Dubai, Adelaide.

**Weather** uses IP-based geolocation (no GPS permission required) and WMO weather codes for condition descriptions.

**FX** shows GBP → USD, EUR, TRY rates.

**Crypto** shows BTC, ETH, SOL prices in GBP.

### Mobile Widget Bottom Sheet
On portrait mobile the sidebar is hidden. A **📊 Live** button in the topbar opens a bottom sheet overlay that clones all widget content into a scrollable panel.

---

## Interaction Patterns

### Drag and Drop — Desktop (Mac)
- Standard HTML5 drag — click and drag cards between or within columns
- Blue line indicator (`box-shadow`) appears above or below the target card showing the insertion point
- Completely disabled on touch devices (`navigator.maxTouchPoints === 0` gate)

### Drag and Drop — Mobile (Pixel)
- **Long press** 350ms → haptic buzz → card lifts as a ghost (2° rotation, 1.04× scale, 88% opacity, original fades to 25%)
- **Drag** — thin blue line tracks the insertion point between cards
- **Release** — card drops into position
- Auto-switches to Manual sort mode when reordering within a column

### Sort Modes
| Mode | Behaviour |
|---|---|
| **Priority** | Tasks auto-sorted High → Med → Low → None within each column |
| **Manual** | Free ordering via drag or ↑↓ buttons; new tasks always insert at the top |

Toggled via the sort button in the topbar. Mode persists across sessions via localStorage.

### Search
Real-time filter across title, description, and all tags simultaneously. Combined with priority filter pills for stacked filtering.

### Undo
Deleting a task shows a toast notification with an **Undo** button. 3-second window to restore.

---

## Data Architecture

| Layer | Technology | Purpose |
|---|---|---|
| Primary storage | `localStorage` | Instant, offline-capable, no latency |
| Cloud sync | JSONbin.io | Cross-device state sync via master key |
| File storage | Supabase Storage | Attachment hosting, public bucket, URL stored in task state |

- **No backend, no login required** — the app is entirely stateless server-side
- Supabase credentials stored locally per device; public file URLs accessible on any device without credentials
- JSONbin push/pull is manual or triggered on save; merge strategy is last-write-wins

---

## PWA & Mobile Specification

| Property | Value |
|---|---|
| Display mode | `standalone` |
| Theme colour | `#1e293b` |
| Background colour | `#0f172a` |
| Start URL | `/kanban/` |
| Icons | 192×192 and 512×512 PNG |

**Service worker strategy:**
- Navigation requests — network-first (always fetches fresh HTML when online)
- Static assets — cache-first

**Mobile adaptations:**
- Columns stack vertically in portrait mode
- Sidebar collapses off-screen on small viewports
- Touch drag uses `navigator.vibrate(30)` for haptic feedback on drag initiation
- All HTML5 drag code gated behind `navigator.maxTouchPoints === 0`
- Viewport meta prevents artificial zoom

---

## Hosting

Deployed to **GitHub Pages** as a static site. Single repository, no CI/CD pipeline. Updates by uploading a new `index.html` directly to the repository.

---

## What It Is (One Line)

> A self-contained, offline-capable personal kanban board with live market and weather data, cross-device file sync, and native-feel drag-and-drop — delivered as a single HTML file.
