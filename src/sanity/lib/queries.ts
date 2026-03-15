import { defineQuery } from 'next-sanity'

export const PAGE_BY_SLUG_QUERY = defineQuery(
  `*[_type == "page" && slug.current == $slug && language == $language][0]
  ?? *[_type == "page" && slug.current == $slug && language == "es"][0]
  { _id, title, slug, language, sections[]{ ..., _type, _key } }`
)

export const ALL_PAGES_QUERY = defineQuery(
  `*[_type == "page" && defined(slug.current)]{ slug, language }`
)

export const SITE_SETTINGS_QUERY = defineQuery(
  `*[_type == "siteSettings"][0]{
    siteName,
    tagline,
    defaultCtaHref,
    navigation[]{ label, href, _key },
    footer{ socialLinks[]{ platform, url, _key } }
  }`
)

export const ALL_POSTS_QUERY = defineQuery(
  `*[_type == "post" && language == $language] | order(publishedAt desc){
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    mainImage,
    author
  }`
)

export const POST_BY_SLUG_QUERY = defineQuery(
  `*[_type == "post" && slug.current == $slug && language == $language][0]
  ?? *[_type == "post" && slug.current == $slug && language == "es"][0]
  { _id, title, slug, language, publishedAt, mainImage, excerpt, body, author, seo }`
)
