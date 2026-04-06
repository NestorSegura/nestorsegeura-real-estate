'use client'

import { useState } from 'react'
import FadeIn from './FadeIn'

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  headline: string
  faqs: FAQItem[]
}

export default function FAQ({ headline, faqs }: FAQProps) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 md:py-28 px-6" style={{ background: 'var(--brand-bg)' }}>
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: 'var(--brand-fg)' }}>
            {headline}
          </h2>

          <div className="flex flex-col gap-3 mt-12">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ background: 'var(--brand-bg-subtle)', border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-medium text-base"
                  style={{ color: 'var(--brand-fg)' }}
                >
                  {faq.question}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    style={{
                      stroke: 'var(--brand-purple)',
                      transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.35s ease',
                      flexShrink: 0,
                    }}
                  >
                    <path d="M5 7.5l5 5 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div
                  style={{
                    maxHeight: open === i ? '600px' : '0',
                    transition: 'max-height 0.35s ease',
                    overflow: 'hidden',
                  }}
                >
                  <p className="px-6 pb-5 text-base leading-relaxed" style={{ color: 'var(--brand-fg-muted)' }}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
