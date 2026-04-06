import FadeIn from './FadeIn'

interface Testimonial {
  name: string
  role: string
  quote: string
}

interface TestimonialsProps {
  headline: string
  subtitle: string
  testimonials: Testimonial[]
}

export default function Testimonials({ headline, subtitle, testimonials }: TestimonialsProps) {
  return (
    <section id="resultados" className="py-20 md:py-28 px-6" style={{ background: 'var(--brand-bg-subtle)' }}>
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center" style={{ color: 'var(--brand-fg)' }}>
            {headline}
          </h2>
          <p className="text-base text-center mt-3 max-w-2xl mx-auto italic" style={{ color: 'var(--brand-fg-muted)' }}>
            {subtitle}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-xl p-6" style={{ background: 'var(--brand-bg)', border: '1px solid var(--border)' }}>
                <span className="text-3xl" style={{ color: 'var(--brand-lavender)', opacity: 0.5 }}>❝</span>
                <p className="text-base leading-relaxed mt-2" style={{ color: 'var(--brand-fg)' }}>{t.quote}</p>
                <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm text-white"
                    style={{ background: 'var(--brand-purple)' }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--brand-fg)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--brand-fg-muted)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-xl p-6 flex items-center justify-center border-dashed border-2 border-gray-300">
              <p style={{ color: 'var(--brand-fg-muted)' }}>Próximo caso: tu agencia</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
