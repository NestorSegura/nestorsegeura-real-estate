// Server component — no 'use client' needed

interface GradientDividerProps {
  from: 'light' | 'dark'
  to: 'light' | 'dark'
}

const DARK_COLOR = 'oklch(0.25 0.08 290)'
const LIGHT_COLOR = 'oklch(0.97 0.003 80)'

/**
 * Renders an 80px gradient transition between color scheme zones.
 * Returns null when from === to (no transition needed).
 */
export function GradientDivider({ from, to }: GradientDividerProps) {
  if (from === to) return null

  const fromColor = from === 'dark' ? DARK_COLOR : LIGHT_COLOR
  const toColor = to === 'dark' ? DARK_COLOR : LIGHT_COLOR

  return (
    <div
      aria-hidden="true"
      style={{
        height: '80px',
        background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`,
        width: '100%',
        display: 'block',
      }}
    />
  )
}
