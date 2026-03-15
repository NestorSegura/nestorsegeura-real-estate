'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useState, useEffect, useRef, FormEvent } from 'react'

const CIRCUMFERENCE = 2 * Math.PI * 40

type Scores = {
  performance: number
  seo: number
  mobile: number
  conversion: number
  positioning: number
}

const CATEGORY_LABELS: Record<string, Record<keyof Scores, string>> = {
  de: {
    performance: 'Performance',
    seo: 'SEO',
    mobile: 'Mobile',
    conversion: 'Conversion',
    positioning: 'Positionierung',
  },
  en: {
    performance: 'Performance',
    seo: 'SEO',
    mobile: 'Mobile',
    conversion: 'Conversion',
    positioning: 'Positioning',
  },
  es: {
    performance: 'Rendimiento',
    seo: 'SEO',
    mobile: 'Móvil',
    conversion: 'Conversión',
    positioning: 'Posicionamiento',
  },
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'oklch(0.55 0.18 145)'
  if (score >= 50) return 'oklch(0.65 0.18 80)'
  return 'oklch(0.55 0.2 25)'
}

function ScoreGauge({
  score,
  label,
  animate,
}: {
  score: number
  label: string
  animate: boolean
}) {
  const offset = animate ? CIRCUMFERENCE * (1 - score / 100) : CIRCUMFERENCE
  const color = getScoreColor(score)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <svg width="100" height="100" viewBox="0 0 100 100" aria-label={`${label}: ${score}`}>
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="oklch(0.88 0.005 80)"
          strokeWidth="8"
        />
        {/* Score arc */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{
            transition: animate ? 'stroke-dashoffset 1s ease 0.2s' : 'none',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
        {/* Score text */}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: '22px', fontWeight: 700, fill: color }}
        >
          {score}
        </text>
      </svg>
      <span style={{ fontSize: '0.85rem', fontWeight: 500, textAlign: 'center', color: 'oklch(0.45 0.005 0)' }}>
        {label}
      </span>
    </div>
  )
}

export default function AnalysePageClient({ ctaHref }: { ctaHref: string }) {
  const t = useTranslations('analysis')
  const locale = useLocale()
  const labels = CATEGORY_LABELS[locale] ?? CATEGORY_LABELS['de']

  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scores, setScores] = useState<Scores | null>(null)
  const [animateGauges, setAnimateGauges] = useState(false)
  const scoresRef = useRef<Scores | null>(null)

  useEffect(() => {
    if (scores) {
      scoresRef.current = scores
      // Trigger animation after paint
      const id = setTimeout(() => setAnimateGauges(true), 50)
      return () => clearTimeout(id)
    }
  }, [scores])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setScores(null)
    setAnimateGauges(false)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
        return
      }

      setScores(data.scores as Scores)
    } catch {
      setError('Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung.')
    } finally {
      setLoading(false)
    }
  }

  const scoreCategories: (keyof Scores)[] = ['performance', 'seo', 'mobile', 'conversion', 'positioning']

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'oklch(0.97 0.002 80)',
        padding: '0 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '42rem',
          margin: '0 auto',
          paddingTop: '6rem',
          paddingBottom: '6rem',
        }}
      >
        {/* Heading */}
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: 'oklch(0.2 0.01 0)',
            marginBottom: '1rem',
          }}
        >
          {t('title')}
        </h1>
        <p
          style={{
            fontSize: '1.1rem',
            color: 'oklch(0.45 0.005 0)',
            marginBottom: '2.5rem',
            lineHeight: 1.6,
          }}
        >
          {t('subtitle')}
        </p>

        {/* URL form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('placeholder')}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem 1.25rem',
              fontSize: '1rem',
              border: '2px solid oklch(0.82 0.01 290)',
              borderRadius: '0.75rem',
              outline: 'none',
              background: 'white',
              color: 'oklch(0.2 0.01 0)',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.875rem 2rem',
              background: loading ? 'oklch(0.65 0.1 290)' : 'oklch(0.45 0.18 290)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '9999px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s ease',
              alignSelf: 'flex-start',
            }}
          >
            {loading ? t('loading') : t('submit')}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            style={{
              marginTop: '1.5rem',
              padding: '1rem 1.25rem',
              background: 'oklch(0.96 0.02 25)',
              border: '1px solid oklch(0.85 0.06 25)',
              borderRadius: '0.75rem',
              color: 'oklch(0.45 0.15 25)',
              fontSize: '0.95rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Score results */}
        {scores && (
          <section style={{ marginTop: '3rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'oklch(0.2 0.01 0)',
                marginBottom: '2rem',
              }}
            >
              {t('resultTitle')}
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                gap: '2rem',
                justifyItems: 'center',
              }}
            >
              {scoreCategories.map((category) => (
                <ScoreGauge
                  key={category}
                  score={scores[category]}
                  label={labels[category]}
                  animate={animateGauges}
                />
              ))}
            </div>

            {/* CTA */}
            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
              <a
                href={ctaHref}
                style={{
                  display: 'inline-block',
                  padding: '0.875rem 2.5rem',
                  background: 'oklch(0.45 0.18 290)',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  transition: 'background 0.2s ease',
                }}
              >
                {locale === 'de'
                  ? 'Erstgespräch vereinbaren'
                  : locale === 'es'
                    ? 'Reservar consulta inicial'
                    : 'Book initial consultation'}
              </a>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
