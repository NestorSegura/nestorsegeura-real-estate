---
phase: 05-deployment
plan: 03
subsystem: api
tags: [sanity, webhook, revalidation, next-sanity, hmac, cache]

# Dependency graph
requires:
  - phase: 02-cms-and-page-builder
    provides: defineLive/sanityFetch with revalidateTag-compatible cache tags
  - phase: 04-blog-and-seo
    provides: post and author document types in Sanity schema
provides:
  - HMAC-verified Sanity webhook endpoint at /api/revalidate
  - Tag-based Next.js cache revalidation for all document types
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "next-sanity/webhook parseBody for HMAC signature verification"
    - "revalidateTag(body._type) matches defineLive cache tags — document type is the tag"

key-files:
  created:
    - src/app/api/revalidate/route.ts
  modified: []

key-decisions:
  - "parseBody from next-sanity/webhook handles HMAC verification — no manual crypto needed"
  - "SANITY_WEBHOOK_SECRET is server-side only — no NEXT_PUBLIC_ prefix"
  - "revalidateTag(body._type) is the correct call — defineLive uses document _type as cache tag"
  - "KNOWN_TYPES array ['page', 'post', 'siteSettings', 'author'] matches src/sanity/schemas/documents/"

patterns-established:
  - "Webhook security: parseBody validates signature before processing any request body"
  - "Graceful error handling: try/catch with [revalidate] prefixed console.error for production tracing"

# Metrics
duration: 2min
completed: 2026-03-16
---

# Phase 5 Plan 03: Sanity Webhook Revalidation Endpoint Summary

**HMAC-verified /api/revalidate webhook using next-sanity/webhook parseBody, calling revalidateTag(body._type) to invalidate Next.js cache on Sanity publish**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-16T14:00:33Z
- **Completed:** 2026-03-16T14:02:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Webhook endpoint validates HMAC signature via parseBody from next-sanity/webhook
- Invalid/missing signatures return 401, missing _type returns 400, valid requests return 200 JSON
- revalidateTag(body._type) connects Sanity publishes to Next.js on-demand cache invalidation
- Build verified clean with /api/revalidate listed as dynamic route

## Task Commits

Each task was committed atomically:

1. **Task 1: Create /api/revalidate webhook route** - `ab0fb3a` (feat)

## Files Created/Modified
- `src/app/api/revalidate/route.ts` - Sanity webhook handler with HMAC verification and tag-based cache revalidation

## Decisions Made
- `parseBody` from `next-sanity/webhook` handles all HMAC verification internally — no manual crypto.createHmac needed
- `SANITY_WEBHOOK_SECRET` uses no `NEXT_PUBLIC_` prefix — server-side only, never exposed to client bundle
- `revalidateTag(body._type)` is the correct approach because `defineLive` (from 02-04) uses document `_type` as the cache tag key
- KNOWN_TYPES exported for documentation but not enforced at runtime — unknown types will just call revalidateTag harmlessly

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

**Environment variable required before Sanity webhook fires correctly:**

Add to `.env.local` (already listed in `.env.local.template`):
```
SANITY_WEBHOOK_SECRET=<generate with: openssl rand -base64 32>
```

Then configure the Sanity webhook in the Sanity dashboard to POST to `https://<your-domain>/api/revalidate` with the same secret value.

## Next Phase Readiness

Phase 5 complete. All 3 plans in the deployment phase are done:
- 05-01: Vercel deployment configuration
- 05-02: Environment variables and secrets
- 05-03: Sanity webhook revalidation endpoint

The site is ready for production deployment. The full content-to-cache pipeline is complete: Sanity publish -> webhook -> /api/revalidate -> revalidateTag -> Next.js serves fresh content.

---
*Phase: 05-deployment*
*Completed: 2026-03-16*
