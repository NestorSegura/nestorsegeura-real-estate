import { sanityFetch } from '@/sanity/lib/live'
import { PAGE_BY_SLUG_QUERY } from '@/sanity/lib/queries'
import { JsonLd } from '@/components/seo/JsonLd'
import { Nav } from './Nav'
import Hero from './Hero'
import { WebsiteShowcase } from './WebsiteShowcase'
import Problem from './Problem'
import Guide from './Guide'
import Plan from './Plan'
import Offer from './Offer'
import Testimonials from './Testimonials'
import FAQ from './FAQ'
import CTAFinal from './CTAFinal'
import FooterES from './FooterES'

function find<T>(sections: unknown[], type: string): T | null {
  const s = sections.find((s: unknown) => (s as { _type: string })._type === type)
  return (s as T) ?? null
}

export async function LandingPageES() {
  const { data: page } = await sanityFetch({
    query: PAGE_BY_SLUG_QUERY,
    params: { slug: 'home', language: 'es' },
  })

  const sections = (page?.sections ?? []) as Record<string, unknown>[]

  const hero = find<{
    headline: string; subtitle: string; ctaLabel: string; ctaHref: string
    ctaSecondaryLabel: string; ctaSecondaryHref: string
  }>(sections, 'landingHero')

  const problem = find<{
    headline: string; intro: string; closing: string
    problems: { _key: string; number: string; title: string; description: string }[]
  }>(sections, 'landingProblem')

  const guide = find<{
    headline: string; paragraphs: string[]
    testimonials: { _key: string; author: string; role: string; quote: string }[]
  }>(sections, 'landingGuide')

  const plan = find<{
    headline: string
    steps: { _key: string; number: string; title: string; description: string }[]
  }>(sections, 'landingPlan')

  const offer = find<{
    headline: string; ctaLabel: string; ctaHref: string
    comparison: { _key: string; before: string; after: string }[]
    services: { _key: string; title: string }[]
  }>(sections, 'landingOffer')

  const testimonials = find<{
    headline: string; subtitle: string
    testimonials: { _key: string; name: string; role: string; quote: string }[]
  }>(sections, 'landingTestimonials')

  const faq = find<{
    headline: string
    faqs: { _key: string; question: string; answer: string }[]
  }>(sections, 'landingFaq')

  const ctaFinal = find<{
    headline: string; copy: string; ctaLabel: string; ctaHref: string; scarcityText: string
  }>(sections, 'landingCtaFinal')

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nestor Segura',
    jobTitle: 'Digital Strategist',
    url: 'https://nestorsegura.com',
    address: { '@type': 'PostalAddress', addressLocality: 'Hamburg', addressCountry: 'DE' },
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Nestor Segura — Estrategia Digital',
    url: 'https://nestorsegura.com/es',
    founder: { '@type': 'Person', name: 'Nestor Segura' },
    areaServed: [
      { '@type': 'Country', name: 'ES' },
      { '@type': 'Country', name: 'DE' },
    ],
    description: 'Estrategia digital con SEO local, posicionamiento y automatización de leads para agentes inmobiliarios.',
    serviceType: ['Digital Strategy', 'SEO Local', 'Lead Generation', 'Web Design'],
  }

  const faqSchema = faq ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  } : null

  return (
    <>
      <JsonLd data={personSchema} />
      <JsonLd data={serviceSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <Nav />

      <main>
        {hero && (
          <Hero
            headline={hero.headline}
            subtitle={hero.subtitle}
            ctaLabel={hero.ctaLabel}
            ctaHref={hero.ctaHref}
            ctaSecondaryLabel={hero.ctaSecondaryLabel}
            ctaSecondaryHref={hero.ctaSecondaryHref}
          />
        )}

        <WebsiteShowcase locale="es" />

        {problem && (
          <Problem
            headline={problem.headline}
            intro={problem.intro}
            problems={problem.problems}
            closing={problem.closing}
          />
        )}

        {guide && (
          <Guide
            headline={guide.headline}
            paragraphs={guide.paragraphs}
            testimonials={guide.testimonials}
          />
        )}

        {plan && (
          <Plan headline={plan.headline} steps={plan.steps} />
        )}

        {offer && (
          <Offer
            headline={offer.headline}
            comparison={offer.comparison}
            services={offer.services}
            ctaLabel={offer.ctaLabel}
            ctaHref={offer.ctaHref}
          />
        )}

        {testimonials && (
          <Testimonials
            headline={testimonials.headline}
            subtitle={testimonials.subtitle}
            testimonials={testimonials.testimonials}
          />
        )}

        {faq && (
          <FAQ headline={faq.headline} faqs={faq.faqs} />
        )}

        {ctaFinal && (
          <CTAFinal
            headline={ctaFinal.headline}
            copy={ctaFinal.copy}
            ctaLabel={ctaFinal.ctaLabel}
            ctaHref={ctaFinal.ctaHref}
            scarcityText={ctaFinal.scarcityText}
          />
        )}
      </main>

      <FooterES />
    </>
  )
}
