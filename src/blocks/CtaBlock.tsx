'use client'

import { useRef } from 'react'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'
import type { CtaBlock as CtaBlockType } from '@/types/sanity.types'

type CtaBlockProps = CtaBlockType & { _key?: string }

/**
 * CTA block — centered headline + subtext + button.
 * variant='primary': bold purple background, white text.
 * variant='secondary': light treatment, outline button.
 * Simple section-level reveal (no array items to stagger).
 * No motion library.
 */
export function CtaBlock({
  headline,
  subtext,
  ctaLabel,
  ctaHref,
  variant = 'primary',
  colorScheme = 'dark',
  spacing,
}: CtaBlockProps) {
  const containerRef = useRef<HTMLElement | null>(null)
  useRevealOnScroll(containerRef)

  const isPrimary = variant === 'primary'
  const spacingClass =
    spacing === 'compact'
      ? 'py-12 md:py-16'
      : spacing === 'spacious'
        ? 'py-24 md:py-32'
        : 'py-16 md:py-24'

  return (
    <section
      ref={containerRef}
      className={`${spacingClass} px-6 text-center`}
      style={{
        background: isPrimary
          ? 'oklch(0.45 0.18 290)'
          : colorScheme === 'dark'
            ? 'oklch(0.25 0.08 290)'
            : 'oklch(0.97 0.003 80)',
        color: isPrimary
          ? 'white'
          : colorScheme === 'dark'
            ? 'oklch(0.97 0.003 80)'
            : 'oklch(0.12 0 0)',
      }}
      data-color-scheme={colorScheme}
      data-spacing={spacing ?? 'normal'}
    >
      <div className="max-w-3xl mx-auto">
        {headline && (
          <h2
            className="text-3xl md:text-5xl font-bold mb-6 reveal"
            style={{ '--reveal-delay': '0ms' } as React.CSSProperties}
          >
            {headline}
          </h2>
        )}

        {subtext && (
          <p
            className="text-lg md:text-xl mb-10 opacity-90 reveal"
            style={{ '--reveal-delay': '100ms' } as React.CSSProperties}
          >
            {subtext}
          </p>
        )}

        {ctaHref && ctaLabel && (() => {
          const ctaStyle: Record<string, string> = { '--reveal-delay': '200ms' }
          if (isPrimary) {
            ctaStyle.background = 'white'
            ctaStyle.color = 'oklch(0.45 0.18 290)'
          } else {
            ctaStyle.border = '2px solid currentColor'
            ctaStyle.color =
              colorScheme === 'dark' ? 'oklch(0.72 0.14 290)' : 'oklch(0.45 0.18 290)'
          }
          return (
            <a
              href={ctaHref}
              className="reveal inline-block font-semibold text-lg px-10 py-4 rounded-full transition-all duration-200"
              style={ctaStyle as React.CSSProperties}
            >
              {ctaLabel}
            </a>
          )
        })()}
      </div>
    </section>
  )
}
