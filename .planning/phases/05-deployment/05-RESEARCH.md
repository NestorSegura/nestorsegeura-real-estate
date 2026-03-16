# Phase 5: Deployment - Research

**Researched:** 2026-03-16
**Domain:** Next.js 15 standalone VPS deployment — PM2, Nginx, Let's Encrypt, Sanity revalidation webhook
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Deploy workflow:**
- Git pull on VPS: SSH in, `git pull`, `npm install`, `npm run build`, restart PM2
- Brief restart acceptable — no zero-downtime requirement (B2B landing page, low concurrent traffic)
- Git-based rollback: deploy.sh saves previous commit hash, supports `deploy.sh rollback` to revert
- Repo path on server: Claude's discretion

**Server environment:**
- Nginx reverse proxy: deploy script should include Nginx config (reverse proxy to Next.js port)
- SSL via Let's Encrypt / Certbot with auto-renewal
- Environment variables: Claude's discretion (balance simplicity and security)
- Node.js version check: Claude's discretion

**PM2 configuration:**
- Fork mode (single process) — sufficient for B2B landing page traffic
- Auto-restart on crash + PM2 startup hook for server reboot survival
- Default PM2 logs (~/.pm2/logs/) — use `pm2 logs` to view
- Process name: `nestorsegura.com`

**Revalidation webhook:**
- Authentication method: Claude's discretion (shared secret vs HMAC — balance security and simplicity)
- Tag-based revalidation — revalidate only affected content tags (page, post, settings), not full cache
- Response verbosity: Claude's discretion
- Draft/preview handling: Claude's discretion (based on whether preview mode is in scope)

### Claude's Discretion
- Repo path on VPS (standard convention)
- Env var management approach on server
- Node.js version verification in deploy script
- Webhook auth method (shared secret vs HMAC)
- Webhook response detail level
- Whether webhook handles drafts or published-only

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

## Summary

This phase covers four concrete areas: (1) enabling `output: 'standalone'` in next.config.ts and writing a deploy.sh that handles git-based rollback, static asset copying, and PM2 restart; (2) writing an ecosystem.config.js for PM2 in fork mode with startup persistence; (3) setting up the Nginx reverse proxy with SSL via Certbot; and (4) implementing the `/api/revalidate` webhook handler using `parseBody` from `next-sanity/webhook`.

The Next.js standalone output produces `.next/standalone/server.js` — a self-contained Node.js server that does **not** automatically serve `public/` or `.next/static/`. These must be manually copied into the standalone directory after every build. This is the single most commonly missed step in standalone deployments and causes missing static assets in production.

For the webhook, `next-sanity/webhook` already ships an HMAC-based `parseBody` function that validates the `sanity-webhook-signature` header using the shared secret. The project already has `SANITY_WEBHOOK_SECRET` defined in `.env.local.template`. The four Sanity document types in this project are `page`, `post`, `siteSettings`, and `author` — all need to be handled in the revalidation route.

**Primary recommendation:** Use `output: 'standalone'` + PM2 serving `.next/standalone/server.js` on port 3000 behind Nginx. The deploy.sh must include the static asset copy commands; forgetting them is the #1 production breakage point.

---

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Next.js standalone output | 15.x (already installed) | Minimal Node.js server bundle | Eliminates need to install node_modules on server |
| PM2 | 5.x | Process manager | Auto-restart, startup persistence, log management |
| Nginx | 1.18+ (Ubuntu apt) | Reverse proxy + SSL termination | Industry standard for VPS, handles TLS offload |
| Certbot (certbot-nginx plugin) | latest | Let's Encrypt SSL automation | Auto-renewal via systemd timer |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| `next-sanity/webhook` | 11.x (already installed) | HMAC webhook body parsing and validation | `/api/revalidate` handler — already in project |
| nvm | any | Node.js version management on server | Version check in deploy.sh |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `output: 'standalone'` | `npm run start` (regular build) | Regular build requires full node_modules on server; standalone is smaller and self-contained |
| PM2 fork mode | PM2 cluster mode | Cluster mode shares port via multiple workers — overkill for single B2B landing page; fork mode is simpler |
| Certbot nginx plugin | Manual cert config | Manual is error-prone; certbot --nginx auto-patches nginx config |

**Installation on server (run once):**
```bash
npm install -g pm2
sudo apt install nginx certbot python3-certbot-nginx
```

---

## Architecture Patterns

### Recommended Directory Layout on VPS
```
/var/www/nestorsegura.com/     # Repo root (standard /var/www convention)
├── .next/
│   └── standalone/            # Produced by next build with output: 'standalone'
│       ├── server.js          # Entry point for PM2
│       ├── .next/
│       │   └── static/        # Copied here post-build
│       └── public/            # Copied here post-build
├── ecosystem.config.js        # PM2 config (committed to repo)
├── deploy.sh                  # Deploy script (committed to repo)
└── .env.production            # Env vars (NOT committed — created manually on server)
```

### Pattern 1: Standalone Build + Static Asset Copy

**What:** `output: 'standalone'` creates `.next/standalone/` with only required files. The `public/` and `.next/static/` directories must be copied into it after every build — they are not included automatically.

**When to use:** Every deployment. Missing this step causes broken images, missing CSS, 404s on static files.

```typescript
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
// next.config.ts — add output: 'standalone'
const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
}
```

```bash
# After next build — these two commands are MANDATORY
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

### Pattern 2: PM2 serving standalone server.js

**What:** PM2 runs `node .next/standalone/server.js` in fork mode. The server reads `PORT` and `HOSTNAME` env vars.

**When to use:** Production process management.

```javascript
// ecosystem.config.js
// Source: https://pm2.keymetrics.io/docs/usage/application-declaration/
module.exports = {
  apps: [
    {
      name: 'nestorsegura.com',
      script: '.next/standalone/server.js',
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
}
```

### Pattern 3: deploy.sh with git-based rollback

**What:** Script saves previous commit hash before pulling, enables `deploy.sh rollback` to revert.

```bash
#!/bin/bash
# deploy.sh
set -e

APP_DIR="/var/www/nestorsegura.com"
PROCESS_NAME="nestorsegura.com"
ROLLBACK_FILE="$APP_DIR/.deploy_rollback_hash"

cd "$APP_DIR"

if [ "$1" = "rollback" ]; then
  if [ ! -f "$ROLLBACK_FILE" ]; then
    echo "No rollback hash found."
    exit 1
  fi
  ROLLBACK_HASH=$(cat "$ROLLBACK_FILE")
  echo "Rolling back to $ROLLBACK_HASH..."
  git checkout "$ROLLBACK_HASH"
else
  # Save current commit for potential rollback
  git rev-parse HEAD > "$ROLLBACK_FILE"

  # Node version check (uses .nvmrc if present)
  node --version

  git pull
  npm install --omit=dev
  npm run build

  # CRITICAL: copy static assets into standalone directory
  cp -r public .next/standalone/
  cp -r .next/static .next/standalone/.next/
fi

# Restart PM2 process (or start if not running)
pm2 restart "$PROCESS_NAME" --update-env || pm2 start ecosystem.config.js
pm2 save
echo "Deploy complete."
```

### Pattern 4: Nginx reverse proxy config

**What:** Nginx terminates SSL and proxies to Next.js on port 3000. Streaming support requires disabling buffering.

```nginx
# /etc/nginx/sites-available/nestorsegura.com
server {
    listen 80;
    server_name nestorsegura.com www.nestorsegura.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name nestorsegura.com www.nestorsegura.com;

    ssl_certificate /etc/letsencrypt/live/nestorsegura.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nestorsegura.com/privkey.pem;

    # Disable buffering for Next.js streaming support
    # Source: https://nextjs.org/docs/app/guides/self-hosting#streaming-and-suspense
    proxy_buffering off;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Pattern 5: /api/revalidate webhook handler

**What:** Uses `parseBody` from `next-sanity/webhook` for HMAC validation, then calls `revalidateTag(body._type)` for the affected document type.

**Auth method recommendation:** Use `parseBody` from `next-sanity/webhook` — it performs HMAC-SHA256 verification against the `sanity-webhook-signature` header automatically. This is equivalent to "HMAC" auth but provided by the library without any custom crypto code. The secret is `SANITY_WEBHOOK_SECRET` (already defined in project's `.env.local.template`).

**Response verbosity recommendation:** Return a JSON body with `{ revalidated: true, type: body._type, now: Date.now() }` — enough detail to debug from Sanity webhook delivery logs without leaking internals.

**Draft/preview recommendation:** Handle published-only. The project uses `defineLive` for preview via draft mode at `/api/draft-mode/enable` — the revalidation webhook only fires on published content changes, which is correct.

```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/revalidateTag
// + next-sanity/webhook parseBody (verified against installed type definitions)
// src/app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

// Document types in this project: page, post, siteSettings, author
const KNOWN_TYPES = ['page', 'post', 'siteSettings', 'author'] as const

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<{ _type: string }>(
      req,
      process.env.SANITY_WEBHOOK_SECRET,
    )

    if (!isValidSignature) {
      return new Response('Invalid signature', { status: 401 })
    }

    if (!body?._type) {
      return new Response('Bad request — missing _type', { status: 400 })
    }

    revalidateTag(body._type)

    return NextResponse.json({
      revalidated: true,
      type: body._type,
      now: Date.now(),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[revalidate]', message)
    return new Response(message, { status: 500 })
  }
}
```

**Sanity webhook configuration (in Sanity manage dashboard):**
- URL: `https://nestorsegura.com/api/revalidate`
- Trigger on: Create, Update, Delete
- Filter: `_type in ["page", "post", "siteSettings", "author"]`
- HTTP method: POST
- Secret: value of `SANITY_WEBHOOK_SECRET`

### Pattern 6: PM2 startup persistence

**What:** Two commands register PM2 to survive server reboots.

```bash
# Run once after first deploy — generates systemd unit
pm2 startup
# Copy-paste the output command (it includes the sudo path)
# Then:
pm2 save
```

### Anti-Patterns to Avoid
- **Missing static asset copy:** Forgetting `cp -r public .next/standalone/` and `cp -r .next/static .next/standalone/.next/` after build. This is the #1 cause of broken production deployments with standalone mode. The server.js only serves files that are physically present in the standalone directory.
- **Using `NEXT_PUBLIC_` prefix for webhook secret:** The secret is only read server-side in the API route. Using `NEXT_PUBLIC_SANITY_WEBHOOK_SECRET` would expose it in the client bundle. Use `SANITY_WEBHOOK_SECRET` (no prefix) — already correct in the project template.
- **Running `pm2 start` on re-deploys without `restart`:** Use `pm2 restart` (or `reload` for near-zero-downtime) on subsequent deploys, not `pm2 start` which fails if process already exists.
- **Setting `proxy_pass http://localhost:3000`:** On some Linux systems, `localhost` resolves to IPv6 `::1` while Node listens on IPv4 `0.0.0.0`. Use `127.0.0.1:3000` explicitly.
- **Storing env vars in ecosystem.config.js for secrets:** ecosystem.config.js is committed to git. Put only `NODE_ENV`, `PORT`, `HOSTNAME` there. Secrets go in `.env.production` on the server, loaded separately.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Webhook signature verification | Custom crypto.createHmac code | `parseBody` from `next-sanity/webhook` | Already in project dependencies; handles raw body buffering, header extraction, and HMAC comparison correctly |
| SSL certificate issuance and renewal | Manual openssl + cron | `certbot --nginx` + systemd timer | Certbot auto-patches nginx config and sets up auto-renewal |
| Process restart on crash | Custom shell watchdog | PM2 auto-restart | PM2 handles crash detection, backoff, memory limits |

**Key insight:** `next-sanity` ships HMAC webhook validation — use it. Writing custom crypto verification is error-prone (raw body buffering issues, timing attacks) and entirely unnecessary here.

---

## Common Pitfalls

### Pitfall 1: Static Assets Missing in Production
**What goes wrong:** Images, CSS, and JS return 404 after deployment. The site renders but is unstyled or broken.
**Why it happens:** `output: 'standalone'` creates a minimal server bundle. The `public/` and `.next/static/` directories are intentionally excluded from the standalone folder — they are "ideally handled by a CDN" per the Next.js docs. Without a CDN, they must be manually copied.
**How to avoid:** The deploy.sh must always run these two commands after `npm run build`:
```bash
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```
**Warning signs:** `GET /_next/static/...` returns 404; images from `public/` are broken; the page loads but has no styling.

### Pitfall 2: Nginx Buffering Breaks Streaming
**What goes wrong:** Server Components with Suspense or loading states hang or appear broken.
**Why it happens:** Nginx buffers the full response before forwarding by default, which breaks HTTP streaming.
**How to avoid:** Add `proxy_buffering off;` to the Nginx server block.
**Source:** https://nextjs.org/docs/app/guides/self-hosting#streaming-and-suspense

### Pitfall 3: PM2 Startup Not Persisted After Node Upgrade
**What goes wrong:** After upgrading Node.js (e.g., via nvm), PM2 startup breaks — the systemd unit has the old Node path hardcoded.
**How to avoid:** After any Node.js version change: `pm2 unstartup` then `pm2 startup` then `pm2 save`.

### Pitfall 4: `revalidateTag` Called But Cache Not Cleared
**What goes wrong:** Webhook returns 200 but the live site still shows stale content.
**Why it happens:** With `defineLive` from `next-sanity`, the tag passed to `revalidateTag` must match the tag used when fetching. The `_type` value from the Sanity webhook payload (e.g., `"page"`, `"post"`) must match exactly what `defineLive`/`sanityFetch` uses as its cache tag.
**How to avoid:** Confirm the tag values. `defineLive` uses `_type` values from Sanity natively — passing `body._type` directly to `revalidateTag` is the correct pattern.

### Pitfall 5: `npm run build` Uses Turbopack in Production
**What goes wrong:** The `package.json` has `"build": "next build --turbopack"`. Turbopack is still experimental for production builds as of Next.js 15.
**How to avoid:** For the production build step in deploy.sh, either (a) accept the Turbopack build (it works but is experimental) or (b) override to `npx next build` (no Turbopack flag) for stability. Verify the current Turbopack production stability before committing to it.
**Warning signs:** Build warnings about Turbopack being experimental.

### Pitfall 6: Environment Variables Not Loaded by PM2
**What goes wrong:** `process.env.SANITY_API_READ_TOKEN` is undefined at runtime, causing the `defineLive` throw.
**Why it happens:** PM2 `ecosystem.config.js` only sets `NODE_ENV`, `PORT`, `HOSTNAME`. Sanity secrets must be available to the Node process separately.
**How to avoid:** Use a `.env.production` file in the project root on the server. Next.js automatically reads `.env.production` at startup. Do not commit this file. Document in README that it must be created manually on the server.

---

## Code Examples

### next.config.ts with standalone output
```typescript
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
```

### Certbot SSL issuance (run once, after Nginx is installed and site is live on HTTP)
```bash
sudo certbot --nginx -d nestorsegura.com -d www.nestorsegura.com
# Certbot patches the nginx config automatically, adds ssl_certificate lines
# Auto-renewal via systemd timer is set up automatically
```

### Verify auto-renewal
```bash
sudo certbot renew --dry-run
```

### PM2 commands reference
```bash
pm2 start ecosystem.config.js    # First start
pm2 restart nestorsegura.com      # Subsequent deploys
pm2 reload nestorsegura.com       # Near-zero-downtime restart (sends SIGINT, waits)
pm2 logs nestorsegura.com         # View logs
pm2 status                        # Show all processes
pm2 save                          # Persist process list
pm2 startup                       # Generate systemd unit
```

### .env.production file structure (created manually on server, never committed)
```bash
# /var/www/nestorsegura.com/.env.production
NEXT_PUBLIC_SANITY_PROJECT_ID=0cn4widw
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SITE_URL=https://nestorsegura.com
SANITY_API_READ_TOKEN=sk...
SANITY_WEBHOOK_SECRET=<openssl rand -hex 32>
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `npm run start` from full build dir | `node .next/standalone/server.js` | Standalone is ~80% smaller, ships only required files |
| Manual SSL cert renewal via cron | Certbot systemd timer (auto) | Set-and-forget renewal |
| PM2 `--watch` mode | Explicit `pm2 restart` in deploy script | Avoids accidental restarts during development |

**Deprecated/outdated:**
- Next.js `serverless` target: removed, replaced by `output: 'standalone'`
- PM2 cluster mode for Next.js: works but unnecessary for single-instance VPS; fork mode is the correct choice here

---

## Open Questions

1. **Turbopack in production build (`npm run build --turbopack`)**
   - What we know: The project's package.json has `"build": "next build --turbopack"`. Turbopack production builds were marked experimental in Next.js 15.
   - What's unclear: Whether Turbopack production builds are stable in Next.js 15.5.12 specifically.
   - Recommendation: The deploy.sh task should use `npm run build` as-is (uses the project's script). If build failures occur in production, override with `npx next build` (no turbopack flag). The planner should note this as a potential issue to watch.

2. **`defineLive` cache tag behavior for webhook revalidation**
   - What we know: `defineLive` from `next-sanity/live` handles cache tags automatically. Passing `body._type` to `revalidateTag` is the documented pattern.
   - What's unclear: Whether `defineLive` uses `_type` directly as the cache tag or uses an internal key. This should be verified with a smoke test after deploy.
   - Recommendation: The task should include an end-to-end test step: publish a `page` document change in Sanity, verify the webhook fires and the live site updates within 60s.

---

## Sources

### Primary (HIGH confidence)
- `https://nextjs.org/docs/app/api-reference/config/next-config-js/output` — standalone output, static asset copy requirement, version 16.1.6 (2026-02-27)
- `https://nextjs.org/docs/app/guides/self-hosting` — env vars, caching, Nginx streaming/buffering config, version 16.1.6 (2026-02-27)
- `https://nextjs.org/docs/app/getting-started/deploying` — Node.js server deployment overview
- `node_modules/next-sanity/dist/webhook/index.d.ts` — verified `parseBody` signature locally in the project
- `.env.local.template` — verified `SANITY_WEBHOOK_SECRET` env var name (no NEXT_PUBLIC prefix)
- `src/sanity/schemas/documents/` — verified document type names: `page`, `post`, `siteSettings`, `author`
- `https://pm2.keymetrics.io/docs/usage/startup/` — pm2 startup persistence commands

### Secondary (MEDIUM confidence)
- `https://pm2.keymetrics.io/docs/usage/application-declaration/` — ecosystem.config.js format, verified via WebFetch
- `https://www.sanity.io/guides/sanity-webhooks-and-on-demand-revalidation-in-nextjs` — complete API route pattern with `parseBody`, revalidateTag; verified via WebFetch

### Tertiary (LOW confidence)
- WebSearch: Next.js 15 + PM2 + Nginx deployment pattern — multiple consistent sources, considered MEDIUM; Nginx config pattern confirmed via multiple guides

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against official Next.js docs (2026-02-27) and locally installed package
- Standalone output + static copy requirement: HIGH — directly from official Next.js output docs
- PM2 config: HIGH — verified via official PM2 docs + local package type definitions
- Webhook handler: HIGH — `parseBody` signature verified from installed `next-sanity` type defs; env var name verified from project template
- Nginx streaming config: HIGH — from official Next.js self-hosting docs
- Pitfalls: HIGH — Pitfall 1 (static assets) directly from official docs; others from multiple consistent sources

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (30 days — Next.js deployment APIs are stable)
