import type { Metadata } from 'next'
import { sanityFetch } from '@/sanity/lib/live'
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries'
import AnalysePageClient from './AnalysePageClient'

export const metadata: Metadata = {
  title: 'Kostenlose Website-Analyse | nestorsegura.com',
  description:
    'Erhalten Sie sofort eine Analyse Ihrer Immobilienmakler-Website mit Scores für Performance, SEO, Mobile, Conversion und Positionierung.',
  alternates: {
    canonical: '/analyse',
  },
}

/**
 * Analysis tool page — server wrapper that fetches the CTA URL from Sanity
 * and passes it to the client component handling form state and gauge animation.
 *
 * Route: /[locale]/analyse (de/analyse, en/analyse, es/analyse)
 */
export default async function AnalysePage() {
  const { data: siteSettings } = await sanityFetch({ query: SITE_SETTINGS_QUERY })

  // Fall back to anchor link if CMS has no CTA URL configured yet
  const ctaHref = siteSettings?.defaultCtaHref ?? '#kontakt'

  return <AnalysePageClient ctaHref={ctaHref} />
}
