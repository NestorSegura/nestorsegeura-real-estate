import FadeIn from './FadeIn'

interface CTAFinalProps {
  headline: string
  copy: string
  ctaLabel: string
  ctaHref: string
  scarcityText: string
}

export default function CTAFinal({ headline, copy, ctaLabel, ctaHref, scarcityText }: CTAFinalProps) {
  return (
    <section id="contacto" className="py-20 md:py-28 px-6" style={{ background: 'var(--brand-purple)' }}>
      <div className="max-w-3xl mx-auto text-center">
        <FadeIn>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white">{headline}</h2>
          <p className="text-lg md:text-xl text-white/80 mt-6">{copy}</p>
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-10 rounded-full font-semibold text-lg px-10 py-4 transition-all duration-200 hover:brightness-95"
            style={{ background: 'white', color: 'var(--brand-purple)' }}
          >
            {ctaLabel}
          </a>
          <p className="text-sm text-white/50 mt-6 italic">{scarcityText}</p>
        </FadeIn>
      </div>
    </section>
  )
}
