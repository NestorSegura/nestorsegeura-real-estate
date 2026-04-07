'use client'

import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { CTAButton } from './CTAButton'

const NAV_LINKS: Record<string, { label: string; href: string }[]> = {
  de: [
    { label: 'So funktioniert\'s', href: '#como-funciona' },
    { label: 'Ergebnisse', href: '#resultados' },
    { label: 'FAQ', href: '#faq' },
  ],
  en: [
    { label: 'How it works', href: '#como-funciona' },
    { label: 'Results', href: '#resultados' },
    { label: 'FAQ', href: '#faq' },
  ],
  es: [
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Resultados', href: '#resultados' },
    { label: 'FAQ', href: '#faq' },
  ],
}

const CTA_LABELS: Record<string, string> = {
  de: 'Kostenloses Erstgespräch buchen',
  en: 'Book your free call',
  es: 'Reserva tu llamada gratuita',
}

const ARIA_LABELS: Record<string, { open: string; close: string }> = {
  de: { open: 'Menü öffnen', close: 'Menü schließen' },
  en: { open: 'Open menu', close: 'Close menu' },
  es: { open: 'Abrir menú', close: 'Cerrar menú' },
}

const CTA_HREF = 'https://tidycal.com/1vn62y3/website-als-verkaufskanal-optimieren'

export function Nav({ locale = 'es' }: { locale?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinelRef} className="h-0 w-full" aria-hidden="true" />

      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255, 255, 255, 0.92)' : '#ffffff',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <a
            href="/"
            className="font-display font-bold text-lg tracking-tight shrink-0"
            style={{ color: 'var(--brand-fg)' }}
          >
            Nestor Segura
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            {(NAV_LINKS[locale] ?? NAV_LINKS.es).map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-medium transition-colors duration-200"
                  style={{ color: 'var(--brand-fg-muted)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--brand-purple)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--brand-fg-muted)'
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <CTAButton href={CTA_HREF} className="text-sm px-6 py-2.5">
              {CTA_LABELS[locale] ?? CTA_LABELS.es}
            </CTAButton>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg"
            style={{ color: 'var(--brand-fg)' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? (ARIA_LABELS[locale] ?? ARIA_LABELS.es).close : (ARIA_LABELS[locale] ?? ARIA_LABELS.es).open}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t px-6 pb-6 pt-4 flex flex-col gap-4" style={{ borderColor: 'var(--border)' }}>
            {(NAV_LINKS[locale] ?? NAV_LINKS.es).map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-base font-medium py-2"
                style={{ color: 'var(--brand-fg)' }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <CTAButton href={CTA_HREF} className="text-sm mt-2">
              {CTA_LABELS[locale] ?? CTA_LABELS.es}
            </CTAButton>
          </div>
        )}
      </nav>
    </>
  )
}
