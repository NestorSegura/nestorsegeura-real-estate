'use client'

import { SectionWrapper } from '@/components/SectionWrapper'
import { SectionButton } from '@/components/SectionButton'
import type { ServicesBlock as ServicesBlockType } from '@/types/sanity.types'

type ServicesBlockProps = ServicesBlockType & { _key?: string; sectionId?: string }

export function ServicesBlock({
  title,
  services,
  colorScheme = 'light',
  spacing,
  sectionId,
}: ServicesBlockProps) {
  return (
    <SectionWrapper id={sectionId ?? 'leistungen'} scheme={colorScheme} spacing={spacing}>
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold mb-12 reveal">
            {title}
          </h2>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {(services ?? []).map((service, index) => (
            <div
              key={service._key}
              className="reveal p-8 rounded-2xl flex flex-col gap-5 overflow-hidden"
              style={{ background: 'var(--section-card-bg)' }}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl font-black tabular-nums" style={{ color: 'var(--section-accent)' }}>
                  {String(service.number ?? index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-2xl font-bold break-words">{service.name}</h3>
              </div>

              {service.description && (
                <p className="text-base leading-relaxed" style={{ color: 'var(--section-fg-muted)' }}>
                  {service.description}
                </p>
              )}

              {(service.features ?? []).length > 0 && (
                <ul className="flex flex-col gap-2">
                  {(service.features ?? []).map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm">
                      <span
                        className="mt-1 w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                        style={{ background: 'var(--section-accent)' }}
                        aria-hidden="true"
                      >
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true">
                          <path d="M1 3l2 2 4-4" stroke="var(--section-accent-fg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span style={{ color: 'var(--section-fg-muted)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              {service.ctaHref && service.ctaLabel && (
                <SectionButton href={service.ctaHref} variant="ghost" size="sm" className="mt-auto">
                  {service.ctaLabel} <span aria-hidden="true">&rarr;</span>
                </SectionButton>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
