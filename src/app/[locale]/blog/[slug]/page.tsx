import type { Metadata } from 'next'
import Image from 'next/image'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { sanityFetch } from '@/sanity/lib/live'
import { client } from '@/sanity/lib/client'
import { POST_BY_SLUG_QUERY, ALL_POSTS_FOR_SITEMAP_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import type { PortableTextBlock } from '@portabletext/react'
import { extractHeadings } from '@/lib/blog'
import { PortableTextRenderer } from '@/components/blog/PortableTextRenderer'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { AuthorCard } from '@/components/blog/AuthorCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { Link } from '@/i18n/navigation'

export async function generateStaticParams() {
  const posts = await client.fetch(ALL_POSTS_FOR_SITEMAP_QUERY)
  return posts
    .filter((post) => post.slug?.current && post.language)
    .map((post) => ({
      locale: post.language as string,
      slug: post.slug!.current as string,
    }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const { data } = await sanityFetch({
    query: POST_BY_SLUG_QUERY,
    params: { slug, language: locale },
  })

  const mainImageUrl = data?.mainImage
    ? urlFor(data.mainImage).width(1200).height(630).url()
    : '/og-default.png'

  return {
    title: data?.seo?.title ?? data?.title ?? slug,
    description: data?.seo?.description ?? data?.excerpt ?? '',
    openGraph: {
      images: [mainImageUrl],
      type: 'article',
      publishedTime: data?.publishedAt ?? undefined,
      modifiedTime: data?._updatedAt ?? undefined,
    },
    alternates: {
      languages: {
        de: `https://nestorsegura.com/blog/${slug}`,
        en: `https://nestorsegura.com/en/blog/${slug}`,
        es: `https://nestorsegura.com/es/blog/${slug}`,
      },
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const { data: post } = await sanityFetch({
    query: POST_BY_SLUG_QUERY,
    params: { slug, language: locale },
  })

  if (!post) {
    notFound()
  }

  const headings = extractHeadings(
    (post.body ?? []) as unknown as PortableTextBlock[]
  )

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const mainImageUrl = post.mainImage
    ? urlFor(post.mainImage).width(1200).height(630).url()
    : null

  // Article JSON-LD structured data
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    author: {
      '@type': 'Person',
      name: post.author?.name ?? 'Nestor Segura',
    },
    datePublished: post.publishedAt,
    dateModified: post._updatedAt,
    image: mainImageUrl ?? undefined,
  }

  return (
    <>
      {/* Article JSON-LD */}
      <JsonLd data={articleJsonLd} />

      <main>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
            {/* Left: Article content */}
            <article>
              {/* Post header */}
              <header className="mb-8">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                  {post.category && (
                    <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                      {post.category === 'tipps' ? 'Tipps' : 'Fallstudien'}
                    </span>
                  )}
                  {publishedDate && (
                    <time dateTime={post.publishedAt ?? ''}>{publishedDate}</time>
                  )}
                  {post.estimatedReadingTime > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{post.estimatedReadingTime} Min. Lesezeit</span>
                    </>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
                )}
              </header>

              {/* Main image */}
              {mainImageUrl && (
                <div className="relative w-full aspect-video overflow-hidden rounded-xl mb-8">
                  <Image
                    src={mainImageUrl}
                    alt={post.title ?? ''}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                    priority
                  />
                </div>
              )}

              {/* Article body */}
              {post.body && <PortableTextRenderer value={post.body} />}

              {/* Back link */}
              <div className="mt-12 pt-8 border-t border-border">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span aria-hidden="true">←</span>
                  Zurück zum Blog
                </Link>
              </div>
            </article>

            {/* Right: Sticky sidebar */}
            <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
              {/* Table of contents */}
              {headings.length > 0 && (
                <div className="border border-border rounded-lg p-4 bg-card">
                  <TableOfContents headings={headings} />
                </div>
              )}

              {/* Appointment CTA */}
              <div className="border border-primary/20 rounded-lg p-5 bg-primary/5">
                <p className="text-sm font-semibold text-foreground mb-1">
                  Kostenloses Erstgespräch
                </p>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Bereit, Ihre Online-Präsenz zu verbessern? Buchen Sie jetzt ein unverbindliches Gespräch.
                </p>
                <a
                  href="https://cal.com/nestorsegura/erstgespraech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-primary text-primary-foreground text-sm font-semibold py-2.5 px-4 rounded-md hover:opacity-90 transition-opacity"
                >
                  Termin buchen
                </a>
              </div>

              {/* Author card */}
              {post.author && (
                <AuthorCard author={post.author} />
              )}
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}
