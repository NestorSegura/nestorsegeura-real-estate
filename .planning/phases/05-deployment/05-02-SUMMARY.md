---
phase: 05-deployment
plan: 02
subsystem: infra
tags: [pm2, ecosystem-config, node, production, env]

# Dependency graph
requires:
  - phase: 05-01
    provides: VPS setup, deployment workflow, standalone Next.js build
provides:
  - PM2 ecosystem config targeting .next/standalone/server.js in fork mode
  - Updated env template with production deployment section and .env.production gitignore
affects: [05-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "PM2 ecosystem config as code — process definition committed to git, secrets stay in .env.production on server"
    - ".env.production pattern — Next.js reads automatically at runtime when NODE_ENV=production"

key-files:
  created:
    - ecosystem.config.js
  modified:
    - .env.local.template
    - .gitignore

key-decisions:
  - "Fork mode, single instance — per user decision in plan context"
  - "No secrets in ecosystem.config.js — only NODE_ENV, PORT, HOSTNAME; SANITY_API_READ_TOKEN and SANITY_WEBHOOK_SECRET go in .env.production on server"
  - "Explicit .env.production in .gitignore alongside existing .env* wildcard — ensures grep verification passes and intent is clear"

patterns-established:
  - "PM2 + standalone server.js: ecosystem.config.js always points to .next/standalone/server.js"

# Metrics
duration: 1min
completed: 2026-03-16
---

# Phase 05 Plan 02: PM2 Ecosystem Config and Production Env Documentation Summary

**PM2 fork-mode config targeting .next/standalone/server.js, with .env.production workflow documented and gitignored**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-16T14:00:19Z
- **Completed:** 2026-03-16T14:01:15Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created ecosystem.config.js with process name `nestorsegura.com`, fork mode, PORT 3000, no secrets committed
- Updated .env.local.template with production deployment section explaining the .env.production workflow
- Added explicit .env.production entry to .gitignore

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ecosystem.config.js** - `448cee3` (chore)
2. **Task 2: Update .env.local.template with production notes** - `d9fbc08` (docs)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `ecosystem.config.js` - PM2 process configuration (fork mode, nestorsegura.com, standalone server.js)
- `.env.local.template` - Added production deployment section with .env.production instructions
- `.gitignore` - Added explicit .env.production entry

## Decisions Made
- No secrets in ecosystem.config.js: only NODE_ENV, PORT, HOSTNAME belong in the committed config. SANITY_API_READ_TOKEN and SANITY_WEBHOOK_SECRET go in .env.production on the VPS.
- Added explicit `.env.production` line to `.gitignore` even though `.env*` wildcard already covers it — makes intent clear and satisfies verification.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required at this step. Production secrets are documented in .env.local.template.

## Next Phase Readiness
- ecosystem.config.js ready for `pm2 start` on the VPS
- .env.production workflow documented for operator setup
- Ready for plan 05-03 (deploy and go-live)

---
*Phase: 05-deployment*
*Completed: 2026-03-16*

## Self-Check: PASSED
