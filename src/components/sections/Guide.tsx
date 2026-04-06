import FadeIn from './FadeIn'

interface GuideProps {
  headline: string
  paragraphs: string[]
  testimonials: { author: string; role: string; quote: string }[]
}

export default function Guide({ headline, paragraphs, testimonials }: GuideProps) {
  return (
    <section id="guia" className="py-20 md:py-28 px-6" style={{ backgroundColor: 'var(--brand-bg)' }}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <FadeIn>
          <h2
            className="font-display text-3xl md:text-4xl font-bold"
            style={{ color: 'var(--brand-fg)' }}
          >
            {headline}
          </h2>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-lg mt-4 leading-relaxed"
              style={{ color: 'var(--brand-fg-muted)' }}
            >
              {p}
            </p>
          ))}
          <div
            className="aspect-square rounded-2xl flex items-center justify-center mt-6"
            style={{ backgroundColor: 'var(--brand-bg-subtle)', color: 'var(--brand-fg-muted)' }}
          >
            Foto profesional
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="flex flex-col gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-xl p-6"
                style={{ backgroundColor: 'var(--brand-bg-subtle)' }}
              >
                <p
                  className="text-base italic leading-relaxed"
                  style={{ color: 'var(--brand-fg)' }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p
                  className="font-semibold text-sm mt-4"
                  style={{ color: 'var(--brand-fg)' }}
                >
                  {t.author}
                </p>
                <p className="text-sm" style={{ color: 'var(--brand-fg-muted)' }}>
                  {t.role}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
