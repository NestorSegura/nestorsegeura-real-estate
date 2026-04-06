'use client'

import { SectionWrapper } from '@/components/SectionWrapper'
import type { TestimonialsBlock as TestimonialsBlockType } from '@/types/sanity.types'

type TestimonialsBlockProps = TestimonialsBlockType & { _key?: string; sectionId?: string }

export function TestimonialsBlock({
  title,
  testimonials,
  colorScheme = 'light',
  spacing,
  sectionId,
}: TestimonialsBlockProps) {
  return (
    <SectionWrapper id={sectionId ?? 'referenzen'} scheme={colorScheme} spacing={spacing}>
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 reveal">
            {title}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(testimonials ?? []).map((testimonial, index) => (
            <figure
              key={testimonial._key}
              className="reveal flex flex-col gap-4 p-8 rounded-2xl relative"
              style={{ background: 'var(--section-card-bg)' }}
            >
              <span
                className="text-6xl font-serif leading-none select-none absolute top-4 left-6 opacity-30"
                style={{ color: 'var(--section-accent)' }}
                aria-hidden="true"
              >
                &ldquo;
              </span>

              <blockquote className="text-base leading-relaxed pt-8">
                {testimonial.quote}
              </blockquote>

              <figcaption
                className="flex items-center gap-3 mt-auto pt-4 border-t"
                style={{ borderColor: 'var(--section-border)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: 'var(--section-icon-bg)', color: 'var(--section-accent)' }}
                >
                  {(testimonial.author ?? 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{testimonial.author}</p>
                  {testimonial.role && (
                    <p className="text-xs" style={{ color: 'var(--section-fg-muted)' }}>
                      {testimonial.role}
                    </p>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
