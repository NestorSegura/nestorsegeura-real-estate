'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
}

export default function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    gsap.set(el, { opacity: 0, y: 24 })

    const tween = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay,
      ease: 'power2.out',
      paused: true,
    })

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      end: 'top 20%',
      onEnter: () => tween.play(),
      onLeaveBack: () => tween.reverse(),
      onEnterBack: () => tween.play(),
    })

    return () => {
      trigger.kill()
      tween.kill()
    }
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
