# Quick Task 001: Update domain to realestatestrategy.eu

## Objective
Replace the live domain `nestorsegura.com` with `realestatestrategy.eu` across project config/templates.

## Scope
Only `.env.local.template` contains live references. Planning docs (historical record) are not touched. Project/worker name slugs (`package.json`, `wrangler.jsonc`, Sanity config) are intentionally NOT renamed — the Cloudflare worker name is tied to the deployed worker and changing it risks breaking deployment. Out of scope unless explicitly requested.

## Tasks
1. Update `.env.local.template` line 2 header comment: `nestorsegura.com` → `realestatestrategy.eu`
2. Update `.env.local.template` line 35 example: `https://nestorsegura.com` → `https://realestatestrategy.eu`

## Verification
- `rg "nestorsegura\.com"` returns zero matches outside `.planning/`, `dist/`, `.next/`.
