'use client'

import { SectionWrapper } from '@/components/SectionWrapper'
import { SectionButton } from '@/components/SectionButton'
import type { ReferencesBlock as ReferencesBlockType } from '@/types/sanity.types'

type ReferencesBlockProps = ReferencesBlockType & { _key?: string; sectionId?: string }

export function ReferencesBlock({
  title,
  references,
  colorScheme = 'light',
  spacing,
  sectionId,
}: ReferencesBlockProps) {
  return (
    <SectionWrapper id={sectionId ?? 'projekte'} scheme={colorScheme} spacing={spacing}>
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold mb-12 reveal">
            {title}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(references ?? []).map((reference) => (
            <article
              key={reference._key}
              className="reveal rounded-2xl overflow-hidden flex flex-col"
              style={{ background: 'var(--section-card-bg)' }}
            >
              <div
                className="w-full aspect-video flex items-center justify-center"
                style={{ background: 'var(--section-icon-bg)' }}
              >
                <span className="text-4xl opacity-40" aria-hidden="true">&#9632;</span>
              </div>

              <div className="p-6 flex flex-col gap-3 flex-1">
                <h3 className="text-xl font-bold">{reference.name}</h3>

                {reference.description && (
                  <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--section-fg-muted)' }}>
                    {reference.description}
                  </p>
                )}

                {reference.url && (
                  <SectionButton href={reference.url} variant="ghost" size="sm" className="mt-auto">
                    Projekt ansehen <span aria-hidden="true">&rarr;</span>
                  </SectionButton>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
