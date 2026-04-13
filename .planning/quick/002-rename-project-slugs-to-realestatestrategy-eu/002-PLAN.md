# Quick Task 002: Rename project slugs to realestatestrategy-eu

## Objective
Rename project identifiers from `nestorsegura-real-estate` to `realestatestrategy-eu` to match the new domain.

## Scope
- `package.json` `name`
- `package-lock.json` `name` (both occurrences)
- `wrangler.jsonc` `name` (Cloudflare Worker name)
- `src/sanity/config.ts` `name` + `title` (Sanity Studio workspace)

## Risks / Side effects
- **Cloudflare Worker rename**: Deploying with the new name creates a NEW worker (`realestatestrategy-eu.workers.dev`). The previous worker (`nestorsegura-real-estate.workers.dev`) will remain on the account until manually deleted. User confirmed they accept this.
- Custom domain routing (if set up) must be re-bound to the new worker. Handled at Cloudflare dashboard / wrangler deploy time.
- Sanity Studio workspace name is a local identifier; no server-side impact. Project ID (`0cn4widw`) unchanged.

## Out of scope
- `sanity.cli.ts` still uses `NEXT_PUBLIC_` env prefix (known issue — Astro uses `PUBLIC_`). Separate bug.
