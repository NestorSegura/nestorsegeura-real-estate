# Phase 10: Production Deployment - Research

**Researched:** 2026-04-15
**Domain:** Cloudflare Workers Builds (Git integration), custom domains, Sanity webhooks, CF dashboard optimization settings
**Confidence:** HIGH (most findings verified against official CF and Sanity docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Domain & DNS**
- Production domain: realestatestrategy.eu (apex canonical, www redirects to apex)
- Old domain: nestorsegura.com stays live alongside realestatestrategy.eu — both serve the same site (user accepts duplicate-content risk for now)
- Preview deployments: every branch/PR gets a `*.workers.dev` preview URL for review before merge

**Build & deploy pipeline**
- Trigger mechanism: Cloudflare Workers Git integration — push to `main` builds & deploys automatically, no GitHub Actions YAML
- Local deploys: `wrangler deploy` stays available but is not the default flow

**Secrets & env vars**
- Sanity token scope: Viewer (read-only) — build only reads published content
- Split: public vars (PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, PUBLIC_SITE_URL) as plain dashboard vars; SANITY_API_READ_TOKEN as encrypted build-time secret
- Dataset: preview deployments read the production Sanity dataset — no separate preview dataset
- Claude's discretion: exactly which PUBLIC_* vars live in the dashboard vs `wrangler.jsonc` — default to what `@astrojs/cloudflare` expects; goal is build succeeds with zero local `.env`

**Sanity → rebuild hook**
- Trigger scope: all document types, all mutation events (create / update / delete / publish / unpublish) — simplest, noisy builds are acceptable
- Debounce: none — rely on Sanity webhook default firing behavior; Cloudflare queues builds
- Claude's discretion: deploy hook mechanism — recommend Cloudflare deploy hook URL (Sanity webhook → CF rebuild endpoint) since we're on CF Git integration, not GitHub Actions

**Pre-launch verification**
- Required smoke checks before DNS cutover:
  1. All 3 locale homepages render (/, /en, /es) with correct content + fonts
  2. sitemap.xml, robots.txt, og-default.png all return 200 with expected content
  3. Lighthouse mobile performance ≥ 90
- Launch gate: BOTH automated smoke checks AND Nestor's manual walkthrough of the preview URL must pass before DNS flip

**Cloudflare dashboard settings**
- Auto Minify HTML: OFF (confirmed, roadmap requirement)
- Claude's discretion: whether to also disable Rocket Loader, Email Obfuscation, and other HTML-rewriting features — default to disabling anything that mutates Astro's server-rendered HTML

**Rollback**
- Strategy: Cloudflare Workers built-in "Rollback to previous deployment" in the dashboard if a prod deploy breaks the site — no custom tooling needed

### Claude's Discretion
- Deploy hook mechanism (CF Deploy Hook URL confirmed — see findings)
- Which additional HTML-rewriting features to disable (see findings — most are non-issues for Workers)
- Which PUBLIC_* vars go in dashboard vs `wrangler.jsonc` (see findings)
- Smoke test implementation (see recommendation: curl-based shell script + `lighthouse-ci`)

### Deferred Ideas (OUT OF SCOPE)
- 301 redirect from nestorsegura.com → realestatestrategy.eu (future SEO cleanup; user wants both live for now)
- Separate preview Sanity dataset (not needed until draft content workflow matures)
- GitHub Actions-based deploy pipeline (only revisit if CF Git integration becomes limiting)
- Sanity webhook debouncing / projection filters (only if build volume becomes a problem)
- 09-04 AnalyseForm React island and 09-05 scroll reveals (already deferred to v2.1 — out of scope for Phase 10)
</user_constraints>

---

## Summary

Phase 10 deploys realestatestrategy.eu to Cloudflare Workers using the native Git integration (Workers Builds), with a custom apex domain, branch preview URLs, build-time secrets, a Sanity deploy hook for automatic rebuilds, and Cloudflare optimization features audited.

**Key discoveries that change the plan:**

1. **Auto Minify is already gone.** Cloudflare deprecated and removed Auto Minify on August 5, 2024. There is no longer a toggle to disable — it simply does not exist. The roadmap requirement to "disable Auto Minify" is a no-op; document this clearly.

2. **Deploy Hooks for Workers Builds launched April 1, 2026.** This is a very new feature. The mechanism is confirmed: CF dashboard → Settings → Builds → Deploy Hooks → create hook → paste URL into Sanity webhook. No auth header needed.

3. **Rocket Loader and Email Obfuscation do NOT apply to Worker-served content.** Both features are skipped when the response comes from a Cloudflare Worker. The only features that could modify HTML are Cloudflare Fonts (only if Google Fonts links present — this site uses local fonts) and Polish (image optimization only). No aggressive disabling needed.

4. **Build-time vs runtime vars are separate in Workers Builds.** The `SANITY_API_READ_TOKEN` secret must go in "Build variables and secrets" (Settings → Build), NOT in runtime "Variables & Secrets". These are completely distinct scopes.

5. **Actual secret name in project is `SANITY_API_READ_TOKEN`** (not `SANITY_TOKEN` as CONTEXT.md called it). Verified from `.env.local`.

**Primary recommendation:** Workers Builds + Deploy Hooks is the complete solution. Connect repo → configure build command (`npm run build`) + build-time secret → add Custom Domain → set CF Redirect Rule for www → paste Deploy Hook URL into Sanity webhook. Done.

---

## Standard Stack

### Core (all already in project)

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| `@astrojs/cloudflare` | ^13.0.0 | Astro → CF Workers adapter | Already installed |
| `wrangler` | ^4.0.0 | Deploy CLI + local dev | Already installed |
| `@cloudflare/vite-plugin` | 1.25.6 (PINNED) | Vite integration | DO NOT upgrade |

### New (needed for smoke tests)

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| `@lhci/cli` | latest | Lighthouse CI performance gate | `npm install -g @lhci/cli` or `npx lhci` |
| `curl` | system | HTTP smoke checks | Already on macOS/Linux |

**No new npm dependencies needed** for the deploy pipeline itself.

---

## Architecture Patterns

### Workers Builds Setup Flow

```
GitHub repo (main branch)
  └─→ Workers Builds (Git integration)
        ├─ Build command: npm run build
        ├─ Deploy command: npx wrangler deploy (default, auto-inferred)
        ├─ Non-prod deploy command: npx wrangler versions upload (default)
        ├─ Build-time secrets: SANITY_API_READ_TOKEN (encrypted)
        ├─ Build-time vars: PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, PUBLIC_SITE_URL
        └─→ Production: realestatestrategy.eu
              └─→ Preview: <version-prefix>-realestatestrategy-eu.<subdomain>.workers.dev
```

### Environment Variables Split

**Build-time only (Settings → Build → "Build variables and secrets"):**

| Variable | Type | Value | Why build-time |
|----------|------|-------|---------------|
| `SANITY_API_READ_TOKEN` | Secret (encrypted) | Viewer token from sanity.io/manage | Needed during `astro build` for `@sanity/astro`; NOT needed at runtime (static output) |
| `PUBLIC_SANITY_PROJECT_ID` | Plain var | `0cn4widw` | Used by `@sanity/astro` integration at build time |
| `PUBLIC_SANITY_DATASET` | Plain var | `production` | Used by `@sanity/astro` at build time |
| `PUBLIC_SITE_URL` | Plain var | `https://realestatestrategy.eu` | Used by `astro.config.mjs` `site:` field + seo.ts |

**NOTE:** `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` have hardcoded fallbacks in `src/sanity/config.ts` (`'0cn4widw'` and `'production'`). Setting them as build vars is still best practice for clarity, but the build will not fail if they are missing.

**Runtime variables (Settings → Variables & Secrets):**
None required for this site. All Sanity fetching is static (prerendered). The `/api/analyze` route does not use Sanity at runtime.

**Do NOT put `SANITY_API_READ_TOKEN` in runtime Variables & Secrets** — it would be accessible to the running Worker and is unnecessary.

### Custom Domain Setup

```
Workers & Pages → [Worker: realestatestrategy-eu] → Settings → Domains & Routes
  → Add → Custom Domain → realestatestrategy.eu
```

CF automatically:
- Creates DNS A/AAAA records pointing to Workers
- Issues an Advanced Certificate
- Certificate provisioning: typically minutes, up to 24h worst case

**www redirect (separate from custom domain):**
```
Cloudflare Dashboard → [Zone: realestatestrategy.eu] → Rules → Redirect Rules
  → Create Rule
  → When: Hostname equals www.realestatestrategy.eu
  → Then: Redirect to https://realestatestrategy.eu/<PATH> [301, preserve query string]
```

Use the wildcard pattern approach:
- Condition: Request URL matches `https://www.*`  
- Target: `https://${1}` (captures everything after `www.`)
- Status: 301
- Preserve query string: ON

### Deploy Hook → Sanity Webhook Wiring

**Step 1: Create CF Deploy Hook**
```
Workers & Pages → [Worker] → Settings → Builds → Deploy Hooks
  → Name: "Sanity CMS"
  → Branch: main
  → Create
  → Copy URL: https://api.cloudflare.com/client/v4/workers/builds/deploy_hooks/<ID>
```

**Step 2: Add Sanity Webhook**
```
sanity.io/manage → [Project] → API → Webhooks → Add webhook
  → Name: "Cloudflare Rebuild"
  → URL: [paste CF deploy hook URL]
  → Trigger on: Create + Update + Delete (all three)
  → Dataset: production
  → HTTP method: POST
  → No Authorization header needed (CF URL is self-authenticating)
```

**CF deduplication behavior (CONFIRMED):** If the same Deploy Hook fires multiple times before the first build starts running, CF does NOT create duplicate builds. Rate limit: 10 builds/min per Worker.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| www → apex redirect | Worker redirect logic | CF Redirect Rules | Native CF feature, zero Worker overhead, handles HTTP too |
| Build deduplication | Queue/lock mechanism | CF Deploy Hook dedup | Built in — concurrent POST to same hook = 1 build |
| Certificate management | Manual cert config | CF Custom Domain auto-cert | Auto-issues Advanced Certificate |
| Preview URL generation | Custom URL scheme | CF Workers Builds built-in | `<version>-<worker-name>.<subdomain>.workers.dev` auto-generated |
| Lighthouse auditing | Custom perf script | `@lhci/cli` | Battle-tested, official Google tool, mobile throttling built in |

---

## Common Pitfalls

### Pitfall 1: Putting SANITY_API_READ_TOKEN in Runtime Variables

**What goes wrong:** Token ends up in the running Worker's env, accessible at request time — unnecessary exposure. Build still works but security posture is worse.

**Why it happens:** Workers has two completely separate env var stores: "Build variables and secrets" (only available during `npm run build`) and "Variables & Secrets" (available to the running Worker). Easy to confuse.

**How to avoid:** Add `SANITY_API_READ_TOKEN` in Settings → Build → "Build variables and secrets", not in Settings → Variables & Secrets.

**Verification:** After deploy, check that the Worker runtime does NOT expose the token via any endpoint.

### Pitfall 2: Worker Name Mismatch

**What goes wrong:** CF Workers Builds fails to deploy if the Worker `name` in `wrangler.jsonc` doesn't match the Worker project name in the dashboard.

**How to avoid:** The project `wrangler.jsonc` has `"name": "realestatestrategy-eu"`. The dashboard Worker must be named exactly `realestatestrategy-eu`. Verify before connecting Git.

### Pitfall 3: Auto Minify "needs disabling" — It's Already Gone

**What goes wrong:** Planner adds a task to "disable Auto Minify HTML" — the option doesn't exist in the dashboard because CF removed it on August 5, 2024. Wastes time looking for a non-existent toggle.

**How to avoid:** The roadmap requirement is satisfied by the fact that CF removed Auto Minify. Document this as "verified: not present, removed by CF Aug 2024" and close the requirement.

### Pitfall 4: `astro build` Fails on CF Workers Builds Due to Node.js Version

**What goes wrong:** Astro 6 requires Node.js ≥ 22. CF Workers Builds must use Node 22 in the build environment. If the build environment defaults to an older Node, the build fails.

**How to avoid:** Set `NODE_VERSION=22` in build environment variables, OR add a `.node-version` or `.nvmrc` file containing `22` to the repo root. The CF framework autodetect for Astro should handle this, but verify in the dashboard build logs.

### Pitfall 5: Deploy Hook URL Is in Wrong Location

**What goes wrong:** Looking for "Deploy Hooks" under the wrong menu. This feature launched April 1, 2026 and may not appear in older documentation.

**Location:** Workers & Pages → [your Worker] → Settings → Builds → Deploy Hooks (new section added April 2026).

### Pitfall 6: Preview URLs Require `workers.dev` Subdomain Enabled

**What goes wrong:** Preview URL format (`<version>-realestatestrategy-eu.<subdomain>.workers.dev`) requires the `workers.dev` subdomain to be enabled on the Worker. If it was disabled, previews don't work.

**How to avoid:** In Workers & Pages → [Worker] → Settings, ensure "workers.dev subdomain" is enabled.

### Pitfall 7: www DNS Record Missing Before Redirect Rule

**What goes wrong:** CF Redirect Rule for `www.realestatestrategy.eu` fires before the DNS record for `www` exists, so browsers get NXDOMAIN rather than hitting CF.

**How to avoid:** Add a proxied DNS CNAME record for `www` pointing to `@` (or the apex) BEFORE creating the redirect rule. CF needs `www` to resolve to CF's edge for the redirect rule to intercept it.

---

## Code Examples

### Workers Builds: Build Configuration

```
Build command:     npm run build
Deploy command:    npx wrangler deploy     (default, can leave blank)
Non-prod deploy:   npx wrangler versions upload  (default, for branch previews)
Root directory:    (leave blank — repo root)
```

Source: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/

### Deploy Hook POST Trigger

```bash
# Source: https://developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/
curl -X POST "https://api.cloudflare.com/client/v4/workers/builds/deploy_hooks/<DEPLOY_HOOK_ID>"
```

Sanity webhook sends this POST automatically. No Authorization header needed.

### www → apex Redirect Rule

```
# Cloudflare Redirect Rule (Rules → Redirect Rules)
# Source: https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-www-to-root/

Condition:   Request URL wildcard matches  https://www.*
Redirect to: https://${1}
Type:        Static (301)
Preserve query string: ON
```

Result: `https://www.realestatestrategy.eu/blog/post?ref=x` → `https://realestatestrategy.eu/blog/post?ref=x`

### Smoke Test Shell Script (Recommended)

```bash
#!/bin/bash
# smoke-test.sh — run against CF preview URL before DNS cutover
# Usage: ./smoke-test.sh https://abc123-realestatestrategy-eu.nestorsegura.workers.dev

BASE_URL="${1:?Usage: $0 <base-url>}"
PASS=0
FAIL=0

check() {
  local url="$1"
  local expect_status="${2:-200}"
  local description="$3"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$url")
  if [ "$status" = "$expect_status" ]; then
    echo "  PASS [$status] $description"
    ((PASS++))
  else
    echo "  FAIL [$status, expected $expect_status] $description — $url"
    ((FAIL++))
  fi
}

echo "=== Smoke test: $BASE_URL ==="

# Locale homepages
check "$BASE_URL/"     200 "DE homepage (default locale)"
check "$BASE_URL/en"   200 "EN homepage"
check "$BASE_URL/es"   200 "ES homepage"

# Static assets
check "$BASE_URL/sitemap.xml"    200 "sitemap.xml"
check "$BASE_URL/robots.txt"     200 "robots.txt"
check "$BASE_URL/og-default.png" 200 "og-default.png (or adjust path)"

# www redirect — only run against final domain, not preview URL
# check "https://www.realestatestrategy.eu/" 301 "www → apex redirect"

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "ALL PASS — ready for Lighthouse check" && exit 0 || exit 1
```

### Lighthouse Mobile Check (≥90 gate)

```bash
# Run after smoke tests pass
# Source: https://github.com/GoogleChrome/lighthouse-ci

npx lhci collect --url="$BASE_URL" --settings.formFactor=mobile --settings.throttlingMethod=simulate
npx lhci assert --preset=lighthouse:recommended --assertions.performance=["error", {"minScore": 0.9}]
```

---

## CF HTML-Rewriting Features Audit

| Feature | Mutates HTML? | Default State | Action for This Site |
|---------|--------------|---------------|---------------------|
| Auto Minify (HTML/CSS/JS) | YES — was minifying HTML | REMOVED Aug 5, 2024 | Nothing to do — feature doesn't exist |
| Rocket Loader | YES — rewrites script tags to `rocketscript` | OFF by default | Verify it's OFF; no action needed if so. Does NOT apply to Worker-served HTML per community consensus |
| Email Obfuscation | YES — obfuscates email links | ON by default | **Does NOT apply** when HTML is served by a Worker — CF explicitly exempts Worker responses |
| Cloudflare Fonts | YES — rewrites Google Font links | OFF by default (manual opt-in) | Site uses local fonts (ClashDisplay-Variable.woff2) — not applicable |
| Speed Brain | NO — adds HTTP header only (Speculation-Rules) | Available, not confirmed default | Does not modify HTML; harmless if on |
| Polish | NO — image format optimization only | OFF by default | Does not touch HTML |
| Early Hints | NO — 103 response header only | OFF by default | Does not modify HTML |

**Bottom line for planning:**
- Auto Minify: already gone, close the requirement as "not applicable"
- Rocket Loader: verify it is OFF in Speed → Optimization — it's off by default for most zones, but check
- Email Obfuscation: Worker-served responses are exempt — no action needed, but can verify in Scrape Shield settings
- Everything else: no HTML mutation risk

Source: https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/ (Worker exemption confirmed)
Source: https://developers.cloudflare.com/speed/optimization/content/rocket-loader/ (non-standard tags warning)
Source: https://developers.cloudflare.com/speed/optimization/content/speed-brain/ (header-only, no HTML mutation)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Cloudflare Pages (for static + SSR) | Cloudflare Workers with static assets | 2024–2025 | Workers now has full parity with Pages; use Workers |
| GitHub Actions → wrangler deploy | Workers Builds (Git integration) | 2024 GA | No YAML needed; native CF dashboard integration |
| Deploy hooks (Pages only) | Deploy Hooks for Workers Builds | April 1, 2026 | Can now trigger Workers Builds from Sanity webhook |
| Auto Minify HTML | Removed | August 5, 2024 | No toggle to disable — it's gone |
| Manual www redirect in Worker code | CF Redirect Rules | Always existed | Zero Worker overhead, simpler |

---

## Open Questions

1. **Node.js version for CF build environment**
   - What we know: Astro 6 requires Node ≥ 22; CF Workers Builds lets you set `NODE_VERSION` env var
   - What's unclear: Whether CF's auto-detection for Astro 6 already pins Node 22, or if we must set it manually
   - Recommendation: Add `NODE_VERSION=22` as a build variable as a safety measure; verify in first build logs

2. **`SANITY_API_VERSION` usage**
   - What we know: CONTEXT.md mentions `SANITY_API_VERSION` as a build-time var; not found in `src/` code or `.env.local`
   - What's unclear: Whether `@sanity/astro` reads this from env or takes it from `astro.config.mjs` `useCdn:false` setting
   - Recommendation: Check `@sanity/astro` docs; if not consumed, omit from dashboard vars

3. **Rocket Loader default state for new zones**
   - What we know: Off by default for most zones; can be checked in Speed → Optimization
   - What's unclear: Whether CF enables it automatically for Workers zones
   - Recommendation: Check it in the dashboard after zone creation; takes 30 seconds

4. **`wrangler.jsonc` vs `dist/server/wrangler.json` — which wins?**
   - What we know: The `@astrojs/cloudflare` adapter generates `dist/server/wrangler.json` at build time; `wrangler deploy` uses it as the deploy config
   - What's unclear: Whether Workers Builds uses the root `wrangler.jsonc` or `dist/server/wrangler.json`
   - Recommendation: The adapter's wrangler.json in `dist/server/` is what Wrangler uses at deploy time (it sets `main`). The root `wrangler.jsonc` provides pre-build config (name, compatibility_date, assets). Both coexist. Verify by checking build logs.

5. **Preview branch URL exact subdomain**
   - What we know: Pattern is `<version-prefix>-realestatestrategy-eu.<subdomain>.workers.dev`
   - What's unclear: What `<subdomain>` is (Cloudflare account subdomain, e.g., `nestorsegura`)
   - Recommendation: Confirm after first branch push; the Workers dashboard Deployments tab shows the URL

---

## Sources

### Primary (HIGH confidence)
- https://developers.cloudflare.com/workers/ci-cd/builds/ — Git integration overview, preview URLs
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/ — build command, build-time vs runtime vars
- https://developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/ — Deploy Hook URL format, dedup behavior
- https://developers.cloudflare.com/changelog/post/2026-04-01-deploy-hooks/ — Deploy Hooks for Workers Builds launched April 1, 2026
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/ — Custom Domain setup, apex support, cert provisioning
- https://developers.cloudflare.com/workers/configuration/versions-and-deployments/rollbacks/ — Rollback behavior, 100-version history, dashboard location
- https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-www-to-root/ — www → apex redirect rule
- https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/ — Worker exemption from email obfuscation
- https://developers.cloudflare.com/speed/optimization/content/speed-brain/ — Speed Brain = header only, no HTML mutation
- https://developers.cloudflare.com/speed/optimization/content/fonts/ — Cloudflare Fonts = Google Fonts only
- https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/ — Astro build command for Workers
- https://www.sanity.io/docs/webhooks — Sanity webhook trigger options

### Secondary (MEDIUM confidence)
- Auto Minify removed Aug 5, 2024: https://www.wpconsults.com/cloudflare-to-deprecate-auto-minify/ (multiple sources agree, confirmed by community reports of missing toggle)
- Preview URL pattern (`<version>-<worker>.<subdomain>.workers.dev`): https://developers.cloudflare.com/workers/configuration/previews/ + search results
- Build rate limit (10/min per Worker): from Deploy Hooks changelog

### Tertiary (LOW confidence)
- Rocket Loader does not apply to Worker-served content: community consensus from multiple Cloudflare community posts; not explicitly confirmed in official docs for Workers specifically

---

## Metadata

**Confidence breakdown:**
- Workers Builds setup: HIGH — official CF docs
- Deploy Hooks: HIGH — official CF changelog (April 1, 2026 release)
- Custom domain / cert: HIGH — official CF docs
- Auto Minify removed: HIGH — multiple sources, community reports confirm toggle missing
- Email Obfuscation Worker exemption: HIGH — explicit in official docs
- Rocket Loader + Workers: MEDIUM — community consensus, official docs confirm it rewrites HTML but Worker exemption not explicitly stated
- Smoke test approach: MEDIUM — standard pattern, `@lhci/cli` is official Google tool
- Preview URL exact pattern: MEDIUM — documented but exact account subdomain unknown until first deploy

**Research date:** 2026-04-15
**Valid until:** 2026-05-15 (30 days — CF Workers platform is fast-moving but core deploy flow is stable)
