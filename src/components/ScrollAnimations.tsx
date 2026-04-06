'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * GSAP-powered scroll animations:
 * 1. Page background morphs to each section's computed bg color on scroll
 * 2. Section content fades in with stagger
 * 3. All animations reverse on scroll back
 *
 * Reads the actual computed `background-color` from each SectionWrapper
 * so CSS variables (including oklch) are resolved by the browser first,
 * then GSAP gets a standard rgb/lab value it can interpolate.
 */
export function ScrollAnimations({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const sections = wrapper.querySelectorAll<HTMLElement>('section[data-scheme]')
    if (sections.length === 0) return

    const body = document.body
    const tweens: gsap.core.Tween[] = []
    const triggers: ScrollTrigger[] = []

    // Set initial body background to match the first section
    const firstBg = window.getComputedStyle(sections[0]).backgroundColor
    gsap.set(body, { backgroundColor: firstBg })

    sections.forEach((section, i) => {
      const computedBg = window.getComputedStyle(section).backgroundColor

      // Animate body background to match the section entering the viewport
      const bgTween = gsap.to(body, {
        backgroundColor: computedBg,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 30%',
          scrub: true,
        },
      })
      tweens.push(bgTween)

      // Content reveal animations
      const reveals = section.querySelectorAll('.reveal')
      if (reveals.length === 0) return

      if (i === 0) {
        // Hero: animate in immediately on page load
        gsap.set(reveals, { opacity: 0, y: 30 })
        tweens.push(
          gsap.to(reveals, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power2.out',
            delay: 0.2,
          })
        )
      } else {
        // Other sections: enter/leave with reverse
        gsap.set(reveals, { opacity: 0, y: 40 })

        const st = ScrollTrigger.create({
          trigger: section,
          start: 'top 65%',
          end: 'bottom 20%',
          onEnter: () => {
            gsap.to(reveals, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: 'power2.out',
              overwrite: true,
            })
          },
          onLeaveBack: () => {
            gsap.to(reveals, {
              opacity: 0,
              y: 40,
              duration: 0.4,
              stagger: 0.04,
              ease: 'power2.in',
              overwrite: true,
            })
          },
        })
        triggers.push(st)
      }
    })

    return () => {
      tweens.forEach((t) => t.kill())
      triggers.forEach((t) => t.kill())
      gsap.set(body, { clearProps: 'backgroundColor' })
    }
  }, [])

  return <div ref={wrapperRef}>{children}</div>
}
