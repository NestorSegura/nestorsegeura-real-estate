'use client'

import { useRef } from 'react'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'
import type { ProblemSolutionBlock as ProblemSolutionBlockType } from '@/types/sanity.types'

type ProblemSolutionBlockProps = ProblemSolutionBlockType & { _key?: string; sectionId?: string }

/**
 * Problem/solution block — numbered list layout.
 * Large accent numbers, headline, description per item.
 * Staggered scroll reveal via Intersection Observer + CSS transitions.
 * No motion library.
 */
export function ProblemSolutionBlock({
  title,
  problems,
  colorScheme = 'light',
  spacing,
  sectionId,
}: ProblemSolutionBlockProps) {
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
      id={sectionId ?? 'problem'}
      className={`${spacingClass} px-6`}
      style={{
        background: isDark ? 'oklch(0.25 0.08 290)' : 'oklch(0.97 0.003 80)',
        color: isDark ? 'oklch(0.97 0.003 80)' : 'oklch(0.12 0 0)',
      }}
      data-color-scheme={colorScheme}
      data-spacing={spacing ?? 'normal'}
    >
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2
            className="text-3xl md:text-4xl font-bold mb-16 reveal"
            style={{ '--reveal-delay': '0ms' } as React.CSSProperties}
          >
            {title}
          </h2>
        )}

        <div className="flex flex-col gap-12">
          {(problems ?? []).map((problem, index) => (
            <div
              key={problem._key}
              className="reveal flex gap-8 items-start"
              style={{ '--reveal-delay': `${index * 120}ms` } as React.CSSProperties}
            >
              {/* Large accent number */}
              <span
                className="text-7xl md:text-8xl font-black leading-none tabular-nums shrink-0 select-none"
                style={{
                  color: isDark
                    ? 'oklch(0.72 0.14 290 / 0.4)'
                    : 'oklch(0.45 0.18 290 / 0.15)',
                  minWidth: '4rem',
                }}
                aria-hidden="true"
              >
                {String(problem.number ?? index + 1).padStart(2, '0')}
              </span>

              <div className="pt-2">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">{problem.headline}</h3>
                {problem.description && (
                  <p
                    className="text-lg leading-relaxed"
                    style={{ color: isDark ? 'oklch(0.80 0.003 80)' : 'oklch(0.45 0.01 80)' }}
                  >
                    {problem.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
