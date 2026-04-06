'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type Tier = 'desktop' | 'tablet' | 'mobile-landscape' | 'mobile-portrait'

interface BreakpointConfig {
  enabled?: boolean
  rotate?: number[]
  x?: string[]
  y?: string[]
}

interface StackingCardsProps {
  children: ReactNode
  className?: string
  variant?: 'fan' | 'wide'
  desktop?: BreakpointConfig
  tablet?: BreakpointConfig
  mobile?: BreakpointConfig
}

type CardColor = 'default' | 'green' | 'dark' | 'purple' | 'cyan'

interface StackingCardProps {
  number?: string
  title: string
  items?: string[]
  color?: CardColor
  children?: ReactNode
  wide?: boolean
}

function getTier(): Tier {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1200
  if (w <= 479) return 'mobile-portrait'
  if (w <= 767) return 'mobile-landscape'
  if (w <= 991) return 'tablet'
  return 'desktop'
}

function pulse(el: HTMLElement) {
  const w = el.offsetWidth
  const h = el.offsetHeight
  const fs = parseFloat(getComputedStyle(el).fontSize)
  const stretch = 1.5 * fs
  const sx = (w + stretch) / w
  const sy = (h - stretch * 0.33) / h

  gsap.timeline()
    .to(el, { scaleX: sx, scaleY: sy, duration: 0.1, ease: 'power1.out' })
    .to(el, { scaleX: 1, scaleY: 1, duration: 1, ease: 'elastic.out(1, 0.3)' })
}

const FAN_DEFAULTS = {
  desktop: { enabled: true, rotate: [-5, 2, 6], x: ['-13.75em', '0em', '13em'], y: ['2.125em', '0em', '4.5em'] },
  tablet: { enabled: true, rotate: [0, 3, -3], x: ['0em', '1.5em', '-1.5em'], y: ['0em', '0em', '0em'] },
  mobile: { enabled: true, rotate: [0, 2, -2], x: ['0em', '1em', '-1em'], y: ['0em', '0em', '0em'] },
}

const WIDE_DEFAULTS = {
  desktop: { enabled: true, rotate: [0, 0, 0], x: ['0em', '0em', '0em'], y: ['0em', '0em', '0em'] },
  tablet: { enabled: true, rotate: [0, 0, 0], x: ['0em', '0em', '0em'], y: ['0em', '0em', '0em'] },
  mobile: { enabled: true, rotate: [0, 0, 0], x: ['0em', '0em', '0em'], y: ['0em', '0em', '0em'] },
}

export function StackingCards({
  children,
  className = '',
  variant = 'fan',
  desktop,
  tablet,
  mobile,
}: StackingCardsProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const defaults = variant === 'fan' ? FAN_DEFAULTS : WIDE_DEFAULTS
  const dConf = { ...defaults.desktop, ...desktop }
  const tConf = { ...defaults.tablet, ...tablet }
  const mConf = { ...defaults.mobile, ...mobile }

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let lastTier = getTier()
    const uid = Math.random().toString(36).slice(2, 8)

    function setup() {
      const tier = getTier()
      const config = tier === 'desktop' ? dConf : tier === 'tablet' ? tConf : mConf
      if (!config.enabled) return

      const cards = Array.from(section!.querySelectorAll<HTMLElement>('[data-stacking-card]'))
      if (!cards.length) return

      const topPx = parseFloat(getComputedStyle(cards[0]).top) || 0
      const rotateVals = config.rotate ?? [0]
      const xVals = config.x ?? ['0em']
      const yVals = config.y ?? ['0em']

      cards.forEach((card, i) => {
        const target = card.querySelector<HTMLElement>('[data-stacking-card-target]')
        if (!target) return

        gsap.set(target, { rotate: 0, x: 0, y: 0, scale: 1, zIndex: cards.length - i })

        gsap.to(target, {
          rotate: rotateVals[i % rotateVals.length],
          x: xVals[i % xVals.length],
          y: yVals[i % yVals.length],
          ease: 'power1.in',
          overwrite: 'auto',
          scrollTrigger: {
            id: `sc-rot-${uid}-${i}`,
            trigger: card,
            start: 'top 75%',
            end: `top-=${topPx} top`,
            scrub: true,
          },
        })

        ScrollTrigger.create({
          id: `sc-bounce-${uid}-${i}`,
          trigger: card,
          start: `top-=${topPx} top`,
          onEnter: () => pulse(target),
        })
      })

      ScrollTrigger.refresh()
    }

    function cleanup() {
      ScrollTrigger.getAll().forEach((t) => {
        const id = t.vars?.id?.toString() ?? ''
        if (id.startsWith(`sc-rot-${uid}`) || id.startsWith(`sc-bounce-${uid}`)) t.kill()
      })
      section!.querySelectorAll<HTMLElement>('[data-stacking-card-target]').forEach((el) => {
        gsap.killTweensOf(el)
        gsap.set(el, { clearProps: 'all' })
      })
    }

    setup()

    let resizeTimer: ReturnType<typeof setTimeout>
    let lastWidth = window.innerWidth

    function onResize() {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        if (window.innerWidth === lastWidth) return
        lastWidth = window.innerWidth
        const next = getTier()
        if (next !== lastTier) { cleanup(); lastTier = next; setup() }
      }, 250)
    }

    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); cleanup() }
  }, [dConf, tConf, mConf])

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  )
}

const COLORS: Record<CardColor, {
  bg: string; fg: string; number: string
  tagBg: string; tagFg: string; tagBorder: string
}> = {
  default: {
    bg: '#ffffff',
    fg: '#1a1a2e',
    number: 'rgba(26, 26, 46, 0.10)',
    tagBg: '#f4f3f6',
    tagFg: '#5a5a72',
    tagBorder: '#e8e6ef',
  },
  cyan: {
    bg: '#e6fafb',
    fg: '#0e4a4e',
    number: 'rgba(46, 207, 224, 0.18)',
    tagBg: '#ccf3f6',
    tagFg: '#0e4a4e',
    tagBorder: '#b0ecf0',
  },
  green: {
    bg: '#e8f5e9',
    fg: '#1b5e20',
    number: 'rgba(46,125,50,0.14)',
    tagBg: '#c8e6c9',
    tagFg: '#2e7d32',
    tagBorder: '#a5d6a7',
  },
  purple: {
    bg: '#5E42A6',
    fg: '#ffffff',
    number: 'rgba(255,255,255,0.12)',
    tagBg: 'rgba(255,255,255,0.12)',
    tagFg: 'rgba(255,255,255,0.9)',
    tagBorder: 'rgba(255,255,255,0.15)',
  },
  dark: {
    bg: '#1a1a2e',
    fg: '#ffffff',
    number: 'rgba(255,255,255,0.10)',
    tagBg: 'rgba(255,255,255,0.08)',
    tagFg: 'rgba(255,255,255,0.75)',
    tagBorder: 'rgba(255,255,255,0.1)',
  },
}

export function StackingCard({
  number,
  title,
  items,
  color = 'default',
  children,
  wide = false,
}: StackingCardProps) {
  const c = COLORS[color]

  return (
    <div
      data-stacking-card
      className={wide ? 'sticky' : 'sticky mx-auto'}
      style={{
        top: 'var(--stacking-top, 6.5rem)',
        maxWidth: wide ? 'clamp(40rem, 100%, 80rem)' : 'clamp(20rem, 35vw, 33.5rem)',
        paddingTop: '2rem',
      }}
    >
      <div
        data-stacking-card-target
        className="overflow-hidden"
        style={{
          background: c.bg,
          color: c.fg,
          borderRadius: 'clamp(1.5rem, 2.8vw, 2.75rem)',
          transformOrigin: 'center bottom',
          padding: wide ? 'clamp(2.5rem, 3.5vw, 3.5rem)' : 'clamp(2rem, 3.5vw, 3.5rem)',
          minHeight: wide ? 'clamp(24rem, 50vw, 48rem)' : 'clamp(22rem, 52vw, 32rem)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: wide ? 'space-between' : undefined,
        }}
      >
        {children ?? (
          wide ? (
            /* ── Wide variant: Osmo-style layout ── */
            <>
              {/* Number at the top */}
              {number && (
                <div>
                  <span
                    className="font-display font-medium select-none leading-none"
                    style={{
                      color: c.number,
                      fontSize: 'clamp(5rem, 9.5vw, 9rem)',
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {number}
                  </span>
                </div>
              )}

              {/* Title + items at the bottom */}
              <div className="flex flex-col justify-end">
                <h3
                  className="font-display font-semibold leading-[1.05]"
                  style={{
                    fontSize: 'clamp(2.5rem, 6.5vw, 6rem)',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {title}
                </h3>

                {items && items.length > 0 && (
                  <div className="flex flex-col gap-1 mt-6">
                    {items.map((item, i) => (
                      <p
                        key={i}
                        className="font-medium"
                        style={{
                          fontSize: 'clamp(0.875rem, 1.6vw, 1.5rem)',
                          opacity: 0.7,
                        }}
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ── Fan variant: compact card layout ── */
            <div className="flex flex-col gap-5">
              {number && (
                <span
                  className="font-display font-black select-none shrink-0 leading-none"
                  style={{
                    color: c.number,
                    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {number}
                </span>
              )}

              <div className="flex flex-col gap-4 flex-1 min-w-0">
                <h3
                  className="font-display font-bold leading-tight"
                  style={{
                    fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
                  }}
                >
                  {title}
                </h3>

                {items && items.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {items.map((item, i) => (
                      <span
                        key={i}
                        className="text-[0.8125rem] leading-snug px-3.5 py-2 rounded-lg"
                        style={{
                          background: c.tagBg,
                          color: c.tagFg,
                          border: `1px solid ${c.tagBorder}`,
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
