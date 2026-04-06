'use client'

import FadeIn from './FadeIn'
import { CTAButton } from './CTAButton'

interface HeroProps {
  headline: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  ctaSecondaryLabel: string
  ctaSecondaryHref: string
}

export default function Hero({
  headline,
  subtitle,
  ctaLabel,
  ctaHref,
  ctaSecondaryLabel,
  ctaSecondaryHref,
}: HeroProps) {
  return (
    <section className="py-20 md:py-28 px-6" style={{ background: 'var(--brand-bg)' }}>
      <div className="max-w-4xl mx-auto text-center">
        <FadeIn>
          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight"
            style={{ color: 'var(--brand-fg)' }}
          >
            {headline}
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mt-6"
            style={{ color: 'var(--brand-fg-muted)' }}
          >
            {subtitle}
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="flex items-center justify-center gap-4 mt-10">
            <CTAButton variant="primary" href={ctaHref}>
              {ctaLabel}
            </CTAButton>
            <CTAButton variant="ghost" href={ctaSecondaryHref}>
              {ctaSecondaryLabel}
            </CTAButton>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-14 overflow-hidden">
            <div
              className="flex gap-8 w-max"
              style={{
                animation: 'marquee 20s linear infinite',
              }}
            >
              {[...Array(2)].map((_, set) => (
                <div key={set} className="flex gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-24 h-8 bg-gray-200 rounded shrink-0" />
                  ))}
                </div>
              ))}
            </div>
            <style>{`
              @keyframes marquee {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
            `}</style>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
