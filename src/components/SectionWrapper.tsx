import type { ReactNode } from 'react'

export type SectionScheme = 'light' | 'dark'

interface SectionWrapperProps {
  id?: string
  scheme?: SectionScheme
  spacing?: 'compact' | 'normal' | 'spacious'
  className?: string
  children: ReactNode
}

const SPACING: Record<string, string> = {
  compact: 'py-12 md:py-16',
  normal: 'py-16 md:py-24',
  spacious: 'py-24 md:py-32',
}

/**
 * Wraps every page section.
 *
 * - Sets `data-scheme` → CSS cascades the correct `--section-*` tokens
 * - Renders `background: var(--section-bg)` so the section itself is always correct
 * - ScrollAnimations reads the computed background to animate the body
 * - Children just use `var(--section-fg)`, `var(--section-card-bg)`, etc.
 */
export function SectionWrapper({
  id,
  scheme = 'light',
  spacing = 'normal',
  className = '',
  children,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      data-scheme={scheme}
      className={`${SPACING[spacing]} px-6 ${className}`}
      style={{
        background: 'var(--section-bg)',
        color: 'var(--section-fg)',
      }}
    >
      {children}
    </section>
  )
}
