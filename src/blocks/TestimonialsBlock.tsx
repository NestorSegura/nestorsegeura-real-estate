'use client'

import { useRef } from 'react'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'
import type { TestimonialsBlock as TestimonialsBlockType } from '@/types/sanity.types'

type TestimonialsBlockProps = TestimonialsBlockType & { _key?: string }

/**
 * Testimonials grid with quote cards.
 * Staggered scroll reveal via Intersection Observer + CSS transitions.
 * No motion library.
 */
export function TestimonialsBlock({
  title,
  testimonials,
  colorScheme = 'light',
  spacing,
}: TestimonialsBlockProps) {
  const containerRef = useRef<HTMLElement | null>(null)
  useRevealOnScroll(containerRef)

  const isDark = colorScheme === 'dark'
  const spacingClass =
    spacing === 'compact'
      ? 'py-12 md:py-16'
      : spacing === 'spacious'
        ? 'py-24 md:py-32'
        : 'py-16 md:py-24'

  return (
    <section
      ref={containerRef}
      className={`${spacingClass} px-6`}
      style={{
        background: isDark ? 'oklch(0.25 0.08 290)' : 'oklch(0.97 0.003 80)',
        color: isDark ? 'oklch(0.97 0.003 80)' : 'oklch(0.12 0 0)',
      }}
      data-color-scheme={colorScheme}
      data-spacing={spacing ?? 'normal'}
    >
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 reveal"
            style={{ '--reveal-delay': '0ms' } as React.CSSProperties}
          >
            {title}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(testimonials ?? []).map((testimonial, index) => (
            <figure
              key={testimonial._key}
              className="reveal flex flex-col gap-4 p-8 rounded-2xl relative"
              style={{
                '--reveal-delay': `${index * 100}ms`,
                background: isDark
                  ? 'oklch(0.30 0.08 290 / 0.6)'
                  : 'oklch(0.93 0.005 80)',
              } as React.CSSProperties}
            >
              {/* Opening quote mark */}
              <span
                className="text-6xl font-serif leading-none select-none absolute top-4 left-6 opacity-30"
                style={{ color: isDark ? 'oklch(0.72 0.14 290)' : 'oklch(0.45 0.18 290)' }}
                aria-hidden="true"
              >
                &ldquo;
              </span>

              <blockquote className="text-base leading-relaxed pt-8">
                {testimonial.quote}
              </blockquote>

              <figcaption className="flex items-center gap-3 mt-auto pt-4 border-t"
                style={{ borderColor: isDark ? 'oklch(1 0 0 / 10%)' : 'oklch(0.88 0.005 80)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: isDark ? 'oklch(0.45 0.18 290)' : 'oklch(0.88 0.015 290)',
                    color: isDark ? 'white' : 'oklch(0.45 0.18 290)',
                  }}
                >
                  {(testimonial.author ?? 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{testimonial.author}</p>
                  {testimonial.role && (
                    <p
                      className="text-xs"
                      style={{ color: isDark ? 'oklch(0.70 0.003 80)' : 'oklch(0.50 0.01 80)' }}
                    >
                      {testimonial.role}
                    </p>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
