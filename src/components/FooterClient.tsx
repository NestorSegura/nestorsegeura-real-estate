'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

type SocialLink = {
  platform?: string | null
  url?: string | null
  _key: string
}

type NavLink = {
  label: string | null
  href: string | null
  _key: string
}

interface FooterClientProps {
  siteName: string
  tagline: string
  ctaHref: string
  socialLinks: SocialLink[]
  navLinks: NavLink[]
}

export function FooterClient({ siteName, tagline, ctaHref, socialLinks, navLinks }: FooterClientProps) {
  const t = useTranslations('nav')
  const year = 2026
  const isExternalCta = ctaHref.startsWith('http')

  return (
    <footer
      style={{ background: '#1a1333', color: 'rgba(255,255,255,0.7)' }}
      className="px-6 py-16"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="text-xl font-bold text-white">
              {siteName}
            </Link>
            {tagline && (
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {tagline}
              </p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-1">Navigation</h4>
            {navLinks.map((link) => (
              <a
                key={link._key}
                href={link.href ?? '#'}
                className="text-sm transition-colors duration-200 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA + Social */}
          <div className="flex flex-col gap-4">
            <a
              href={ctaHref}
              {...(isExternalCta ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="nav-cta inline-block text-center text-sm font-semibold px-6 py-3 rounded-full transition-all duration-200"
            >
              {t('cta')}
            </a>

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4 mt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social._key}
                    href={social.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium transition-colors duration-200 hover:text-white capitalize"
                  >
                    {social.platform ?? 'Link'}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p>&copy; {year} {siteName}. All rights reserved.</p>
          <p style={{ color: 'rgba(255,255,255,0.3)' }}>
            Made in Hamburg
          </p>
        </div>
      </div>
    </footer>
  )
}
