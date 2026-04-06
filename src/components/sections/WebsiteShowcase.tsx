'use client'

import Image from 'next/image'
import FadeIn from './FadeIn'
import { PulseDot } from './PulseDot'
import imgDE from '@/assets/mm-immobilien-desktop.png'
import imgES from '@/assets/mm-immobilien-desktop-es.png'
import imgEN from '@/assets/mm-immobilien-desktop-en.png'

type Locale = 'es' | 'de' | 'en'

interface Annotation {
  x: number
  y: number
  label: string
  description: string
  side: 'left' | 'right'
}

const ANNOTATIONS: Record<Locale, Annotation[]> = {
  es: [
    { x: 88, y: 4, label: 'CTA visible desde el primer scroll', description: 'Un botón de acción claro y visible en el navbar asegura que el visitante siempre tenga un camino directo hacia la conversión.', side: 'left' },
    { x: 32, y: 22, label: 'H1 con nicho + localidad', description: '"Immobilien Frankfurt für Familien" — posicionamiento claro que le dice a Google y al visitante exactamente a quién ayudas y dónde.', side: 'right' },
    { x: 22, y: 48, label: 'Copy orientado a conversión', description: 'El texto habla directamente al dolor del cliente ideal, no a las características del servicio. Genera conexión emocional y confianza.', side: 'right' },
    { x: 30, y: 67, label: 'CTAs segmentados por intención', description: 'Dos botones que separan intenciones de búsqueda: "mieten" vs "kaufen". Cada uno lleva a una página optimizada para esa keyword.', side: 'right' },
    { x: 78, y: 62, label: 'Social proof visible', description: 'Fotos reales, estrellas y la etiqueta "Glückliche Familien" construyen confianza instantánea — el visitante ve que otros como él ya confiaron.', side: 'left' },
    { x: 18, y: 88, label: 'Métricas de autoridad', description: '+340 familias, 4.9/5 valoración, 14 años de experiencia. Números concretos que eliminan objeciones y aceleran la decisión.', side: 'right' },
  ],
  de: [
    { x: 88, y: 4, label: 'CTA sichtbar ab dem ersten Scroll', description: 'Ein klarer, sichtbarer Aktionsbutton in der Navigation stellt sicher, dass der Besucher immer einen direkten Weg zur Kontaktaufnahme hat.', side: 'left' },
    { x: 32, y: 22, label: 'H1 mit Nische + Standort', description: '"Immobilien Frankfurt für Familien" — klare Positionierung, die Google und dem Besucher sofort zeigt, wem du hilfst und wo.', side: 'right' },
    { x: 22, y: 48, label: 'Conversion-orientierter Text', description: 'Der Text spricht direkt den Schmerz des idealen Kunden an, nicht die Merkmale der Dienstleistung. Das schafft emotionale Verbindung und Vertrauen.', side: 'right' },
    { x: 30, y: 67, label: 'CTAs nach Suchintention segmentiert', description: 'Zwei Buttons trennen Suchintentionen: "mieten" vs "kaufen". Jeder führt zu einer für dieses Keyword optimierten Seite.', side: 'right' },
    { x: 78, y: 62, label: 'Social Proof sichtbar', description: 'Echte Fotos, Sterne und das Label "Glückliche Familien" schaffen sofort Vertrauen — der Besucher sieht, dass andere wie er bereits vertraut haben.', side: 'left' },
    { x: 18, y: 88, label: 'Autoritätskennzahlen', description: '+340 Familien, 4.9/5 Bewertung, 14 Jahre Erfahrung. Konkrete Zahlen, die Einwände beseitigen und die Entscheidung beschleunigen.', side: 'right' },
  ],
  en: [
    { x: 88, y: 4, label: 'CTA visible from first scroll', description: 'A clear, visible action button in the navbar ensures the visitor always has a direct path to conversion.', side: 'left' },
    { x: 32, y: 22, label: 'H1 with niche + location', description: '"Immobilien Frankfurt für Familien" — clear positioning that tells Google and the visitor exactly who you help and where.', side: 'right' },
    { x: 22, y: 48, label: 'Conversion-oriented copy', description: 'The text speaks directly to the ideal client\'s pain, not service features. It creates emotional connection and trust.', side: 'right' },
    { x: 30, y: 67, label: 'CTAs segmented by intent', description: 'Two buttons separating search intents: "rent" vs "buy". Each leads to a page optimized for that keyword.', side: 'right' },
    { x: 78, y: 62, label: 'Visible social proof', description: 'Real photos, stars and the "Happy Families" label build instant trust — the visitor sees others like them already trusted you.', side: 'left' },
    { x: 18, y: 88, label: 'Authority metrics', description: '+340 families, 4.9/5 rating, 14 years of experience. Concrete numbers that eliminate objections and accelerate the decision.', side: 'right' },
  ],
}

const COPY: Record<Locale, { tag: string; title: string; subtitle: string; hint: string; alt: string }> = {
  es: {
    tag: 'Caso de referencia',
    title: 'Así se ve una web inmobiliaria que convierte',
    subtitle: 'Explora los elementos clave que transforman una web genérica en un sistema de captación de clientes.',
    hint: 'Pasa el cursor sobre los puntos para descubrir cada optimización.',
    alt: 'Ejemplo de página web inmobiliaria optimizada para conversión y SEO local — MM Immobilien Frankfurt',
  },
  de: {
    tag: 'Referenzbeispiel',
    title: 'So sieht eine Immobilien-Website aus, die konvertiert',
    subtitle: 'Entdecke die Schlüsselelemente, die eine generische Website in ein Kundengewinnungssystem verwandeln.',
    hint: 'Fahre mit dem Cursor über die Punkte, um jede Optimierung zu entdecken.',
    alt: 'Beispiel einer für Conversion und lokales SEO optimierten Immobilien-Website — MM Immobilien Frankfurt',
  },
  en: {
    tag: 'Reference case',
    title: 'This is what a real estate website that converts looks like',
    subtitle: 'Explore the key elements that transform a generic website into a client acquisition system.',
    hint: 'Hover over the dots to discover each optimization.',
    alt: 'Example of a real estate website optimized for conversion and local SEO — MM Immobilien Frankfurt',
  },
}

interface WebsiteShowcaseProps {
  locale?: Locale
}

export function WebsiteShowcase({ locale = 'es' }: WebsiteShowcaseProps) {
  const images: Record<Locale, typeof imgDE> = {
    de: imgDE,
    es: imgES,
    en: imgEN,
  }

  const image = images[locale]
  const annotations = ANNOTATIONS[locale]
  const copy = COPY[locale]

  return (
    <section className="py-12 md:py-20 px-6" style={{ background: 'var(--brand-bg)' }}>
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p
            className="text-center text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--brand-cyan)' }}
          >
            {copy.tag}
          </p>
          <h2
            className="font-display text-2xl md:text-3xl font-bold text-center mb-4"
            style={{ color: 'var(--brand-fg)' }}
          >
            {copy.title}
          </h2>
          <p
            className="text-center text-base max-w-2xl mx-auto mb-12"
            style={{ color: 'var(--brand-fg-muted)' }}
          >
            {copy.subtitle}
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
            <Image
              src={image}
              alt={copy.alt}
              className="w-full h-auto"
              sizes="(max-width: 1024px) 100vw, 960px"
              priority={false}
              placeholder="blur"
            />

            <div className="absolute inset-0">
              {annotations.map((dot, i) => (
                <PulseDot
                  key={i}
                  x={dot.x}
                  y={dot.y}
                  label={dot.label}
                  description={dot.description}
                  side={dot.side}
                />
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p
            className="text-center text-sm mt-6 italic"
            style={{ color: 'var(--brand-fg-muted)' }}
          >
            {copy.hint}
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
