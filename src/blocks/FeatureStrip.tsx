'use client'

import { useRef } from 'react'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'
import type { FeatureStrip as FeatureStripType } from '@/types/sanity.types'

type FeatureStripProps = FeatureStripType & { _key?: string; sectionId?: string }

/**
 * Feature strip — grid of icon + title + description cards.
 * Staggered scroll reveal via Intersection Observer + CSS transitions.
 * No motion library.
 */
export function FeatureStrip({
  title,
  features,
  colorScheme = 'light',
  spacing,
  sectionId,
}: FeatureStripProps) {
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
      id={sectionId ?? 'features'}
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
          {(features ?? []).map((feature, index) => (
            <div
              key={feature._key}
              className="reveal flex flex-col gap-4 p-6 rounded-2xl"
              style={{
                '--reveal-delay': `${index * 100}ms`,
                background: isDark
                  ? 'oklch(0.30 0.08 290 / 0.5)'
                  : 'oklch(0.93 0.005 80)',
              } as React.CSSProperties}
            >
              {feature.icon && (
                <span
                  className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl"
                  style={{ background: isDark ? 'oklch(0.45 0.18 290 / 0.3)' : 'oklch(0.88 0.015 290)' }}
                  aria-hidden="true"
                >
                  {feature.icon}
                </span>
              )}
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              {feature.description && (
                <p
                  className="text-base leading-relaxed"
                  style={{ color: isDark ? 'oklch(0.80 0.003 80)' : 'oklch(0.45 0.01 80)' }}
                >
                  {feature.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
