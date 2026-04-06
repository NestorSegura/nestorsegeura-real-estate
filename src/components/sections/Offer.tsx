import FadeIn from './FadeIn'
import { CTAButton } from './CTAButton'

interface OfferItem {
  before: string
  after: string
}

interface ServiceCard {
  title: string
}

interface OfferProps {
  headline: string
  comparison: OfferItem[]
  services: ServiceCard[]
  ctaLabel: string
  ctaHref: string
}

export default function Offer({ headline, comparison, services, ctaLabel, ctaHref }: OfferProps) {
  return (
    <section id="oferta" className="py-20 md:py-28 px-6" style={{ backgroundColor: 'var(--brand-bg)' }}>
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <h2
            className="font-display text-3xl md:text-4xl font-bold text-center"
            style={{ color: 'var(--brand-fg)' }}
          >
            {headline}
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div
            className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-0 rounded-xl overflow-hidden border"
            style={{ borderColor: 'var(--border)' }}
          >
            <div>
              <div className="bg-red-50 text-red-600 font-semibold text-sm uppercase p-4">
                ANTES ❌
              </div>
              {comparison.map((item, i) => (
                <div
                  key={i}
                  className="p-4 border-t text-sm"
                  style={{ borderColor: 'var(--border)', color: 'var(--brand-fg-muted)' }}
                >
                  {item.before}
                </div>
              ))}
            </div>
            <div>
              <div className="bg-emerald-50 text-emerald-600 font-semibold text-sm uppercase p-4">
                DESPUÉS ✓
              </div>
              {comparison.map((item, i) => (
                <div
                  key={i}
                  className="p-4 border-t text-sm font-medium"
                  style={{ borderColor: 'var(--border)', color: 'var(--brand-fg)' }}
                >
                  {item.after}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s, i) => (
              <div
                key={i}
                className="rounded-xl p-6 flex items-start gap-3"
                style={{ backgroundColor: 'var(--brand-bg-subtle)' }}
              >
                <span className="text-lg" style={{ color: 'var(--brand-cyan)' }}>✦</span>
                <span className="text-base font-medium" style={{ color: 'var(--brand-fg)' }}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="mt-12 text-center">
            <CTAButton variant="primary" href={ctaHref}>
              {ctaLabel}
            </CTAButton>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
