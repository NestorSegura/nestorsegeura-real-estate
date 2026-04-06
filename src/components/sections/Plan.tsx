'use client'

import FadeIn from './FadeIn'
import { StackingCards, StackingCard } from './StackingCards'

interface PlanStep {
  number: string
  title: string
  description: string
}

interface PlanProps {
  headline: string
  steps: PlanStep[]
}

const STEP_COLORS: Array<'default' | 'purple' | 'dark'> = ['default', 'purple', 'dark']

export default function Plan({ headline, steps }: PlanProps) {
  return (
    <section
      id="como-funciona"
      className="py-20 md:py-28 px-6"
      style={{ backgroundColor: 'var(--brand-bg-subtle)' }}
    >
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <h2
            className="font-display text-3xl md:text-4xl font-bold text-center"
            style={{ color: 'var(--brand-fg)' }}
          >
            {headline}
          </h2>
        </FadeIn>

        <div className="mt-16" style={{ '--stacking-top': '6.5rem' } as React.CSSProperties}>
          <StackingCards variant="wide">
            {steps.map((step, i) => (
              <StackingCard
                key={i}
                wide
                number={`${step.number}.`}
                title={step.title}
                items={[step.description]}
                color={STEP_COLORS[i % STEP_COLORS.length]}
              />
            ))}
          </StackingCards>
        </div>
      </div>
    </section>
  )
}
