import { hasLocale } from 'next-intl'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { routing } from '@/i18n/routing'

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

  const t = await getTranslations('hero')

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight text-center max-w-2xl">
        {t('title')}
      </h1>
      <p className="text-muted-foreground text-lg text-center max-w-xl">
        {t('subtitle')}
      </p>
      <Button>{t('cta')}</Button>
    </main>
  )
}
