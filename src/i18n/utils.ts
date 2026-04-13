import de from '../../messages/de.json';
import en from '../../messages/en.json';
import es from '../../messages/es.json';

export const LOCALES = ['de', 'en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'de';

const messages: Record<Locale, Record<string, unknown>> = { de, en, es };

/**
 * Walk an object along a dot-separated path.
 * Returns the value at the path, or undefined if any segment is missing.
 * Arrays are returned as-is (not walked further).
 */
function getNestedValue(obj: unknown, path: string): unknown {
  const segments = path.split('.');
  let current: unknown = obj;
  for (const segment of segments) {
    if (current === null || typeof current !== 'object' || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/**
 * Returns a translation function for the given locale.
 * Dot-notation keys are supported (e.g. 'nav.home').
 * Falls back to DE if the key is missing in the target locale.
 * Returns the key itself if not found in DE either (visible in dev).
 */
export function useTranslations(locale: Locale): (key: string) => string {
  return (key: string): string => {
    const localeValue = getNestedValue(messages[locale], key);
    if (typeof localeValue === 'string') {
      return localeValue;
    }

    // Fall back to DE
    const deValue = getNestedValue(messages['de'], key);
    if (typeof deValue === 'string') {
      return deValue;
    }

    // Key not found anywhere — return key so it surfaces visibly in dev
    return key;
  };
}

/**
 * Returns an array from the translation files for the given locale and key.
 * Falls back to the DE array if the key is missing in the target locale.
 * Returns [] if neither locale has the key.
 */
export function useTranslationArray<T>(locale: Locale, key: string): T[] {
  const localeValue = getNestedValue(messages[locale], key);
  if (Array.isArray(localeValue)) {
    return localeValue as T[];
  }

  // Fall back to DE
  const deValue = getNestedValue(messages['de'], key);
  if (Array.isArray(deValue)) {
    return deValue as T[];
  }

  return [];
}
