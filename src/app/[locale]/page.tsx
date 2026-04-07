import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { sanityFetch } from '@/sanity/lib/live'
import { SITE_SETTINGS_SEO_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import { LandingPage } from '@/components/sections/LandingPageES'

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

  return <LandingPage locale={locale} />
}
