---
created: 2026-04-06T19:00
title: Switch fonts to Clash Display and Chivo
area: ui
files:
  - src/app/layout.tsx
  - src/app/globals.css
  - tailwind.config.ts
---

## Problem

Current fonts are DM Sans (body) and Fraunces (display). Need to switch to:
- **Headlines / display font:** Clash Display Variable
- **Body font:** Chivo

Clash Display is not a Google Font — it's from Fontshare (Indian Type Foundry). Will need self-hosted files or fontshare CDN. Chivo is available on Google Fonts.

## Solution

1. Download Clash Display Variable from fontshare.com, add woff2 files to `public/fonts/`
2. Replace `Fraunces` import with `@font-face` for Clash Display in globals.css
3. Replace `DM_Sans` with `Chivo` from `next/font/google`
4. Update CSS variables `--font-fraunces` → `--font-clash-display`, `--font-dm-sans` → `--font-chivo`
5. Verify `font-display` and `font-sans` Tailwind mappings still resolve correctly
