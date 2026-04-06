'use client'

import { SectionWrapper } from '@/components/SectionWrapper'
import type { ProblemSolutionBlock as ProblemSolutionBlockType } from '@/types/sanity.types'

type ProblemSolutionBlockProps = ProblemSolutionBlockType & { _key?: string; sectionId?: string }

export function ProblemSolutionBlock({
  title,
  problems,
  colorScheme = 'light',
  spacing,
  sectionId,
}: ProblemSolutionBlockProps) {
  return (
    <SectionWrapper id={sectionId ?? 'problem'} scheme={colorScheme} spacing={spacing}>
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold mb-16 reveal">
            {title}
          </h2>
        )}

        <div className="flex flex-col gap-12">
          {(problems ?? []).map((problem, index) => (
            <div key={problem._key} className="reveal flex gap-8 items-start">
              <span
                className="text-7xl md:text-8xl font-black leading-none tabular-nums shrink-0 select-none"
                style={{ color: 'var(--section-accent)', opacity: 0.25, minWidth: '4rem' }}
                aria-hidden="true"
              >
                {String(problem.number ?? index + 1).padStart(2, '0')}
              </span>

              <div className="pt-2">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">{problem.headline}</h3>
                {problem.description && (
                  <p className="text-lg leading-relaxed" style={{ color: 'var(--section-fg-muted)' }}>
                    {problem.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
