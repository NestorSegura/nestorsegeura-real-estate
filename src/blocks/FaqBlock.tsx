'use client'

import { useState } from 'react'
import { SectionWrapper } from '@/components/SectionWrapper'
import type { FaqBlock as FaqBlockType } from '@/types/sanity.types'

type FaqBlockProps = FaqBlockType & { _key?: string; sectionId?: string }

export function FaqBlock({
  title,
  faqs,
  colorScheme = 'light',
  spacing,
  sectionId,
}: FaqBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <SectionWrapper id={sectionId ?? 'faq'} scheme={colorScheme} spacing={spacing}>
      <div className="max-w-3xl mx-auto">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold mb-12 reveal">
            {title}
          </h2>
        )}

        <dl className="flex flex-col gap-2">
          {(faqs ?? []).map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <div
                key={faq._key}
                className="reveal rounded-xl overflow-hidden"
                style={{ background: 'var(--section-card-bg)' }}
              >
                <dt>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggle(index)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-lg transition-colors duration-150"
                  >
                    <span>{faq.question}</span>
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
                        stroke="var(--section-accent)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </dt>

                <dd style={{ maxHeight: isOpen ? '600px' : '0', overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                  <p className="px-6 pb-5 text-base leading-relaxed" style={{ color: 'var(--section-fg-muted)' }}>
                    {faq.answer}
                  </p>
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
    </SectionWrapper>
  )
}
