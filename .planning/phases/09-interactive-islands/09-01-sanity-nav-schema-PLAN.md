---
phase: 09-interactive-islands
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/sanity/schemas/documents/siteSettings.ts
  - src/lib/sanity.ts
autonomous: true

must_haves:
  truths:
    - "Editors can author per-locale (DE/EN/ES) navigation labels in Sanity Studio"
    - "Editors can set a single CTA label (per-locale) plus a CTA URL (Calendly link)"
    - "getSiteSettings() returns navItems and ctaLabel/ctaHref typed correctly"
  artifacts:
    - path: "src/sanity/schemas/documents/siteSettings.ts"
      provides: "navItems[] (key, labelDe, labelEn, labelEs), ctaLabel.{de,en,es}, ctaHref"
    - path: "src/lib/sanity.ts"
      provides: "Updated getSiteSettings GROQ projecting navItems, ctaLabel, ctaHref; SiteSettings TS interface extended"
  key_links:
    - from: "src/lib/sanity.ts"
      to: "src/sanity/schemas/documents/siteSettings.ts"
      via: "GROQ projection mirrors schema field names"
      pattern: "navItems\\[\\]|ctaLabel|ctaHref"
---

<objective>
Extend the Sanity siteSettings singleton with per-locale navigation items and a single global CTA (label per locale + URL). Update the data layer (`getSiteSettings()` GROQ + `SiteSettings` TypeScript interface) so Phase 9 nav components consume typed, locale-aware data. Pure data layer — no UI.

Purpose: Phase 9 navbar (plan 09-02) needs editable, per-locale nav labels and the Calendly CTA URL from Sanity. CONTEXT.md locks this as Sanity-driven (not messages/*.json).
Output: Updated schema + helper, ready for Phase 9 consumption.
</objective>

<execution_context>
@/Users/nestorsegura/.claude/get-shit-done/workflows/execute-plan.md
@/Users/nestorsegura/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/09-interactive-islands/09-CONTEXT.md
@.planning/phases/09-interactive-islands/09-RESEARCH.md
@src/sanity/schemas/documents/siteSettings.ts
@src/lib/sanity.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extend siteSettings schema with navItems and CTA fields</name>
  <files>src/sanity/schemas/documents/siteSettings.ts</files>
  <action>
Add the following fields to `siteSettingsType` (preserve all existing fields):

1. `navItems` — array of objects, each with:
   - `key` (string, required) — route key matching i18n/routes.ts ROUTE_SEGMENTS (e.g., "blog", "analyse", "kontakt")
   - `labelDe` (string, required) — German label
   - `labelEn` (string) — English label
   - `labelEs` (string) — Spanish label
   - Use `defineArrayMember`/`defineField` with descriptive titles. Provide a preview that shows `labelDe (key)`.

2. `ctaLabel` — object with three string subfields:
   - `de`, `en`, `es` (all strings)

3. `ctaHref` — `url` field for the Calendly booking link (validate as URL, allow https).

Group these under a "Navigation" fieldset (or new group `nav`) for editor clarity. Do NOT remove the existing `navigation[]` field if present (Phase 8 may still reference it) — these are additive new fields. Existing `defaultCtaHref` may remain untouched.

Preserve current Sanity v3 defineType/defineField patterns used in the file.
  </action>
  <verify>
Run `npx tsc --noEmit` (or repo equivalent) — passes with no schema-related TS errors.
Run `npm run dev` for studio (or studio dev script) — fields appear in Studio without runtime errors.
  </verify>
  <done>
Schema compiles, three new fields (navItems, ctaLabel, ctaHref) visible in Sanity Studio for the siteSettings singleton. Existing fields untouched.
  </done>
</task>

<task type="auto">
  <name>Task 2: Extend getSiteSettings GROQ + SiteSettings TS interface</name>
  <files>src/lib/sanity.ts</files>
  <action>
1. Update the `getSiteSettings()` GROQ projection to include the three new fields:
```
navItems[]{ key, labelDe, labelEn, labelEs },
ctaLabel{ de, en, es },
ctaHref,
```
Append to the existing projection — do NOT remove existing fields.

2. Extend the `SiteSettings` TypeScript interface with:
```ts
navItems?: Array<{ key: string; labelDe: string; labelEn?: string; labelEs?: string }>;
ctaLabel?: { de?: string; en?: string; es?: string };
ctaHref?: string;
```

3. Do NOT add a locale parameter — siteSettings is a singleton without a `language` field (per [08-01] decision in STATE.md).

4. If a memoization cache exists for getSiteSettings, leave it intact.
  </action>
  <verify>
`npx tsc --noEmit` passes.
Add a one-off test or temporary console.log in any page using getSiteSettings: `astro build` succeeds, build-time fetch logs include navItems if data exists in dataset.
  </verify>
  <done>
getSiteSettings returns typed navItems/ctaLabel/ctaHref. Build passes. No runtime errors.
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` clean
- `astro build` passes (Sanity fetch at build time succeeds)
- Sanity Studio renders new fields under siteSettings singleton
</verification>

<success_criteria>
Schema + helper extended. Phase 09-02 (MegaNav) can consume typed navItems and CTA from getSiteSettings without further data-layer work.
</success_criteria>

<output>
After completion, create `.planning/phases/09-interactive-islands/09-01-SUMMARY.md`
</output>
