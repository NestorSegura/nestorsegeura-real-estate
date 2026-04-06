'use client'

import type { ReactNode, AnchorHTMLAttributes } from 'react'

/**
 * Button variants that work with the section color scheme system.
 *
 * Reads `--section-*` CSS vars from the nearest [data-scheme] ancestor.
 * Hover: darker background, brighter text.
 *
 * Variants:
 * - `primary`  — solid accent bg, accent-fg text
 * - `secondary`— outlined, accent-colored text
 * - `ghost`    — text-only accent link with arrow
 * - `inverted` — solid fg bg, accent-colored text (for CTA blocks on accent backgrounds)
 */

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverted'
type Size = 'sm' | 'md' | 'lg'

interface SectionButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'text-sm px-5 py-2',
  md: 'text-base px-8 py-3',
  lg: 'text-lg px-10 py-4',
}

interface VariantConfig {
  base: React.CSSProperties
  className: string
  hover: (el: HTMLElement) => void
  unhover: (el: HTMLElement, base: React.CSSProperties) => void
}

const VARIANTS: Record<Variant, VariantConfig> = {
  primary: {
    base: { background: 'var(--section-accent)', color: 'var(--section-accent-fg)' },
    className: 'rounded-full font-semibold',
    hover: (el) => {
      el.style.filter = 'brightness(0.85)'
      el.style.color = '#ffffff'
    },
    unhover: (el, base) => {
      el.style.filter = 'none'
      el.style.color = base.color as string
    },
  },
  secondary: {
    base: { border: '2px solid var(--section-accent)', color: 'var(--section-accent)', background: 'transparent' },
    className: 'rounded-full font-semibold',
    hover: (el) => {
      el.style.background = 'var(--section-accent)'
      el.style.color = 'var(--section-accent-fg)'
    },
    unhover: (el, base) => {
      el.style.background = base.background as string
      el.style.color = base.color as string
    },
  },
  ghost: {
    base: { color: 'var(--section-accent)', background: 'transparent' },
    className: 'inline-flex items-center gap-2 font-semibold',
    hover: (el) => {
      el.style.color = 'var(--section-highlight)'
    },
    unhover: (el, base) => {
      el.style.color = base.color as string
    },
  },
  inverted: {
    base: { background: 'var(--section-accent-fg)', color: 'var(--section-accent)' },
    className: 'rounded-full font-semibold',
    hover: (el) => {
      el.style.filter = 'brightness(0.85)'
      el.style.color = '#ffffff'
    },
    unhover: (el, base) => {
      el.style.filter = 'none'
      el.style.color = base.color as string
    },
  },
}

export function SectionButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  href,
  ...props
}: SectionButtonProps) {
  const v = VARIANTS[variant]
  const isExternal = href?.startsWith('http')

  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`inline-block transition-all duration-200 ${SIZE_CLASSES[size]} ${v.className} ${className}`}
      style={v.base}
      onMouseEnter={(e) => v.hover(e.currentTarget)}
      onMouseLeave={(e) => v.unhover(e.currentTarget, v.base)}
      {...props}
    >
      {children}
    </a>
  )
}
