'use client'

import { SectionWrapper } from '@/components/SectionWrapper'
import { SectionButton } from '@/components/SectionButton'
import type { CtaBlock as CtaBlockType } from '@/types/sanity.types'

type CtaBlockProps = CtaBlockType & { _key?: string; sectionId?: string }

export function CtaBlock({
  headline,
  subtext,
  ctaLabel,
  ctaHref,
  variant = 'primary',
  colorScheme = 'dark',
  spacing,
  sectionId,
}: CtaBlockProps) {
  const isPrimary = variant === 'primary'

  return (
    <SectionWrapper
      id={sectionId ?? 'kontakt'}
      scheme={colorScheme}
      spacing={spacing}
      className="text-center"
    >
      {isPrimary && (
        <style>{`
          #${sectionId ?? 'kontakt'}[data-scheme] {
            --section-bg: var(--primary);
            --section-fg: var(--primary-foreground);
            --section-fg-muted: var(--primary-foreground);
            background: var(--primary) !important;
            color: var(--primary-foreground) !important;
          }
        `}</style>
      )}

      <div className="max-w-3xl mx-auto">
        {headline && (
          <h2 className="text-3xl md:text-5xl font-bold mb-6 reveal">
            {headline}
          </h2>
        )}

        {subtext && (
          <p className="text-lg md:text-xl mb-10 opacity-90 reveal">
            {subtext}
          </p>
        )}

        {ctaHref && ctaLabel && (
          <SectionButton
            href={ctaHref}
            variant={isPrimary ? 'inverted' : 'secondary'}
            size="lg"
            className="reveal"
          >
            {ctaLabel}
          </SectionButton>
        )}
      </div>
    </SectionWrapper>
  )
}
