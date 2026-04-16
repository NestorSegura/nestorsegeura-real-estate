import type { Locale } from '../i18n/utils'

const BOOKING_URLS: Record<Locale, string> = {
  de: 'https://tidycal.com/1vn62y3/website-als-verkaufskanal-optimieren',
  en: 'https://tidycal.com/1vn62y3/website-als-verkaufskanal-optimieren',
  es: 'https://tidycal.com/1vn62y3/conversacion-sobre-tu-pagina-web-1520-min',
}

export function getBookingUrl(locale: Locale): string {
  return BOOKING_URLS[locale] ?? BOOKING_URLS.de
}
