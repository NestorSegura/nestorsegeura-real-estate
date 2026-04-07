import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { SanityLive, sanityFetch } from '@/sanity/lib/live'
import { SITE_SETTINGS_SEO_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: _locale } = await params
  const { data } = await sanityFetch({ query: SITE_SETTINGS_SEO_QUERY })

  const ogImage = data?.seo?.ogImage
    ? urlFor(data.seo.ogImage).width(1200).height(630).url()
    : '/og-default.png'

  return {
    title: {
      default: data?.seo?.title ?? data?.siteName ?? 'nestorsegura.com',
      template: '%s | nestorsegura.com',
    },
    description:
      data?.seo?.description ?? data?.tagline ?? 'Web Design for Real Estate Agents',
    metadataBase: new URL('https://nestorsegura.com'),
    openGraph: {
      images: [ogImage],
      siteName: data?.siteName ?? 'nestorsegura.com',
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return (
    <NextIntlClientProvider>
      {children}
      <SanityLive />
    </NextIntlClientProvider>
  )
}
