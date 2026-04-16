---
phase: 09-interactive-islands
plan: 04
type: execute
wave: 3
depends_on: [03]
files_modified:
  - src/components/analyse/AnalyseForm.tsx
  - src/pages/analyse.astro
  - src/pages/en/analyze.astro
  - src/pages/es/analizar.astro
  - messages/de.json
  - messages/en.json
  - messages/es.json
autonomous: false

must_haves:
  truths:
    - "Visiting /analyse (DE), /en/analyze (EN), /es/analizar (ES) renders an analysis form"
    - "Submitting a valid URL hits POST /api/analyze and renders the four returned scores in score cards"
    - "Loading and error states display localized messages from the labels prop"
    - "The React island receives locale + labels as props (NO next-intl, NO useTranslations called inside the component)"
    - "Form is hydrated with client:visible (deferred until in-viewport)"
  artifacts:
    - path: "src/components/analyse/AnalyseForm.tsx"
      provides: "React island: form input, submit handler calling /api/analyze, score display cards, loading/error states"
      min_lines: 80
      exports: ["default"]
    - path: "src/pages/analyse.astro"
      provides: "DE /analyse page composing BaseLayout + AnalyseForm with locale='de' and labels from useTranslations('de')"
    - path: "src/pages/en/analyze.astro"
      provides: "EN equivalent"
    - path: "src/pages/es/analizar.astro"
      provides: "ES equivalent"
  key_links:
    - from: "src/components/analyse/AnalyseForm.tsx"
      to: "/api/analyze"
      via: "fetch POST in submit handler"
      pattern: "fetch\\(['\"]\\/api\\/analyze"
    - from: "src/pages/analyse.astro"
      to: "src/components/analyse/AnalyseForm.tsx"
      via: "client:visible directive with locale+labels props"
      pattern: "client:visible"
---

<objective>
Implement INTR-02: build the /analyse React island that submits URLs to /api/analyze (built in 09-03) and displays returned scores. Mount it on three locale routes. The island receives `locale` and `labels` as PROPS — no hooks, no next-intl, no Astro globals inside the React tree.

Purpose: The lead-generation entry point. Phase 9 success criterion #3 hinges on this.
Output: AnalyseForm.tsx React component + 3 localized .astro pages.
</objective>

<execution_context>
@/Users/nestorsegura/.claude/get-shit-done/workflows/execute-plan.md
@/Users/nestorsegura/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/phases/09-interactive-islands/09-CONTEXT.md
@.planning/phases/09-interactive-islands/09-RESEARCH.md
@.planning/phases/09-interactive-islands/09-03-SUMMARY.md
@src/i18n/utils.ts
@src/i18n/routes.ts
@src/layouts/BaseLayout.astro
@messages/de.json
@messages/en.json
@messages/es.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add analysis i18n keys to messages files</name>
  <files>
messages/de.json
messages/en.json
messages/es.json
  </files>
  <action>
Add an `analysis` key group to each messages file (preserve existing keys):

DE:
```json
"analysis": {
  "title": "Webseiten-Analyse",
  "intro": "Geben Sie die URL Ihrer Webseite ein, um eine Schnellanalyse zu erhalten.",
  "placeholder": "https://ihre-webseite.de",
  "submit": "Analysieren",
  "loading": "Analysiere...",
  "resultTitle": "Ihre Ergebnisse",
  "errorMessage": "Analyse fehlgeschlagen. Bitte versuchen Sie es erneut.",
  "scorePerformance": "Performance",
  "scoreSeo": "SEO",
  "scoreAccessibility": "Barrierefreiheit",
  "scoreBestPractices": "Best Practices"
}
```

EN — same keys, English values ("Website Analysis", "Analyze", "Analyzing...", "Your Results", "Analysis failed. Please try again.", "Performance", "SEO", "Accessibility", "Best Practices").

ES — same keys, Spanish values ("Análisis del sitio web", "Analizar", "Analizando...", "Sus resultados", "El análisis falló. Por favor, inténtelo de nuevo.", "Rendimiento", "SEO", "Accesibilidad", "Mejores prácticas").

Run the existing `check-i18n-keys.mjs` (per [07-01] note in STATE.md) — should pass.
  </action>
  <verify>
`node check-i18n-keys.mjs` (or the actual script name) — exits 0, no missing keys.
  </verify>
  <done>
All three messages files contain matching `analysis.*` keys.
  </done>
</task>

<task type="auto">
  <name>Task 2: Build AnalyseForm.tsx React island</name>
  <files>src/components/analyse/AnalyseForm.tsx</files>
  <action>
Create `src/components/analyse/AnalyseForm.tsx`:

```tsx
import { useState, type FormEvent } from 'react';

interface Labels {
  placeholder: string; submit: string; loading: string;
  resultTitle: string; errorMessage: string;
  scorePerformance: string; scoreSeo: string;
  scoreAccessibility: string; scoreBestPractices: string;
}
interface Scores { performance: number; seo: number; accessibility: number; bestPractices: number }
interface Props { locale: 'de' | 'en' | 'es'; labels: Labels }

export default function AnalyseForm({ locale, labels }: Props) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<Scores | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setScores(null); setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, locale }),
      });
      if (!res.ok) throw new Error('api');
      const data = await res.json() as { scores: Scores };
      setScores(data.scores);
    } catch {
      setError(labels.errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function band(score: number) {
    if (score >= 80) return 'good';
    if (score >= 50) return 'warn';
    return 'bad';
  }

  return (
    <div className="analyse-form">
      <form onSubmit={onSubmit}>
        <input
          type="url" required value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder={labels.placeholder}
          disabled={loading}
          aria-label={labels.placeholder}
        />
        <button type="submit" disabled={loading || !url}>
          {loading ? labels.loading : labels.submit}
        </button>
      </form>
      {error && <p role="alert" className="analyse-form__error">{error}</p>}
      {scores && (
        <section className="analyse-form__results" aria-live="polite">
          <h2>{labels.resultTitle}</h2>
          <div className="analyse-form__grid">
            <ScoreCard label={labels.scorePerformance} value={scores.performance} band={band(scores.performance)} />
            <ScoreCard label={labels.scoreSeo} value={scores.seo} band={band(scores.seo)} />
            <ScoreCard label={labels.scoreAccessibility} value={scores.accessibility} band={band(scores.accessibility)} />
            <ScoreCard label={labels.scoreBestPractices} value={scores.bestPractices} band={band(scores.bestPractices)} />
          </div>
        </section>
      )}
    </div>
  );
}

function ScoreCard({ label, value, band }: { label: string; value: number; band: 'good'|'warn'|'bad' }) {
  return (
    <div className={`score-card score-card--${band}`}>
      <div className="score-card__value">{value}</div>
      <div className="score-card__label">{label}</div>
    </div>
  );
}
```

**STRICT requirements:**
- NO imports from `astro:*`, `next-intl`, `~/i18n/utils` — all locale data flows via props.
- Use brand styling via class names; either add scoped CSS via a sibling `.module.css` OR rely on global utility classes added in plan 09-02. Score cards: green band (≥80), amber (50–79), red (<50). Use existing brand purple for primary button.
- Component is the default export (matches `import AnalyseForm from ...` pattern).
  </action>
  <verify>
`npm run build` succeeds. No TypeScript errors. `grep -E "useTranslations|next-intl|astro:" src/components/analyse/AnalyseForm.tsx` returns nothing.
  </verify>
  <done>
React island compiles, no Astro/next-intl coupling, ready to mount.
  </done>
</task>

<task type="auto">
  <name>Task 3: Create three localized /analyse pages mounting the island</name>
  <files>
src/pages/analyse.astro
src/pages/en/analyze.astro
src/pages/es/analizar.astro
  </files>
  <action>
For each page (DE, EN, ES — translated slugs per Phase 7 routing):

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro'; // adjust depth for /en/, /es/
import AnalyseForm from '../components/analyse/AnalyseForm';
import { useTranslations } from '../i18n/utils';
import { localizeRoute } from '../i18n/routes';

const locale = 'de' as const; // 'en' / 'es' for respective files
const t = useTranslations(locale);

const labels = {
  placeholder: t('analysis.placeholder'),
  submit: t('analysis.submit'),
  loading: t('analysis.loading'),
  resultTitle: t('analysis.resultTitle'),
  errorMessage: t('analysis.errorMessage'),
  scorePerformance: t('analysis.scorePerformance'),
  scoreSeo: t('analysis.scoreSeo'),
  scoreAccessibility: t('analysis.scoreAccessibility'),
  scoreBestPractices: t('analysis.scoreBestPractices'),
};

const navLocaleUrls = {
  de: localizeRoute('analyse', 'de'),
  en: localizeRoute('analyse', 'en'),
  es: localizeRoute('analyse', 'es'),
};
---
<BaseLayout
  title={t('analysis.title')}
  description={t('analysis.intro')}
  locale={locale}
  navLocaleUrls={navLocaleUrls}
>
  <main class="analyse-page">
    <h1>{t('analysis.title')}</h1>
    <p class="analyse-page__intro">{t('analysis.intro')}</p>
    <AnalyseForm client:visible locale={locale} labels={labels} />
  </main>
</BaseLayout>
```

For `src/pages/en/analyze.astro` — set `locale = 'en'`, adjust import paths (`../../layouts/...`), and `localizeRoute` keys remain `'analyse'` (the route key, not the slug).
For `src/pages/es/analizar.astro` — same with `locale = 'es'`.

If existing analyse pages already exist at these paths (Phase 7 placeholders), REPLACE their bodies with this composition (preserve their frontmatter import paths and any existing SEO patterns from Phase 8-04).

Confirm `localizeRoute('analyse', 'de'/'en'/'es')` returns `/analyse`, `/en/analyze`, `/es/analizar` respectively (per [07-01] file-based routing decision).
  </action>
  <verify>
`npm run build` passes. `astro dev`, then visit each URL — page renders, form visible after scroll (client:visible). Submit valid URL `https://example.com` → scores render. Submit empty → button disabled. Locale switcher in MegaNav navigates between the three /analyse variants.
  </verify>
  <done>
Three /analyse pages live, React island hydrates on visibility, end-to-end submit → scores flow works in all three locales.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>AnalyseForm React island + three localized analyse pages, end-to-end /api/analyze flow.</what-built>
  <how-to-verify>
1. `npm run dev`, visit `http://localhost:4321/analyse`
2. Page renders with German heading; form visible.
3. Type `https://example.com`, click "Analysieren". Loading state shows briefly. Four score cards appear (color-banded by score).
4. Submit invalid (empty/non-URL) → browser HTML5 validation OR 400 error message displayed.
5. Open Network tab: POST to /api/analyze, 200 response with scores JSON.
6. DevTools Components: AnalyseForm hydrated only after scrolling into view (verify with `client:visible` — should see hydration log).
7. Visit `/en/analyze` and `/es/analizar` — labels/scores render in correct locale.
8. Use MegaNav locale switcher from /analyse → arrives at correct localized analyse URL.
9. Confirm NO `useTranslations` or `next-intl` import inside `AnalyseForm.tsx` (`grep` to verify).
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- Build passes, all 3 locales
- POST /api/analyze invoked from form, scores rendered
- React island has zero locale-API coupling (props-only)
- Locale switcher integration with MegaNav verified
</verification>

<success_criteria>
INTR-02 satisfied. Phase 9 success criterion #3 met (form submits, JSON returns, scores display, locale+labels as props).
</success_criteria>

<output>
After completion, create `.planning/phases/09-interactive-islands/09-04-SUMMARY.md`
</output>
