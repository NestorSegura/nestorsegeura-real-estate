import type { Locale } from './utils';
import { DEFAULT_LOCALE } from './utils';

/**
 * Maps route keys to their locale-specific URL segments.
 * DE gets no prefix; EN/ES get /{locale} prefix.
 */
export const ROUTE_SEGMENTS: Record<string, Record<Locale, string>> = {
  // Empty segment = root of each locale (/, /en/, /es/)
  home: {
    de: '',
    en: '',
    es: '',
  },
  blog: {
    de: 'blog',
    en: 'blog',
    es: 'blog',
  },
  analyse: {
    de: 'analyse',
    en: 'analyze',
    es: 'analizar',
  },
  impressum: {
    de: 'impressum',
    en: 'imprint',
    es: 'aviso-legal',
  },
  datenschutz: {
    de: 'datenschutz',
    en: 'privacy-policy',
    es: 'privacidad',
  },
  agb: {
    de: 'agb',
    en: 'terms',
    es: 'terminos',
  },
};

/**
 * Returns the localized URL for a given route key and target locale.
 *
 * Examples:
 *   localizeRoute('analyse', 'de')  → '/analyse'
 *   localizeRoute('analyse', 'en')  → '/en/analyze'
 *   localizeRoute('analyse', 'es')  → '/es/analizar'
 *
 * If routeKey is not in the map, falls back to '/' + optional prefix + routeKey.
 */
export function localizeRoute(routeKey: string, targetLocale: Locale): string {
  const prefix = targetLocale === DEFAULT_LOCALE ? '' : `/${targetLocale}`;
  const segments = ROUTE_SEGMENTS[routeKey];
  const segment = segments ? segments[targetLocale] : routeKey;
  return `${prefix}/${segment}`;
}
