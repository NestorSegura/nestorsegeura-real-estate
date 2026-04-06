'use client'

import type { AnchorHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost'

interface CTAButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant
  children: ReactNode
}

const styles: Record<Variant, { base: string; hover: string }> = {
  primary: {
    base: 'inline-flex items-center justify-center gap-2 rounded-full font-semibold text-base px-8 py-3.5 transition-all duration-200 bg-[var(--brand-purple)] text-white',
    hover: 'hover:bg-[#4a3490] hover:text-white hover:shadow-lg hover:shadow-[var(--brand-purple)]/20',
  },
  ghost: {
    base: 'inline-flex items-center justify-center gap-2 rounded-full font-semibold text-base px-8 py-3.5 transition-all duration-200 border-2 border-[var(--brand-purple)] text-[var(--brand-purple)] bg-transparent',
    hover: 'hover:bg-[var(--brand-purple)]/5 hover:text-[#4a3490]',
  },
}

export function CTAButton({ variant = 'primary', children, className = '', href, ...props }: CTAButtonProps) {
  const v = styles[variant]
  const isExternal = href?.startsWith('http')

  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`${v.base} ${v.hover} ${className}`}
      {...props}
    >
      {children}
    </a>
  )
}
