'use client'

import { type ReactNode } from 'react'
import FadeIn from './FadeIn'
import { StackingCards, StackingCard } from './StackingCards'

interface ProblemItem {
  number: string
  title: string
  description: string
}

interface ProblemProps {
  headline: string
  intro: string
  problems: ProblemItem[]
  closing: string
}

const CARD_COLORS: Array<'default' | 'cyan' | 'purple' | 'dark'> = ['default', 'cyan', 'purple', 'dark']

function ProblemCardContent({ item, color }: { item: ProblemItem; color: string }) {
  const isDark = color === 'purple' || color === 'dark'
  return (
    <div className="flex flex-col gap-5 h-full">
      <span
        className="font-display font-black leading-none select-none"
        style={{
          fontSize: 'clamp(3rem, 6vw, 4.5rem)',
          letterSpacing: '-0.04em',
          color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(26,26,46,0.10)',
        }}
      >
        {item.number}
      </span>
      <h3
        className="font-display font-bold leading-tight"
        style={{ fontSize: 'clamp(1.35rem, 2.2vw, 1.75rem)' }}
      >
        {item.title}
      </h3>
      <p
        className="text-[0.9375rem] leading-relaxed mt-auto"
        style={{ color: isDark ? 'rgba(255,255,255,0.65)' : '#5a5a72' }}
      >
        {item.description}
      </p>
    </div>
  )
}

export default function Problem({ headline, intro, problems, closing }: ProblemProps) {
  return (
    <section
      id="problema"
      className="py-20 md:py-28 px-6"
      style={{ background: 'var(--brand-bg-subtle)' }}
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <h2
            className="font-display text-3xl md:text-4xl font-bold"
            style={{ color: 'var(--brand-fg)' }}
          >
            {headline}
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-lg mt-4 max-w-3xl" style={{ color: 'var(--brand-fg-muted)' }}>
            {intro}
          </p>
        </FadeIn>

        <div className="mt-14" style={{ '--stacking-top': '6.5rem' } as React.CSSProperties}>
          <StackingCards
            variant="fan"
            desktop={{
              enabled: true,
              rotate: [-4, 2, 5, -3],
              x: ['-10em', '0em', '10em', '0em'],
              y: ['1em', '0em', '2em', '1em'],
            }}
            tablet={{
              enabled: true,
              rotate: [0, 2, -2, 1],
              x: ['0em', '1em', '-1em', '0.5em'],
              y: ['0em', '0em', '0em', '0em'],
            }}
            mobile={{
              enabled: true,
              rotate: [0, 1, -1, 0],
              x: ['0em', '0em', '0em', '0em'],
              y: ['0em', '0em', '0em', '0em'],
            }}
          >
            {problems.map((item, i) => {
              const color = CARD_COLORS[i % CARD_COLORS.length]
              return (
                <StackingCard key={item.number} color={color} title="">
                  <ProblemCardContent item={item} color={color} />
                </StackingCard>
              )
            })}
          </StackingCards>
        </div>

        <FadeIn delay={0.2}>
          <p
            className="text-lg font-medium mt-14 text-center"
            style={{ color: 'var(--brand-purple)' }}
          >
            {closing}
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
