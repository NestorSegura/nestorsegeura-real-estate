'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PulseDotProps {
  x: number
  y: number
  label: string
  description: string
  side?: 'left' | 'right' | 'top' | 'bottom'
}

export function PulseDot({ x, y, label, description, side = 'right' }: PulseDotProps) {
  const [open, setOpen] = useState(false)

  const tooltipPosition: Record<string, string> = {
    right: 'left-full ml-3 top-1/2 -translate-y-1/2',
    left: 'right-full mr-3 top-1/2 -translate-y-1/2',
    top: 'bottom-full mb-3 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-3 left-1/2 -translate-x-1/2',
  }

  return (
    <div
      className="absolute z-10"
      style={{ left: `${x}%`, top: `${y}%` }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen(!open)}
    >
      {/* Pulse ring */}
      <span
        className="absolute -inset-2 rounded-full animate-ping"
        style={{ background: 'var(--brand-cyan)', opacity: 0.3 }}
      />
      <span
        className="absolute -inset-1.5 rounded-full animate-pulse"
        style={{ background: 'var(--brand-cyan)', opacity: 0.15 }}
      />

      {/* Dot */}
      <span
        className="relative block w-3.5 h-3.5 rounded-full border-2 border-white cursor-pointer"
        style={{ background: 'var(--brand-cyan)', boxShadow: '0 0 8px rgba(46, 207, 224, 0.5)' }}
      />

      {/* Tooltip */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${tooltipPosition[side]} w-56 pointer-events-none`}
          >
            <div
              className="rounded-lg p-3 text-left"
              style={{
                background: 'var(--brand-fg)',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--brand-cyan)' }}>
                {label}
              </p>
              <p className="text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
