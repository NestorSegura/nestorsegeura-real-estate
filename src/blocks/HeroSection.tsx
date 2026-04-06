'use client'

import Image from 'next/image'
import { SectionWrapper } from '@/components/SectionWrapper'
import type { HeroSection as HeroSectionType } from '@/types/sanity.types'
import { urlFor } from '@/sanity/lib/image'

type HeroSectionProps = HeroSectionType & { _key?: string }

export function HeroSection({
  badge,
  headline,
  highlightedText,
  subheadline,
  ctaLabel,
  ctaHref,
  ctaSecondaryText,
  portraitImage,
  colorScheme,
  spacing,
}: HeroSectionProps) {
  const renderHeadline = () => {
    if (!headline) return null
    if (!highlightedText) return <span>{headline}</span>

    const idx = headline.toLowerCase().indexOf(highlightedText.toLowerCase())
    if (idx === -1) return <span>{headline}</span>

    const before = headline.slice(0, idx)
    const match = headline.slice(idx, idx + highlightedText.length)
    const after = headline.slice(idx + highlightedText.length)

    return (
      <>
        {before && <span>{before}</span>}
        <span style={{ color: 'var(--section-highlight)' }}>{match}</span>
        {after && <span>{after}</span>}
      </>
    )
  }

  const isExternalCta = ctaHref?.startsWith('http')

  const portraitUrl = portraitImage?.asset
    ? urlFor(portraitImage).width(896).height(1120).url()
    : null

  return (
    <SectionWrapper scheme={colorScheme ?? 'light'} spacing={spacing} className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-12 items-center">
          {/* Left Column — Text */}
          <div className="flex flex-col gap-8">
            {badge && (
              <div className="reveal">
                <span
                  className="inline-block px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-[1px]"
                  style={{
                    fontFamily: 'var(--font-chivo), sans-serif',
                    background: 'var(--section-accent)',
                    color: 'var(--section-accent-fg)',
                  }}
                >
                  {badge}
                </span>
              </div>
            )}

            <h1
              className="reveal text-4xl sm:text-5xl md:text-[60px] font-black uppercase leading-[1] tracking-[-3px]"
              style={{ fontFamily: 'var(--font-chivo), sans-serif' }}
            >
              {renderHeadline()}
            </h1>

            {subheadline && (
              <p
                className="reveal text-lg md:text-xl leading-relaxed max-w-xl"
                style={{ fontFamily: 'var(--font-chivo), sans-serif', fontWeight: 500, opacity: 0.8 }}
              >
                {subheadline}
              </p>
            )}

            {ctaLabel && ctaHref && (
              <div className="reveal flex flex-wrap items-center gap-6 pt-2">
                <a
                  href={ctaHref}
                  {...(isExternalCta ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="inline-flex items-center gap-2 text-lg font-normal transition-opacity duration-200 hover:opacity-70"
                  style={{ fontFamily: 'var(--font-chivo), sans-serif' }}
                >
                  <span
                    aria-hidden="true"
                    className="inline-block w-8 h-px"
                    style={{ background: 'var(--section-highlight)' }}
                  />
                  {ctaLabel}
                </a>

                {ctaSecondaryText && (
                  <span
                    className="text-sm font-bold uppercase tracking-[0.7px]"
                    style={{ fontFamily: 'var(--font-chivo), sans-serif', opacity: 0.4 }}
                  >
                    {ctaSecondaryText}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right Column — Portrait */}
          <div className="reveal relative flex justify-end">
            <div className="relative w-full max-w-[448px] aspect-[4/5]">
              <div
                className="absolute rounded-md"
                style={{ background: 'var(--section-icon-bg)', inset: '24px -24px -24px 24px' }}
              />

              <div
                className="relative w-full h-full rounded-md overflow-hidden"
                style={{ background: 'var(--section-card-bg)', border: '1px solid var(--section-border)' }}
              >
                {portraitUrl ? (
                  <Image
                    src={portraitUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 448px"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span
                      className="text-sm font-black uppercase tracking-[1.4px]"
                      style={{ fontFamily: 'var(--font-chivo), sans-serif', color: 'var(--section-fg-muted)', opacity: 0.3 }}
                    >
                      Portrait Placeholder
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
