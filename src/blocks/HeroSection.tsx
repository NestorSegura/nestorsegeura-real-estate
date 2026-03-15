'use client'

import { useRef, useEffect } from 'react'
import type { HeroSection as HeroSectionType } from '@/types/sanity.types'

type HeroSectionProps = HeroSectionType & { _key?: string }

/**
 * Hero section — always dark/purple background.
 * Supports three variants:
 * - svgPath: animated SVG path drawing on mount (stroke-dasharray/dashoffset)
 * - backgroundImage: full-bleed cover image with dark overlay
 * - textOnly: centered text, no visual decoration
 *
 * Headline words each get a CSS reveal transition (word-by-word stagger).
 * No framer-motion, GSAP, or @motionone — CSS transitions only.
 */
export function HeroSection({
  headline,
  subheadline,
  ctaLabel,
  ctaHref,
  variant = 'svgPath',
  colorScheme,
  spacing,
}: HeroSectionProps) {
  const pathRef = useRef<SVGPathElement | null>(null)
  const startDotRef = useRef<SVGCircleElement | null>(null)
  const endDotRef = useRef<SVGCircleElement | null>(null)

  // SVG path draw animation using stroke-dasharray / dashoffset
  useEffect(() => {
    if (variant !== 'svgPath') return
    const path = pathRef.current
    if (!path) return

    const length = path.getTotalLength()
    path.style.setProperty('--path-length', String(length))
    path.style.strokeDasharray = String(length)
    path.style.strokeDashoffset = String(length)

    // Trigger reflow then start animation
    void path.getBoundingClientRect()
    path.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s'
    path.style.strokeDashoffset = '0'

    // Fade in endpoint dots after path draws
    const timeout = setTimeout(() => {
      if (startDotRef.current) startDotRef.current.style.opacity = '1'
      if (endDotRef.current) endDotRef.current.style.opacity = '1'
    }, 2400)

    return () => clearTimeout(timeout)
  }, [variant])

  // Split headline into word spans for word-by-word reveal
  const words = (headline ?? '').split(' ')

  const spacingClass =
    spacing === 'compact'
      ? 'py-16 md:py-24'
      : spacing === 'spacious'
        ? 'py-32 md:py-48'
        : 'py-24 md:py-36'

  return (
    <section
      className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden ${spacingClass}`}
      style={{ background: 'oklch(0.25 0.08 290)' }}
      data-color-scheme={colorScheme ?? 'dark'}
      data-spacing={spacing ?? 'normal'}
    >
      {/* SVG path animation variant */}
      {variant === 'svgPath' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-30">
          <svg
            viewBox="0 0 600 400"
            className="w-full max-w-2xl"
            fill="none"
            aria-hidden="true"
          >
            {/* Journey path: bottom-left to top-right */}
            <path
              ref={pathRef}
              d="M 60 340 C 120 300, 180 260, 240 200 C 300 140, 380 100, 540 60"
              stroke="oklch(0.72 0.14 290)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Start dot (origin) */}
            <circle
              ref={startDotRef}
              cx="60"
              cy="340"
              r="8"
              fill="oklch(0.72 0.14 290)"
              style={{ opacity: 0, transition: 'opacity 0.4s ease' }}
            />
            {/* End dot (goal) */}
            <circle
              ref={endDotRef}
              cx="540"
              cy="60"
              r="8"
              fill="oklch(0.85 0.10 290)"
              style={{ opacity: 0, transition: 'opacity 0.4s ease 0.2s' }}
            />
            {/* Start label: house icon approximation */}
            <rect x="42" y="355" width="36" height="2" rx="1" fill="oklch(0.72 0.14 290)" opacity="0.6" />
            {/* End label: star icon approximation */}
            <polygon
              points="540,44 543,52 552,52 545,57 548,65 540,60 532,65 535,57 528,52 537,52"
              fill="oklch(0.85 0.10 290)"
              opacity="0.8"
            />
          </svg>
        </div>
      )}

      {/* Background image variant */}
      {variant === 'backgroundImage' && (
        <div className="absolute inset-0 bg-[oklch(0.25_0.08_290)]">
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Word-by-word headline reveal */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight mb-6">
          {words.map((word, i) => (
            <span
              key={i}
              className="inline-block reveal"
              style={{ '--reveal-delay': `${i * 80}ms` } as React.CSSProperties}
            >
              {word}
              {i < words.length - 1 ? '\u00a0' : ''}
            </span>
          ))}
        </h1>

        {subheadline && (
          <p
            className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-10 reveal"
            style={{ '--reveal-delay': `${words.length * 80 + 100}ms` } as React.CSSProperties}
          >
            {subheadline}
          </p>
        )}

        {ctaHref && ctaLabel && (
          <a
            href={ctaHref}
            className="reveal inline-block bg-[oklch(0.72_0.14_290)] hover:bg-[oklch(0.65_0.16_290)] text-white font-semibold text-lg px-10 py-4 rounded-full transition-colors duration-200"
            style={{ '--reveal-delay': `${words.length * 80 + 300}ms` } as React.CSSProperties}
          >
            {ctaLabel}
          </a>
        )}
      </div>
    </section>
  )
}
