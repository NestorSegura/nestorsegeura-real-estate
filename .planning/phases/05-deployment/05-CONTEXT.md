# Phase 5: Deployment - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Production VPS deployment on Hostinger — standalone Next.js build served behind Nginx with PM2 process management, automated deploy script, and Sanity revalidation webhook. No CI/CD pipeline, no containerization, no CDN — straightforward VPS deployment.

</domain>

<decisions>
## Implementation Decisions

### Deploy workflow
- Git pull on VPS: SSH in, `git pull`, `npm install`, `npm run build`, restart PM2
- Brief restart acceptable — no zero-downtime requirement (B2B landing page, low concurrent traffic)
- Git-based rollback: deploy.sh saves previous commit hash, supports `deploy.sh rollback` to revert
- Repo path on server: Claude's discretion

### Server environment
- Nginx reverse proxy: deploy script should include Nginx config (reverse proxy to Next.js port)
- SSL via Let's Encrypt / Certbot with auto-renewal
- Environment variables: Claude's discretion (balance simplicity and security)
- Node.js version check: Claude's discretion

### PM2 configuration
- Fork mode (single process) — sufficient for B2B landing page traffic
- Auto-restart on crash + PM2 startup hook for server reboot survival
- Default PM2 logs (~/.pm2/logs/) — use `pm2 logs` to view
- Process name: `nestorsegura.com`

### Revalidation webhook
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

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Key constraint: Hostinger VPS (not containerized, not serverless).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-deployment*
*Context gathered: 2026-03-16*
