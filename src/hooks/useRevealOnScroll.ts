'use client'

import { useEffect, type RefObject } from 'react'

interface UseRevealOnScrollOptions {
  threshold?: number
  rootMargin?: string
}

/**
 * Intersection Observer hook that adds 'is-visible' to elements with class 'reveal'
 * inside the container ref. CSS transitions handle the actual animation.
 * No motion library — CSS-only animations.
 */
export function useRevealOnScroll(
  ref: RefObject<HTMLElement | null>,
  options: UseRevealOnScrollOptions = {}
): void {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px' } = options

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const targets = container.querySelectorAll<HTMLElement>('.reveal')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            // Once visible, no need to observe further
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin }
    )

    targets.forEach((target) => observer.observe(target))

    return () => observer.disconnect()
  }, [ref, threshold, rootMargin])
}
