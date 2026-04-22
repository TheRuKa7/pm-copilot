# pm-copilot-desktop

Tauri v2 shell around a Next.js 15 (static-export) app. Runs the pm-copilot
UI natively on macOS, Windows, and Linux — same Next.js codebase as the web,
minus the browser-native limitations around long streaming and file saves.

## Why desktop

PMs live in long-running sessions: streaming drafts for 2–5 minutes, saving to
local `.md`, opening alongside Linear/Notion. A native shell gives us:

- `EventSource` in the webview without CORS / proxy fuss
- `@tauri-apps/plugin-dialog` for a real save dialog
- `@tauri-apps/plugin-fs` for direct writes
- Tiny install footprint vs an Electron build

## Layout

```
desktop/
├── src/                 # Next.js app (React 18, App Router, static export)
│   ├── app/             # page.tsx — 3-pane UI (tasks / draft / telemetry)
│   ├── components/      # BudgetBar, PlanList
│   └── lib/             # api.ts (SSE), types.ts (Zod), utils.ts
└── src-tauri/           # Rust side
    ├── Cargo.toml
    ├── tauri.conf.json  # bundle + window + CSP
    ├── capabilities/    # explicit permission grants
    └── src/main.rs      # plugins: dialog, fs, shell
```

## Panes

- **Left** — Task history, sorted newest first, each with kind + cost.
- **Center** — Kind picker + title + prompt textarea + streaming draft pane.
  Save dialog writes the draft as `.md` via `plugin-fs`.
- **Right** — Live status, budget bar (primary → warning → danger as spend
  nears budget), plan checklist, last 20 model calls with cached flags.

## Run

```bash
cd desktop
pnpm install
pnpm tauri:dev           # full native shell
# or just the web UI:
pnpm dev                 # http://localhost:1420
```

Requires Rust + platform build deps — see Tauri prerequisites:
<https://v2.tauri.app/start/prerequisites/>.

## Package

```bash
pnpm tauri:build
```

Outputs platform bundles (.dmg / .msi / .AppImage / .deb) in `src-tauri/target/release/bundle/`.

## Backend contract

- `GET  /tasks`
- `POST /tasks` — body `{kind, title, prompt}`
- `GET  /tasks/:id`
- `GET  /tasks/:id/stream` — SSE, each frame is a full `GraphState` JSON

Types live in `src/lib/types.ts`. The stream is intentionally idempotent — the
UI can reconnect and re-render on the latest frame without replaying history.
