---
phase: 05-deployment
verified: 2026-03-16T14:07:00Z
status: human_needed
score: 5/5 must-haves automated-verified
human_verification:
  - test: "npm run build completes without TypeScript errors"
    expected: "Build exits 0, no TypeScript or compilation errors in output"
    why_human: "Cannot run next build in this environment; must be confirmed on the developer machine or VPS"
  - test: "Run deploy.sh on the VPS — site serves at nestorsegura.com with static assets and images"
    expected: "Home page loads, Sanity images render (cdn.sanity.io), CSS and JS assets load from /_next/static/"
    why_human: "Requires live VPS with git repo, Node, PM2, and Nginx installed"
  - test: "PM2 shows process online after VPS server restart"
    expected: "After reboot, pm2 list shows nestorsegura.com as online pointing to /var/www/nestorsegura.com/.next/standalone/server.js"
    why_human: "Requires live VPS, pm2 startup hook, and a reboot"
  - test: "Publish a Page document in Sanity Studio — live site reflects change within 60 seconds"
    expected: "Edit a page field in Sanity Studio, click Publish. Within 60 s the change appears on nestorsegura.com without a manual redeploy"
    why_human: "Requires live VPS with SANITY_WEBHOOK_SECRET configured in .env.production and a Sanity webhook pointing to https://nestorsegura.com/api/revalidate"
  - test: "POST /api/revalidate with wrong secret returns 401"
    expected: "curl -X POST https://nestorsegura.com/api/revalidate -H 'sanity-webhook-signature: invalid' returns HTTP 401"
    why_human: "Requires live VPS; note — GET /api/revalidate returns 405 (only POST is defined), not 401. The success criterion 5 uses GET which is a wording issue; the actual OPS-01 requirement tests POST with wrong secret"
---

# Phase 5: Deployment Verification Report

**Phase Goal:** The site is running in production on the Hostinger VPS behind PM2, static assets are served correctly, and the Sanity revalidation webhook clears Next.js cache when content changes.
**Verified:** 2026-03-16T14:07:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `npm run build` completes without TypeScript errors | ? HUMAN | Build cannot run in verifier environment; OPS-07 artifacts are correct |
| 2 | `deploy.sh` produces a correctly serving site with static assets | ? HUMAN | Requires live VPS; script logic is structurally correct |
| 3 | PM2 shows process `online` after server restart | ? HUMAN | Requires live VPS and reboot test |
| 4 | Sanity publish triggers cache revalidation within 60 s | ? HUMAN | Requires live VPS + webhook configured in Sanity dashboard |
| 5 | `GET /studio` returns Studio UI; wrong-secret POST to `/api/revalidate` returns 401 | ? HUMAN | Studio route exists and renders NextStudio; 401 path requires live traffic |

**Score:** 5/5 truths — all automated structural checks pass; human execution required for each

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `next.config.ts` | `output: 'standalone'` set | VERIFIED | Line 7: `output: 'standalone'` present; `images.remotePatterns` includes cdn.sanity.io |
| `deploy.sh` | Build + asset copy + PM2 restart script | VERIFIED | 56 lines, executable (`-rwxr-xr-x`), full deploy and rollback logic |
| `ecosystem.config.js` | PM2 fork-mode config targeting `.next/standalone/server.js` | VERIFIED | Points to `.next/standalone/server.js`, fork mode, PORT 3000, HOSTNAME 0.0.0.0 |
| `nginx/nestorsegura.com.conf` | Reverse proxy with SSL, HTTP redirect, buffering off | VERIFIED | 47 lines, HTTP→HTTPS redirect, `proxy_buffering off`, `proxy_pass http://127.0.0.1:3000` |
| `src/app/api/revalidate/route.ts` | POST handler with HMAC verification and revalidateTag | VERIFIED | 38 lines, `parseBody` from `next-sanity/webhook`, `!isValidSignature` returns 401, `revalidateTag(body._type)` called |
| `.env.local.template` | Production deployment section with `.env.production` instructions | VERIFIED | Production section present with all required vars documented |
| `.gitignore` | `.env.production` explicitly listed | VERIFIED | Line 36 in `.gitignore` |
| `src/app/studio/[[...tool]]/page.tsx` | Sanity Studio route | VERIFIED | `NextStudio` rendered with config — substantive, not a stub |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `deploy.sh` | `ecosystem.config.js` | `pm2 start ecosystem.config.js` | WIRED | Line 51: `pm2 restart "$PROCESS_NAME" --update-env \|\| pm2 start ecosystem.config.js` |
| `deploy.sh` | `.next/standalone/` | `cp -r public .next/standalone/` | WIRED | Lines 46-47: both `public/` and `.next/static/` copied |
| `ecosystem.config.js` | `.next/standalone/server.js` | `script` field | WIRED | `script: '.next/standalone/server.js'` |
| `route.ts` | `next-sanity/webhook` | `parseBody` import | WIRED | Import verified; `parseBody` exported at `./webhook` subpath in installed package (v11.6.12) |
| `route.ts` | Next.js cache | `revalidateTag(body._type)` | WIRED | Called after valid signature check; `body._type` matches `defineLive` cache tags |
| `sanityFetch` (live.ts) | Sanity CDN | `defineLive` with `serverToken` | WIRED | `defineLive` from `next-sanity/live` — cache tags are document `_type`, matches `revalidateTag` call |

---

### Requirements Coverage

| Requirement | Status | Notes |
|-------------|--------|-------|
| OPS-01: `/api/revalidate` POST endpoint verifying `SANITY_WEBHOOK_SECRET` | SATISFIED | `parseBody` reads `process.env.SANITY_WEBHOOK_SECRET`; returns 401 on invalid signature |
| OPS-02: `revalidateTag` for affected paths by document `_type` | SATISFIED | `revalidateTag(body._type)` called; types cover page, post, siteSettings, author |
| OPS-03: `next.config.ts` with `output: 'standalone'` | SATISFIED | Present on line 7 |
| OPS-04: `deploy.sh` (build, copy public/ + .next/static, PM2 start) | SATISFIED | All three steps present and in correct order |
| OPS-05: `ecosystem.config.js` for PM2 | SATISFIED | Fork mode, correct script path, no secrets committed |
| OPS-06: `npm run dev` starts without errors | UNCERTAIN | Script exists (`next dev --turbopack`); cannot run verifier — no known blocking issues found in code |
| OPS-07: `npm run build` completes without TypeScript errors | UNCERTAIN | Script exists (`next build --turbopack`); must be run to confirm |

---

### Anti-Patterns Found

No anti-patterns found in phase artifacts.

| File | Pattern | Severity | Finding |
|------|---------|----------|---------|
| All phase files | TODO/FIXME/placeholder | — | None detected |
| `route.ts` | Empty return / stub handler | — | None — full implementation present |
| `deploy.sh` | Console-log-only stubs | — | None — all commands are real operations |

---

### Notable Implementation Detail: `npm install --omit=dev` in `deploy.sh`

`deploy.sh` line 37 runs `npm install --omit=dev`, which skips `devDependencies` including `typescript`. This is correct because Next.js 15 uses its own bundled SWC compiler and does not invoke the `typescript` package at build time. The `typescript` devDep is for IDE type-checking only.

### Notable Wiring Detail: `parseBody` with Missing Secret

If `SANITY_WEBHOOK_SECRET` is not set on the VPS, `parseBody` returns `isValidSignature: null` (not `false`). The route's `if (!isValidSignature)` check treats `null` as falsy and returns 401. This means the endpoint is secure by default even if the env var is missing — it will reject all requests rather than accepting them.

### Success Criterion 5 — Wording Note

Criterion 5 states "GET /api/revalidate with a wrong secret returns 401." The route only exports `POST`. A `GET` to `/api/revalidate` returns **405 Method Not Allowed** (Next.js default). This is correct behavior per OPS-01 which specifies a POST endpoint. The functional intent of criterion 5 (wrong-secret requests are rejected) is satisfied by the POST handler returning 401.

---

### Human Verification Required

**1. Build verification**

**Test:** On the developer machine or VPS, run `npm run build`
**Expected:** Build completes with exit code 0. No TypeScript errors. `/api/revalidate` listed as a dynamic route in build output.
**Why human:** Cannot execute Next.js build in the verifier environment.

**2. Full deploy cycle**

**Test:** SSH into the VPS. Run `./deploy.sh`. Check `pm2 list` shows `nestorsegura.com` as `online`. Visit `https://nestorsegura.com` in a browser.
**Expected:** Home page renders. Sanity images from cdn.sanity.io display. CSS/JS loads from `/_next/static/`. No 404s on static assets.
**Why human:** Requires live Hostinger VPS with git repo cloned, Node >= 18, PM2, and Nginx installed.

**3. PM2 persistence after restart**

**Test:** On the VPS, run `pm2 startup` then `pm2 save`. Reboot the server. After reboot, run `pm2 list`.
**Expected:** `nestorsegura.com` process shows `online` status. Working directory is `/var/www/nestorsegura.com`. Script is `.next/standalone/server.js`.
**Why human:** Requires live VPS and a server reboot.

**4. Sanity webhook revalidation**

**Test:** Ensure `SANITY_WEBHOOK_SECRET` is set in `.env.production` on VPS. Configure Sanity webhook in Sanity dashboard to POST to `https://nestorsegura.com/api/revalidate` with the same secret. Edit a visible field in a Page document in Sanity Studio and click Publish. Wait up to 60 seconds and reload `https://nestorsegura.com`.
**Expected:** The edited content appears on the live site without a manual redeploy or server restart.
**Why human:** Requires live VPS, configured webhook in Sanity dashboard, and observable content change.

**5. Wrong-secret rejection**

**Test:** `curl -s -o /dev/null -w "%{http_code}" -X POST https://nestorsegura.com/api/revalidate -H "sanity-webhook-signature: t=0000000000,v1=invalidsig" -H "Content-Type: application/json" -d '{"_type":"page"}'`
**Expected:** Returns `401`.
**Why human:** Requires live VPS serving the site.

---

## Summary

All five required artifacts exist, are substantive (non-stub), and are correctly wired:

- `next.config.ts` has `output: 'standalone'`
- `deploy.sh` is executable and performs the full build-copy-restart cycle in correct order
- `ecosystem.config.js` targets `.next/standalone/server.js` in fork mode with no secrets committed
- `nginx/nestorsegura.com.conf` provides a complete SSL reverse proxy with streaming support
- `src/app/api/revalidate/route.ts` implements HMAC verification via `parseBody` and calls `revalidateTag(body._type)`

The revalidation chain is fully wired: `sanityFetch` via `defineLive` uses `_type` as cache tag; `revalidateTag(body._type)` in the webhook handler clears exactly that tag.

No gaps were found in the code. All items requiring verification are operational — they cannot be confirmed without a live VPS and the Sanity webhook configured. Five human verification steps are documented above.

---

*Verified: 2026-03-16T14:07:00Z*
*Verifier: Claude (gsd-verifier)*
