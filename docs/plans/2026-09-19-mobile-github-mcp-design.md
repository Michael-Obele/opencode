# Mobile Polish + GitHub MCP — Design

**Date:** 2026-09-19
**Branch:** `slim-fly-backend`
**Status:** Approved — Approach A (polish pass) + GitHub MCP

## Context

- `slim-fly-backend` is the Fly slim image: embedded Solid `packages/app` (`30M` dist, `en-only`, `sourcemap:false`), compiled binary `dist/opencode-linux-x64/bin/opencode` via `script/build.ts --single`, `debian:bookworm-slim` runtime, `fly.toml` `memory_mb=512`, `auto_stop_machines=suspend`. Image `~250-350MB` compiled, `1.81GB` via `bun run`.
- User plans heavy mobile use; current mobile is functional but cramped. Single breakpoint `768px` (`isDesktop` via `createMediaQuery("(min-width:768px)")` duplicated in 5 files, `max-width:767` in 2). Session page: desktop = resizable split (`sessionPanelWidth`, `ResizeHandle`), mobile = single column `mobileTab: "session"|"changes"` switcher, side panel unmounted on mobile, composer hidden when `mobileChanges()`.
- MCP: local `~/.config/opencode/opencode.json` has `sepia` (remote), `sequentialthinking` (local), `svelte`/`shadcn-svelte` (remote), `exa`, `firecrawl`, `docshark`, `playwright`, `cinder`, `better-auth`. Repo `.opencode/opencode.jsonc` has `mcp:{}` (empty). Need GitHub MCP alongside existing for repo/PR edits on mobile. Global skills bundled via `.opencode/skills-global` (`6.2M`).

## Goals

1. **Mobile polish (Approach A):** Fix cramped feel without architecture change. Keep single `768px` breakpoint, tighten spacing, fix safe-area/keyboard, hit `44px` touch targets.
2. **GitHub MCP:** Add GitHub MCP to both global and repo configs so Fly deployment can edit GitHub via `GITHUB_PERSONAL_ACCESS_TOKEN` / `GITHUB_TOKEN`.

## Non-Goals

- No new breakpoints (`sm`/`lg`) — deferred to Approach B.
- No `packages/web` (SvelteKit) changes — Fly uses embedded Solid app only.
- No compiled binary rework beyond existing `Dockerfile` multi-stage.

## Architecture

### Mobile Polish — Approach A

**Shared hook:**

- New `src/hooks/use-is-desktop.ts` (or `src/utils/is-desktop.ts`): `export const useIsDesktop = () => createMediaQuery("(min-width:768px)")`. Replace 5 duplicated `createMediaQuery("(min-width:768px)")` in `pages/session.tsx`, `pages/session/session-side-panel.tsx`, `components/session/session-header.tsx`, `components/session-context-usage.tsx`, `pages/layout.tsx` (plus `max-width:767` in `titlebar.tsx`, `settings-v2/general.tsx` normalized to same hook).

**Layout fixes:**

- **Safe area + dvh:** `composer/session-composer-region.tsx` dock: add `padding-bottom: env(safe-area-inset-bottom)` and `min-height: 100dvh` fallback for iOS keyboard. `dockHeight = max(78, bodyHeight)` keep, but add `env(safe-area)` to `lift` calc.
- **Touch targets:** Tabs `!h-9` (36px) → `min-h-11` (44px), titlebar `w-8 h-6` → `min-h-11 min-w-11`, `gap-1` → `gap-2` on mobile. File tree `FILE_TREE_WIDTH_MIN=240` → `min(240px, calc(100vw - 32px))` on mobile (via CSS, not constant).
- **Drawer:** `pages/layout.tsx` mobile nav `max-w-[400px]` → `max-w-[calc(100vw-16px)]`, add `padding-bottom: env(safe-area-inset-bottom)`, `top-10` → `top-[var(--titlebar-height)]` (CSS var from `titlebar.tsx` `36px`/`40px`). Add swipe-to-close (touch `start`/`move` → `translateX` + `onClick` overlay already exists).
- **Spacing:** `px-4` → `px-3` when `viewport <375px` (via `max-width: 374px` media query in `session.tsx` `reviewContent` `classes` and `composer` `px-3`). Review header `!h-16 !pb-4` keep, but container `px-4` responsive.
- **Prompt input:** `prompt-input.tsx` toolbar `px-1.75 pt-5.5 pb-2` keep, but pills `max-w-[160px]` → `max-w-[min(160px,40vw)]` on mobile to avoid truncation.

**Files touched (mobile):**

- `src/hooks/use-is-desktop.ts` (new)
- `src/pages/session.tsx` (isDesktop, mobileTabs, panelRow, centered, reviewTab)
- `src/pages/session/composer/session-composer-region.tsx` (safe-area, dvh)
- `src/pages/layout.tsx` (drawer max-w, safe-area, swipe)
- `src/components/titlebar.tsx` (CSS var, share hook)
- `src/components/session/session-header.tsx` (share hook)
- `src/components/session-context-usage.tsx` (share hook)
- `src/pages/session/session-side-panel.tsx` (share hook)
- `src/components/settings-v2/general.tsx` (share hook, mobile toggle)
- `src/context/layout.tsx` (no change, just consumes hook)

### GitHub MCP

**Global (`~/.config/opencode/opencode.json`):**

```json
"github": {
  "type": "local",
  "command": ["npx", "-y", "@modelcontextprotocol/server-github"],
  "environment": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}" },
  "enabled": true
}
```

Alongside `sepia`, `sequentialthinking`, `svelte`, `shadcn-svelte`, `exa`, `firecrawl`, `docshark`, `playwright`, `cinder`, `better-auth`. Requires `GITHUB_PERSONAL_ACCESS_TOKEN` env (PAT with `repo` scope).

**Repo (`.opencode/opencode.jsonc`):**

```json
"mcp": {
  "github": {
    "type": "local",
    "command": ["npx", "-y", "@modelcontextprotocol/server-github"],
    "environment": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}" },
    "enabled": true
  }
}
```

For Fly: `fly secrets set GITHUB_TOKEN=<pat>` (or `GITHUB_PERSONAL_ACCESS_TOKEN`). `Dockerfile` already copies `.opencode` (including `skills-global` merged via `cp -r .opencode/skills-global/* .opencode/skills/`).

**Alternative considered:** Remote `https://api.githubcopilot.com/mcp/` — rejected, needs OAuth, local `npx` is simpler for Fly.

## Data Flow

- Mobile: `useIsDesktop()` → `isDesktop()` memo → branches `desktopReviewOpen`, `desktopV2ReviewOpen`, `mobileTab`, `wantsReview`, `desktopV2PanelLayout`. No new state.
- GitHub MCP: `opencode` loads `opencode.json`/`opencode.jsonc` → spawns `npx @modelcontextprotocol/server-github` → tools `create_or_update_file`, `create_pull_request`, `search_repositories`, etc. available to agents.

## Error Handling

- Mobile: `createMediaQuery` fallback `false` on SSR (`typeof window === "undefined"` already handled). Safe-area `env()` fallback `0px`.
- GitHub MCP: If `GITHUB_PERSONAL_ACCESS_TOKEN` missing, server fails to start — `enabled:true` but tools unavailable; log warning, don't crash. Fly: document `fly secrets` step.

## Testing

- `bun run --cwd packages/app typecheck` (tsgo) must pass.
- `bun run --cwd packages/app test` (if exists) — no new tests, just no regression.
- Manual: `bun run --cwd packages/app dev -- --port 4444` + Chrome DevTools mobile emulation (`375x812`, `320x568`, `768x1024`), check touch targets (`44px`), safe-area (iOS simulator), drawer swipe, prompt dock with keyboard.
- Docker: `docker build -t opencode-slim:local .` + `docker run -d --memory 512m -p 4097:4096 opencode-slim:local` + `docker stats --no-stream`, `curl http://localhost:4097/`.

## Deployment

- `fly.toml` unchanged (`memory_mb=512`, `auto_stop_machines=suspend`). `Dockerfile` already multi-stage compiled binary + `debian:bookworm-slim`.
- Skills: `.opencode/skills-global` (`6.2M`) already bundled, merged at build time.
- Secrets: `fly secrets set GITHUB_TOKEN=<pat>` for GitHub MCP.

## Risks

- Single breakpoint keeps cramped feel on tablets — acceptable for polish pass, revisit B if needed.
- `@modelcontextprotocol/server-github` `npx` cold start `~2s` — cache via `bunx` or pre-install in image if slow.

## Open Questions

- None — approved to implement.
