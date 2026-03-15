'use client'

import { useRef, useState } from 'react'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'
import type { FaqBlock as FaqBlockType } from '@/types/sanity.types'

type FaqBlockProps = FaqBlockType & { _key?: string }

/**
 * FAQ accordion block.
 * - Click question to expand/collapse answer
 * - One item open at a time (closing others when opening new one)
 * - Smooth height via CSS max-height transition trick
 * - Staggered reveal on scroll via Intersection Observer + CSS transitions
 * No motion library.
 */
export function FaqBlock({
  title,
  faqs,
  colorScheme = 'light',
  spacing,
}: FaqBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)
  useRevealOnScroll(containerRef)

  const isDark = colorScheme === 'dark'
  const spacingClass =
    spacing === 'compact'
      ? 'py-12 md:py-16'
      : spacing === 'spacious'
        ? 'py-24 md:py-32'
        : 'py-16 md:py-24'

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

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
      <div className="max-w-3xl mx-auto">
        {title && (
          <h2
            className="text-3xl md:text-4xl font-bold mb-12 reveal"
            style={{ '--reveal-delay': '0ms' } as React.CSSProperties}
          >
            {title}
          </h2>
        )}

        {/* accordion */}
        <dl className="flex flex-col gap-2">
          {(faqs ?? []).map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <div
                key={faq._key}
                className="reveal rounded-xl overflow-hidden"
                style={{
                  '--reveal-delay': `${index * 80}ms`,
                  background: isDark
                    ? 'oklch(0.30 0.08 290 / 0.5)'
                    : 'oklch(0.93 0.005 80)',
                } as React.CSSProperties}
              >
                {/* Question trigger */}
                <dt>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggle(index)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-lg transition-colors duration-150"
                    style={{
                      color: isDark ? 'oklch(0.97 0.003 80)' : 'oklch(0.12 0 0)',
                    }}
                  >
                    <span>{faq.question}</span>
                    {/* Chevron icon — rotates when open */}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                      className="shrink-0 transition-transform duration-300"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      <path
                        d="M5 7.5l5 5 5-5"
                        stroke={isDark ? 'oklch(0.72 0.14 290)' : 'oklch(0.45 0.18 290)'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </dt>

                {/* Answer panel — max-height accordion transition */}
                <dd
                  style={{
                    maxHeight: isOpen ? '600px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.35s ease',
                  }}
                >
                  <p
                    className="px-6 pb-5 text-base leading-relaxed"
                    style={{ color: isDark ? 'oklch(0.80 0.003 80)' : 'oklch(0.45 0.01 80)' }}
                  >
                    {faq.answer}
                  </p>
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}
