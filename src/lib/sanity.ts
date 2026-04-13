/**
 * Locale-filtered Sanity GROQ query helpers.
 *
 * All helpers use the `language` field populated by
 * @sanity/document-internationalization. Queries are parameterised —
 * locale values are never string-interpolated into GROQ strings.
 *
 * Import sanityClient from the @sanity/astro virtual module, confirmed
 * working in Phase 6 (06-02).
 */
import { sanityClient } from 'sanity:client';
import type { Locale } from '../i18n/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A minimal page document shape; block rendering is Phase 8's concern. */
export interface SanityPage {
  _id: string;
  _type: 'page';
  language: string;
  title?: string;
  slug?: { current: string };
  sections?: unknown[];
}

/** A minimal post document shape. */
export interface SanityPost {
  _id: string;
  _type: 'post';
  language: string;
  title?: string;
  slug?: { current: string };
}

/** Return value for fallback-capable fetchers. */
export interface WithFallback<T> {
  page: T | null;
  isFallback: boolean;
}

// ---------------------------------------------------------------------------
// Page helpers
// ---------------------------------------------------------------------------

/**
 * Fetch a page document for an exact locale match.
 * Returns null when no matching document exists.
 */
export async function getPageForLocale(
  slug: string,
  locale: Locale,
): Promise<SanityPage | null> {
  const query = `*[_type == "page" && slug.current == $slug && language == $locale][0]{
    _id,
    _type,
    language,
    title,
    slug,
    sections
  }`;
  return sanityClient.fetch<SanityPage | null>(query, { slug, locale });
}

/**
 * Fetch a page for the given locale, falling back to the German ("de")
 * document when no exact match exists.
 *
 * Strategy: fetch exact-locale match first; if null, fetch the DE version.
 * Returns `{ page, isFallback }` where `isFallback` is true when the
 * returned document's language field differs from the requested locale.
 * This drives the "translation pending" banner in the template.
 */
export async function getPageWithFallback(
  slug: string,
  locale: Locale,
): Promise<WithFallback<SanityPage>> {
  const fields = `{ _id, _type, language, title, slug, sections }`;

  // Try exact locale match first
  const exactQuery = `*[_type == "page" && slug.current == $slug && language == $locale][0]${fields}`;
  let page = await sanityClient.fetch<SanityPage | null>(exactQuery, { slug, locale });

  if (page !== null) {
    return { page, isFallback: false };
  }

  // Fall back to DE when locale is not "de"
  if (locale !== 'de') {
    const fallbackQuery = `*[_type == "page" && slug.current == $slug && language == "de"][0]${fields}`;
    page = await sanityClient.fetch<SanityPage | null>(fallbackQuery, { slug });
    return { page, isFallback: page !== null };
  }

  return { page: null, isFallback: false };
}

/**
 * Convenience wrapper for the site homepage.
 * The homepage document uses the slug "home".
 */
export async function getHomepageForLocale(
  locale: Locale,
): Promise<WithFallback<SanityPage>> {
  return getPageWithFallback('home', locale);
}

// ---------------------------------------------------------------------------
// Blog / post helpers
// ---------------------------------------------------------------------------

/**
 * Return all post slugs for a given locale.
 * Intended for use in `getStaticPaths` (Phase 8 blog).
 */
export async function getAllPostSlugsForLocale(
  locale: Locale,
): Promise<{ slug: string }[]> {
  const query = `*[_type == "post" && language == $locale && defined(slug.current)]{
    "slug": slug.current
  }`;
  return sanityClient.fetch<{ slug: string }[]>(query, { locale });
}

/**
 * Fetch a post by slug and locale, including sibling translation references
 * so Phase 9's locale switcher can resolve cross-locale URLs.
 *
 * The `_translations` sub-query uses @sanity/document-internationalization's
 * convention: translation metadata documents use `references(^._id)` to link
 * variants.
 */
export async function getPostWithTranslations(
  slug: string,
  locale: Locale,
): Promise<(SanityPost & { _translations: Array<{ language: string; slug: string }> }) | null> {
  const query = `*[_type == "post" && slug.current == $slug && language == $locale][0]{
    _id,
    _type,
    language,
    title,
    slug,
    "_translations": *[_type == "translation.metadata" && references(^._id)][0].translations[]{
      language,
      "slug": value->slug.current
    }
  }`;
  return sanityClient.fetch(query, { slug, locale });
}
