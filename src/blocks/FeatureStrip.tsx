'use client'

import { SectionWrapper } from '@/components/SectionWrapper'
import type { FeatureStrip as FeatureStripType } from '@/types/sanity.types'

type FeatureStripProps = FeatureStripType & { _key?: string; sectionId?: string }

export function FeatureStrip({
  title,
  features,
  colorScheme = 'light',
  spacing,
  sectionId,
}: FeatureStripProps) {
  return (
    <SectionWrapper id={sectionId ?? 'features'} scheme={colorScheme} spacing={spacing}>
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 reveal">
            {title}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(features ?? []).map((feature, index) => (
            <div
              key={feature._key}
              className="reveal flex flex-col gap-4 p-6 rounded-2xl overflow-hidden"
              style={{ background: 'var(--section-card-bg)' }}
            >
              {feature.icon && (
                <span
                  className="text-3xl min-w-12 h-12 px-3 flex items-center justify-center rounded-xl overflow-hidden whitespace-nowrap"
                  style={{ background: 'var(--section-icon-bg)' }}
                  aria-hidden="true"
                >
                  {feature.icon}
                </span>
              )}
              <h3 className="text-xl font-semibold break-words">{feature.title}</h3>
              {feature.description && (
                <p className="text-base leading-relaxed" style={{ color: 'var(--section-fg-muted)' }}>
                  {feature.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
