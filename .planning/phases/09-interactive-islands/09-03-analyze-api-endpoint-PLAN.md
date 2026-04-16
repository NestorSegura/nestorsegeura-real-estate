---
phase: 09-interactive-islands
plan: 03
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - astro.config.mjs
  - tsconfig.json
  - src/pages/api/analyze.ts
autonomous: true

must_haves:
  truths:
    - "@astrojs/react integration is installed and registered, enabling React islands in subsequent plans"
    - "POST /api/analyze accepts JSON {url, locale} and returns 200 with JSON {url, scores: {performance, seo, accessibility, bestPractices}}"
    - "POST /api/analyze with invalid body returns 400 with JSON error"
    - "OPTIONS /api/analyze returns CORS preflight response"
    - "The /api/analyze route runs as a Cloudflare Worker (prerender=false) — rest of site stays static"
  artifacts:
    - path: "src/pages/api/analyze.ts"
      provides: "POST + OPTIONS handlers, prerender=false, mock score generator"
      exports: ["POST", "OPTIONS", "prerender"]
    - path: "astro.config.mjs"
      provides: "react() in integrations array"
    - path: "tsconfig.json"
      provides: "jsx: react-jsx, jsxImportSource: react"
  key_links:
    - from: "src/pages/api/analyze.ts"
      to: "@astrojs/cloudflare adapter"
      via: "export const prerender = false (opts route into Worker on-demand mode)"
      pattern: "prerender\\s*=\\s*false"
---

<objective>
Two parallel prerequisites for the /analyse React island:
1. Install + register `@astrojs/react` (currently react/react-dom installed but integration NOT in astro.config.mjs — confirmed in 09-RESEARCH.md).
2. Create `/api/analyze` Cloudflare Worker endpoint with `prerender = false`, returning mock PageSpeed-like scores.

Purpose: Unblocks plan 09-04 (React island for /analyse pages) AND satisfies INTR-03 (Cloudflare Worker endpoint).
Output: React integration wired, API endpoint live, mock scores returnable.
</objective>

<execution_context>
@/Users/nestorsegura/.claude/get-shit-done/workflows/execute-plan.md
@/Users/nestorsegura/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/phases/09-interactive-islands/09-CONTEXT.md
@.planning/phases/09-interactive-islands/09-RESEARCH.md
@astro.config.mjs
@tsconfig.json
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install @astrojs/react and register integration</name>
  <files>
package.json
astro.config.mjs
tsconfig.json
  </files>
  <action>
1. Run `npm install @astrojs/react` (use `--legacy-peer-deps` if peer-dep conflicts surface, consistent with the [07-01] convention in STATE.md). React 19 is already installed.

2. Edit `astro.config.mjs`:
```js
import react from '@astrojs/react';
// inside defineConfig({ integrations: [...existing, react()] })
```
Add `react()` AFTER any framework integrations that must run first (e.g., sanity), but before the cloudflare adapter is referenced. If integrations array doesn't exist, create it.

3. Edit `tsconfig.json` — under `compilerOptions`, add (merge, do not replace existing):
```json
"jsx": "react-jsx",
"jsxImportSource": "react"
```

4. Verify by running `astro check` (or `npm run build`) — must complete without "No matching renderer" or JSX errors.

Do NOT create any .tsx components in this task — that's plan 09-04. Only the integration wiring.
  </action>
  <verify>
`npm run build` succeeds. `npm ls @astrojs/react` shows installed version. astro.config.mjs has `react()` in integrations.
  </verify>
  <done>
React integration registered, build passes, ready for .tsx islands in 09-04.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create /api/analyze Cloudflare Worker endpoint</name>
  <files>src/pages/api/analyze.ts</files>
  <action>
Create `src/pages/api/analyze.ts` with this exact structure:

```ts
import type { APIRoute } from 'astro';

export const prerender = false; // CRITICAL: opts route into Cloudflare Worker on-demand mode

const ALLOWED_LOCALES = ['de', 'en', 'es'] as const;
type Locale = typeof ALLOWED_LOCALES[number];

interface AnalyzeRequest { url: string; locale: Locale }
interface Scores { performance: number; seo: number; accessibility: number; bestPractices: number }

function isValidUrl(input: string): boolean {
  try { const u = new URL(input); return u.protocol === 'http:' || u.protocol === 'https:'; }
  catch { return false; }
}

function mockScores(): Scores {
  // Stable-ish randomization band per RESEARCH.md pattern
  return {
    performance: Math.floor(Math.random() * 40) + 50,
    seo: Math.floor(Math.random() * 30) + 60,
    accessibility: Math.floor(Math.random() * 25) + 65,
    bestPractices: Math.floor(Math.random() * 20) + 70,
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // tighten to site origin in production via env if desired
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const OPTIONS: APIRoute = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const POST: APIRoute = async ({ request }) => {
  let body: AnalyzeRequest;
  try { body = await request.json() as AnalyzeRequest; }
  catch { return json({ error: 'Invalid JSON body' }, 400); }

  if (!body?.url || !isValidUrl(body.url)) return json({ error: 'Invalid url' }, 400);
  if (!body.locale || !ALLOWED_LOCALES.includes(body.locale)) return json({ error: 'Invalid locale' }, 400);

  // TODO LEAD-V2-01: replace with real PageSpeed Insights API call
  const scores = mockScores();

  return json({ url: body.url, locale: body.locale, scores }, 200);
};

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
```

Add a `// TODO LEAD-V2-01:` comment above mockScores call (PageSpeed integration deferred to LEAD-V2-01 per REQUIREMENTS.md).
  </action>
  <verify>
`astro build` succeeds. Build log shows the route picked up by Cloudflare adapter as on-demand (or absence of prerender for this file).

After `astro dev`:
```
curl -X POST http://localhost:4321/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com","locale":"de"}'
```
Returns 200 with JSON containing scores object.

```
curl -X POST http://localhost:4321/api/analyze -d '{}' -H 'Content-Type: application/json'
```
Returns 400.

```
curl -X OPTIONS http://localhost:4321/api/analyze -i
```
Returns 204 with CORS headers.
  </verify>
  <done>
Endpoint live, validates input, returns mock scores, CORS preflight works, marked prerender=false.
  </done>
</task>

</tasks>

<verification>
- `npm run build` passes
- /api/analyze responds correctly to POST (200 valid, 400 invalid) and OPTIONS (204)
- @astrojs/react in package.json + astro.config.mjs integrations
- tsconfig has react-jsx
</verification>

<success_criteria>
INTR-03 satisfied. React island prerequisite met for 09-04. Endpoint ready for production deployment to Cloudflare Workers.
</success_criteria>

<output>
After completion, create `.planning/phases/09-interactive-islands/09-03-SUMMARY.md`
</output>
