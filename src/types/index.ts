import de from '@/i18n/messages/de.json'

declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof de
    Locale: 'de' | 'en' | 'es'
  }
}
