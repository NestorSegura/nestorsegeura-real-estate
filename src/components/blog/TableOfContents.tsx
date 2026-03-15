'use client'

import { useEffect, useState, useCallback } from 'react'
import type { TocItem } from '@/lib/blog'

interface TableOfContentsProps {
  headings: TocItem[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      // Find the first intersecting entry
      const intersecting = entries.filter((e) => e.isIntersecting)
      if (intersecting.length > 0) {
        setActiveId(intersecting[0].target.id)
      }
    },
    []
  )

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    })

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings, handleObserver])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setActiveId(id)
    }
  }

  if (headings.length === 0) return null

  return (
    <nav aria-label="Inhaltsverzeichnis">
      <p className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
        Inhalt
      </p>
      <ul className="space-y-1 border-l-2 border-border">
        {headings.map((heading) => {
          const isActive = activeId === heading.id
          const isH3 = heading.level === 'h3'
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={[
                  'block text-sm py-0.5 transition-colors border-l-2 -ml-0.5',
                  isH3 ? 'pl-5' : 'pl-3',
                  isActive
                    ? 'text-primary font-medium border-primary'
                    : 'text-muted-foreground hover:text-foreground border-transparent',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {heading.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
