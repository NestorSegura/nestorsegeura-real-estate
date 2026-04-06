import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { sanityFetch } from '@/sanity/lib/live'
import { PAGE_BY_SLUG_QUERY, SITE_SETTINGS_SEO_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import { PageBuilder, type PageSection } from '@/blocks/PageBuilder'
import { JsonLd } from '@/components/seo/JsonLd'
import { LandingPageES } from '@/components/sections/LandingPageES'

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await sanityFetch({ query: SITE_SETTINGS_SEO_QUERY })

  const ogImage = data?.seo?.ogImage
    ? urlFor(data.seo.ogImage).width(1200).height(630).url()
    : '/og-default.png'

  return {
    title: data?.seo?.title ?? data?.siteName ?? 'nestorsegura.com',
    description:
      data?.seo?.description ?? data?.tagline ?? 'Web Design for Real Estate Agents',
    openGraph: {
      images: [ogImage],
    },
    alternates: {
      languages: {
        de: 'https://nestorsegura.com',
        en: 'https://nestorsegura.com/en',
        es: 'https://nestorsegura.com/es',
      },
    },
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  // ES locale uses the new dedicated landing page
  if (locale === 'es') {
    return <LandingPageES />
  }

  // Other locales: Sanity Page Builder
  const { data: page } = await sanityFetch({
    query: PAGE_BY_SLUG_QUERY,
    params: { slug: 'home', language: locale },
  })

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nestor Segura',
    jobTitle: 'Web Designer & Digital Strategist',
    url: 'https://nestorsegura.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hamburg',
      addressCountry: 'DE',
    },
  }

  const agencySchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'nestorsegura.com',
    url: 'https://nestorsegura.com',
    founder: {
      '@type': 'Person',
      name: 'Nestor Segura',
    },
    areaServed: {
      '@type': 'Country',
      name: 'DE',
    },
    description: 'Web design and digital marketing for German real estate agents',
    serviceType: ['Web Design', 'SEO', 'Digital Marketing'],
  }

  if (!page) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <JsonLd data={personSchema} />
        <JsonLd data={agencySchema} />
        <p className="text-muted-foreground text-lg text-center">
          Kein Inhalt konfiguriert. Bitte erstelle eine &ldquo;home&rdquo;-Seite im Sanity Studio.
        </p>
      </main>
    )
  }

  return (
    <main>
      <JsonLd data={personSchema} />
      <JsonLd data={agencySchema} />
      <PageBuilder sections={(page.sections ?? []) as PageSection[]} />
    </main>
  )
}
