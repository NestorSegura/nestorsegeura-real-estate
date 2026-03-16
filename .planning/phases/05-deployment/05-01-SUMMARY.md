---
phase: 05-deployment
plan: 01
subsystem: infra
tags: [nextjs, standalone, pm2, nginx, deploy, ssl, certbot]

requires:
  - phase: 04-blog-and-seo
    provides: complete Next.js application that needs to be deployed

provides:
  - Next.js standalone build output configuration
  - Automated deploy script with rollback support
  - Nginx reverse proxy config template with SSL and streaming support

affects:
  - 05-02 (server setup — references deploy.sh and nginx config)
  - 05-03 (go-live — depends on deploy pipeline being ready)

tech-stack:
  added: []
  patterns:
    - "Standalone output: output: 'standalone' in next.config.ts, PM2 runs .next/standalone/server.js"
    - "Static asset copy: cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/ after each build"
    - "Rollback: git rev-parse HEAD saved to .deploy_rollback_hash before pull; rollback reads and git checkout"
    - "Nginx proxy: proxy_buffering off + 127.0.0.1:3000 (not localhost) for streaming and IPv6 safety"

key-files:
  created:
    - deploy.sh
    - nginx/nestorsegura.com.conf
  modified:
    - next.config.ts

key-decisions:
  - "output: 'standalone' in next.config.ts — produces self-contained server.js for PM2 without node_modules copy"
  - "127.0.0.1:3000 not localhost in Nginx proxy_pass — avoids IPv6 resolution issues on some Linux servers"
  - "proxy_buffering off — required for Next.js streaming (Server Components, SSE)"
  - "Static assets copied after each build — standalone output does not include public/ or .next/static/ automatically"
  - "Rollback uses git checkout to specific hash — simpler than branch-based rollback, works for single-server deploys"

patterns-established:
  - "deploy.sh pattern: save hash → pull → install → build → copy assets → pm2 restart"
  - "rollback pattern: read hash file → git checkout → rebuild (same build path as deploy)"

duration: 2min
completed: 2026-03-16
---

# Phase 5 Plan 01: Deploy Configuration Summary

**Next.js standalone output + automated deploy.sh with PM2/rollback + Nginx SSL reverse proxy config with streaming support**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-16T13:59:55Z
- **Completed:** 2026-03-16T14:01:36Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- `output: 'standalone'` added to next.config.ts — build produces `.next/standalone/server.js` for PM2
- `deploy.sh` automates the full git pull → build → static asset copy → PM2 restart cycle with rollback support
- `nginx/nestorsegura.com.conf` provides a production-ready reverse proxy template with HTTP→HTTPS redirect, SSL certificate paths, `proxy_buffering off` for Next.js streaming, and WebSocket upgrade headers

## Task Commits

Each task was committed atomically:

1. **Task 1: Add standalone output to next.config.ts** - `980d705` (chore)
2. **Task 2: Create deploy.sh and Nginx config** - `ccd896e` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `next.config.ts` — Added `output: 'standalone'`, verified `.next/standalone/server.js` produced
- `deploy.sh` — Full deploy + rollback script, executable, static asset copy, PM2 integration
- `nginx/nestorsegura.com.conf` — Nginx template: HTTP redirect, SSL, proxy to 127.0.0.1:3000, buffering off

## Decisions Made

- Used `127.0.0.1:3000` instead of `localhost` in Nginx `proxy_pass` — avoids IPv6 resolution issues on Linux servers where `localhost` may resolve to `::1` but Node listens on `0.0.0.0`
- `proxy_buffering off` is critical for Next.js App Router streaming — without it, streamed responses are buffered and the user sees a blank page until full response is received
- Static assets must be manually copied after each build — Next.js standalone output intentionally omits `public/` and `.next/static/` to keep the output minimal; they must be in place for the running server
- Rollback uses `git checkout <hash>` then rebuilds — this ensures the rollback binary matches the rollback code; a simpler file-swap approach would leave stale `.next/` artifacts

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required for this plan. Server provisioning and Nginx installation are handled in the next plans.

## Next Phase Readiness

- `deploy.sh` and `nginx/nestorsegura.com.conf` are ready to be copied to the production server in Phase 5 Plan 02 (server setup)
- `ecosystem.config.js` referenced in `deploy.sh` must be created before first deploy (Plan 02 task)
- SSL certificates via `certbot` must be obtained after Nginx is installed (Plan 02 task)

## Self-Check: PASSED

---
*Phase: 05-deployment*
*Completed: 2026-03-16*
