'use client'

import { useRef } from 'react'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'
import type { ReferencesBlock as ReferencesBlockType } from '@/types/sanity.types'

type ReferencesBlockProps = ReferencesBlockType & { _key?: string }

/**
 * References/portfolio block — grid of cards with image, name, description, optional link.
 * Staggered scroll reveal via Intersection Observer + CSS transitions.
 * No motion library.
 */
export function ReferencesBlock({
  title,
  references,
  colorScheme = 'light',
  spacing,
}: ReferencesBlockProps) {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(references ?? []).map((reference, index) => (
            <article
              key={reference._key}
              className="reveal rounded-2xl overflow-hidden flex flex-col"
              style={{
                '--reveal-delay': `${index * 100}ms`,
                background: isDark
                  ? 'oklch(0.30 0.08 290 / 0.5)'
                  : 'oklch(0.93 0.005 80)',
              } as React.CSSProperties}
            >
              {/* Image placeholder or image */}
              <div
                className="w-full aspect-video flex items-center justify-center"
                style={{
                  background: isDark
                    ? 'oklch(0.35 0.10 290 / 0.4)'
                    : 'oklch(0.88 0.010 290)',
                }}
              >
                <span
                  className="text-4xl opacity-40"
                  aria-hidden="true"
                >
                  &#9632;
                </span>
              </div>

              <div className="p-6 flex flex-col gap-3 flex-1">
                <h3 className="text-xl font-bold">{reference.name}</h3>

                {reference.description && (
                  <p
                    className="text-sm leading-relaxed flex-1"
                    style={{ color: isDark ? 'oklch(0.80 0.003 80)' : 'oklch(0.45 0.01 80)' }}
                  >
                    {reference.description}
                  </p>
                )}

                {reference.url && (
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold mt-auto transition-opacity duration-200 hover:opacity-70"
                    style={{ color: isDark ? 'oklch(0.72 0.14 290)' : 'oklch(0.45 0.18 290)' }}
                  >
                    Projekt ansehen
                    <span aria-hidden="true">&rarr;</span>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
