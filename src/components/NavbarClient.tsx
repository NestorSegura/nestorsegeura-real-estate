'use client'

import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import { Drawer } from '@base-ui/react/drawer'

type NavLink = {
  label: string
  href: string
  _key: string
}

interface NavbarClientProps {
  navLinks: NavLink[]
  ctaHref: string
  siteName: string
}

const LOCALES = [
  { code: 'de', label: 'DE' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
] as const

/**
 * Interactive navbar with:
 * - Sticky scroll detection via IntersectionObserver on a sentinel element
 * - Desktop: logo/siteName, nav links, language switcher, CTA button
 * - Mobile: hamburger button triggering @base-ui/react Drawer slide-in from right
 * - Locale switcher using useRouter from @/i18n/navigation
 */
export function NavbarClient({ navLinks, ctaHref, siteName }: NavbarClientProps) {
  const [scrolled, setScrolled] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()

  // Detect scroll via IntersectionObserver on sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const handleLocaleSwitch = (targetLocale: string) => {
    router.replace(
      // @ts-expect-error — pathname is dynamic, params may include any shape
      { pathname, params },
      { locale: targetLocale }
    )
  }

  const isExternalCta = ctaHref.startsWith('http')

  return (
    <>
      {/* Sentinel: IntersectionObserver watches this to detect scroll position */}
      <div ref={sentinelRef} className="h-0 w-full" aria-hidden="true" />

      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: '#ffffff',
          boxShadow: scrolled ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo / site name */}
          <Link
            href="/"
            className="font-bold text-lg tracking-tight shrink-0"
            style={{ color: '#353535' }}
          >
            {siteName}
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
            {navLinks.map((link) => (
              <li key={link._key}>
                <a
                  href={link.href}
                  className="text-sm font-medium px-3 py-1.5 rounded-md transition-all duration-200"
                  style={{ color: 'oklch(0.45 0.18 290)' }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = 'oklch(0.85 0.08 250 / 0.25)'
                    el.style.color = 'oklch(0.45 0.18 290)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = 'transparent'
                    el.style.color = 'oklch(0.45 0.18 290)'
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop right: locale switcher + CTA */}
          <div className="hidden md:flex items-center gap-4">
            <LocaleSwitcher
              currentLocale={locale}
              onSwitch={handleLocaleSwitch}
              scrolled={scrolled}
            />
            <a
              href={ctaHref}
              {...(isExternalCta ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="nav-cta text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-200 shrink-0"
            >
              {t('cta')}
            </a>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <Drawer.Root>
              <Drawer.Trigger
                aria-label={t('menuOpen')}
                className="p-2 rounded-lg transition-colors duration-200"
                style={{ color: '#353535' }}
              >
                <Menu size={22} aria-hidden="true" />
              </Drawer.Trigger>

              <Drawer.Portal>
                <Drawer.Backdrop
                  className="fixed inset-0 z-[60] transition-opacity duration-300 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
                  style={{ background: 'oklch(0 0 0 / 0.4)' }}
                />
                <Drawer.Viewport className="fixed inset-y-0 right-0 z-[70]">
                  <Drawer.Popup
                    className="h-full w-72 flex flex-col p-6 gap-8 transition-transform duration-300 ease-out data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full"
                    style={{ background: 'oklch(0.12 0 0)', color: 'oklch(0.97 0.003 80)' }}
                  >
                    {/* Drawer header */}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">{siteName}</span>
                      <Drawer.Close
                        aria-label={t('menuClose')}
                        className="p-2 rounded-lg transition-opacity duration-200 hover:opacity-70"
                        style={{ color: 'oklch(0.97 0.003 80)' }}
                      >
                        <X size={20} aria-hidden="true" />
                      </Drawer.Close>
                    </div>

                    {/* Mobile nav links */}
                    <nav>
                      <ul className="flex flex-col gap-2 list-none m-0 p-0">
                        {navLinks.map((link) => (
                          <li key={link._key}>
                            <a
                              href={link.href}
                              className="block py-3 px-2 text-base font-medium rounded-lg transition-colors duration-150"
                              style={{ color: 'oklch(0.85 0.003 80)' }}
                              onMouseEnter={(e) => {
                                ;(e.currentTarget as HTMLAnchorElement).style.color =
                                  'oklch(0.72 0.14 290)'
                              }}
                              onMouseLeave={(e) => {
                                ;(e.currentTarget as HTMLAnchorElement).style.color =
                                  'oklch(0.85 0.003 80)'
                              }}
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>

                    {/* Mobile locale switcher */}
                    <div className="flex items-center gap-3">
                      <LocaleSwitcher
                        currentLocale={locale}
                        onSwitch={handleLocaleSwitch}
                        scrolled={true}
                      />
                    </div>

                    {/* Mobile CTA */}
                    <a
                      href={ctaHref}
                      {...(isExternalCta ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="nav-cta text-center text-sm font-semibold px-6 py-3 rounded-full transition-all duration-200"
                    >
                      {t('cta')}
                    </a>
                  </Drawer.Popup>
                </Drawer.Viewport>
              </Drawer.Portal>
            </Drawer.Root>
          </div>
        </div>
      </nav>
    </>
  )
}

/** Renders DE | EN | ES locale switcher labels */
function LocaleSwitcher({
  currentLocale,
  onSwitch,
  scrolled,
}: {
  currentLocale: string
  onSwitch: (locale: string) => void
  scrolled: boolean
}) {
  return (
    <div className="flex items-center gap-1 text-sm" aria-label="Language switcher">
      {LOCALES.map((loc, idx) => (
        <span key={loc.code} className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSwitch(loc.code)}
            aria-current={currentLocale === loc.code ? 'true' : undefined}
            className="transition-colors duration-150"
            style={
              currentLocale === loc.code
                ? { color: 'oklch(0.45 0.18 290)', fontWeight: 700 }
                : { color: '#888' }
            }
          >
            {loc.label}
          </button>
          {idx < LOCALES.length - 1 && (
            <span
              aria-hidden="true"
              style={{ color: '#ccc' }}
            >
              |
            </span>
          )}
        </span>
      ))}
    </div>
  )
}
