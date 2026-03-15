'use client'

import { useRef } from 'react'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'
import type { ServicesBlock as ServicesBlockType } from '@/types/sanity.types'

type ServicesBlockProps = ServicesBlockType & { _key?: string }

/**
 * Services block — card layout, 1 col mobile, 2 cols lg.
 * Each service shows number, name, description, feature bullets, optional CTA.
 * Staggered scroll reveal via Intersection Observer + CSS transitions.
 * No motion library.
 */
export function ServicesBlock({
  title,
  services,
  colorScheme = 'light',
  spacing,
}: ServicesBlockProps) {
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
            className="text-3xl md:text-4xl font-bold mb-12 reveal"
            style={{ '--reveal-delay': '0ms' } as React.CSSProperties}
          >
            {title}
          </h2>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {(services ?? []).map((service, index) => (
            <div
              key={service._key}
              className="reveal p-8 rounded-2xl flex flex-col gap-5"
              style={{
                '--reveal-delay': `${index * 100}ms`,
                background: isDark
                  ? 'oklch(0.30 0.08 290 / 0.5)'
                  : 'oklch(0.93 0.005 80)',
              } as React.CSSProperties}
            >
              {/* Service number */}
              <div className="flex items-center gap-4">
                <span
                  className="text-3xl font-black tabular-nums"
                  style={{
                    color: isDark ? 'oklch(0.72 0.14 290)' : 'oklch(0.45 0.18 290)',
                  }}
                >
                  {String(service.number ?? index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-2xl font-bold">{service.name}</h3>
              </div>

              {service.description && (
                <p
                  className="text-base leading-relaxed"
                  style={{ color: isDark ? 'oklch(0.80 0.003 80)' : 'oklch(0.45 0.01 80)' }}
                >
                  {service.description}
                </p>
              )}

              {/* Feature list */}
              {(service.features ?? []).length > 0 && (
                <ul className="flex flex-col gap-2">
                  {(service.features ?? []).map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm">
                      <span
                        className="mt-1 w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                        style={{
                          background: isDark ? 'oklch(0.45 0.18 290)' : 'oklch(0.45 0.18 290)',
                        }}
                        aria-hidden="true"
                      >
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true">
                          <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span style={{ color: isDark ? 'oklch(0.85 0.003 80)' : 'oklch(0.35 0.01 80)' }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {service.ctaHref && service.ctaLabel && (
                <a
                  href={service.ctaHref}
                  className="mt-auto inline-flex items-center gap-2 font-semibold text-sm transition-colors duration-200"
                  style={{ color: isDark ? 'oklch(0.72 0.14 290)' : 'oklch(0.45 0.18 290)' }}
                >
                  {service.ctaLabel}
                  <span aria-hidden="true">&rarr;</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
