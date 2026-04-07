/**
 * Sanity Content Seed Script
 * ===========================
 * Seeds all homepage content (DE, EN) and siteSettings into Sanity CMS.
 * ES homepage is managed separately by scripts/seed-landing-es.ts.
 *
 * Usage:
 *   npx tsx scripts/seed-content.ts
 *
 * Prerequisites:
 *   1. Copy .env.local.template to .env.local and fill in:
 *      - NEXT_PUBLIC_SANITY_PROJECT_ID
 *      - NEXT_PUBLIC_SANITY_DATASET
 *      - SANITY_API_TOKEN (write token — create at sanity.io/manage > API > Tokens)
 *
 *   2. Install tsx if needed: npm install -D tsx
 *
 * Notes:
 *   - Uses createOrReplace: safe to run multiple times (idempotent)
 *   - All documents use fixed _id values for predictable upserts
 */

import { createClient } from '@sanity/client'

// ---- Environment -------------------------------------------------------

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId) {
  console.error('ERROR: NEXT_PUBLIC_SANITY_PROJECT_ID is not set in environment.')
  process.exit(1)
}
if (!token) {
  console.error('ERROR: SANITY_API_TOKEN is not set. Create a write token at sanity.io/manage.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// ---- Helpers -----------------------------------------------------------

const CTA_HREF = 'https://tidycal.com/1vn62y3/website-als-verkaufskanal-optimieren'

// ---- siteSettings ------------------------------------------------------

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  siteName: 'nestorsegura.com',
  tagline: 'Web Design für Immobilienmakler',
  defaultCtaHref: CTA_HREF,
  navigation: [
    { _key: 'nav-1', label: 'Leistungen', href: '#leistungen' },
    { _key: 'nav-2', label: 'Projekte', href: '#projekte' },
    { _key: 'nav-3', label: 'Referenzen', href: '#referenzen' },
    { _key: 'nav-4', label: 'Analyse', href: '/analyse' },
    { _key: 'nav-5', label: 'FAQ', href: '#faq' },
    { _key: 'nav-6', label: 'Kontakt', href: '#kontakt' },
  ],
  footer: {
    socialLinks: [
      { _key: 'social-1', platform: 'LinkedIn', url: 'https://linkedin.com/in/nestorsegura' },
      { _key: 'social-2', platform: 'Instagram', url: 'https://instagram.com/nestorsegura' },
    ],
  },
}

// ---- German homepage (page-home-de-landing) ----------------------------

const homePageDe = {
  _id: 'page-home-de-landing',
  _type: 'page',
  language: 'de',
  title: 'Digitale Strategie für Immobilienmakler',
  slug: { _type: 'slug', current: 'home' },
  seo: {
    title: 'Digitale Strategie für Immobilienmakler | Nestor Segura',
    description: 'Bist du Immobilienmakler und deine Website generiert keine Leads? Ich entwickle digitale Strategien mit lokalem SEO, klarer Positionierung und Lead-Automatisierung, damit Google dir Kunden bringt — ohne bezahlte Werbung. Buche dein kostenloses Gespräch.',
  },
  sections: [
    {
      _key: 'landing-hero',
      _type: 'landingHero',
      enabled: true,
      headline: 'Digitale Strategie für Immobilienmakler, die Kunden gewinnen wollen — ohne von Portalen abhängig zu sein',
      subtitle: 'Ich verwandle deine Online-Präsenz in ein System, das Käufer und Eigentümer direkt über Google anzieht — mit klarer Positionierung, lokalem SEO und Lead-Automatisierung.',
      ctaLabel: 'Kostenloses Gespräch buchen',
      ctaHref: CTA_HREF,
      ctaSecondaryLabel: 'So funktioniert es ↓',
      ctaSecondaryHref: '#so-funktioniert-es',
    },
    {
      _key: 'landing-problem',
      _type: 'landingProblem',
      enabled: true,
      headline: 'Warum Immobilienmakler bei Google Kunden verlieren, ohne es zu merken',
      intro: 'Die meisten Makler haben eine Online-Präsenz. Das Problem ist: Sie arbeitet nicht. Sie generiert keine Anrufe, qualifiziert keine Leads und rankt nicht. Und der Grund ist fast immer derselbe.',
      problems: [
        { _key: 'p1', number: '01', title: 'Keine klare Positionierung', description: '"Ich bin Immobilienmakler" sagt weder Google noch deinem Wunschkunden etwas. Ohne eine spezifische Botschaft bist du unsichtbar unter Hunderten von Wettbewerbern, die genau dasselbe anbieten.' },
        { _key: 'p2', number: '02', title: 'Angebot viel zu breit', description: 'Verkauf, Kauf, Miete, Luxus, Erstbezug... für alle. Wenn du versuchst, mit allen zu sprechen, sprichst du mit niemandem — und Google weiß nicht, an wen es dich weiterleiten soll.' },
        { _key: 'p3', number: '03', title: 'Keine Nische und kein lokaler Fokus', description: 'Eine Website, die keine spezifischen lokalen Keywords nach Stadt, Stadtteil oder Kundentyp angreift, erscheint nicht, wenn dein Wunschkunde genau das sucht, was du anbietest.' },
        { _key: 'p4', number: '04', title: 'Kein System zur Lead-Gewinnung', description: 'Besucher kommen, aber es gibt nichts, das sie erfasst, qualifiziert oder in ein Gespräch führt. Der Traffic geht verloren — ohne Spur und ohne Leads.' },
      ],
      closing: 'All das zeigt sich in einer einzigen Kennzahl: Deine Website existiert, aber sie generiert keine Kunden.',
    },
    {
      _key: 'landing-guide',
      _type: 'landingGuide',
      enabled: true,
      headline: 'Digitale Strategie mit Fokus auf Ergebnisse — nicht auf hübsche Websites',
      paragraphs: [
        'Ich habe Dutzende von Makler-Websites analysiert. Das Fehlermuster ist fast immer dasselbe — und es gibt eine klare Lösung.',
        'Ich bin kein Immobilienmakler. Ich bin Digitalstratege, spezialisiert auf Systeme, die Besucher in Kunden verwandeln. Und was ich aus der Arbeit mit lokalen Unternehmen gelernt habe: Das Problem liegt selten am Service — sondern daran, wie er kommuniziert und online positioniert wird.',
      ],
      testimonials: [
        { _key: 't1', author: 'Andres Ugueto', role: 'Founder & CEO', quote: 'Nestor hat genau verstanden, was wir brauchten. Unsere Website wurde von einer Visitenkarte zu einer Anfragen-Maschine.' },
        { _key: 't2', author: 'Alvaro Gargano', role: 'Co-Founder', quote: 'Der strategische Ansatz hat den entscheidenden Unterschied gemacht. Es geht nicht um eine hübsche Website, sondern darum, dass sie funktioniert.' },
        { _key: 't3', author: 'Anna Wolf', role: 'Marketing Director', quote: 'Professionell, methodisch und ergebnisorientiert. Ich empfehle die Zusammenarbeit mit Nestor ohne Zögern.' },
      ],
    },
    {
      _key: 'landing-plan',
      _type: 'landingPlan',
      enabled: true,
      headline: 'Vom unsichtbaren Makler zum digitalen Referenzpunkt in deiner Region — in 3 Schritten',
      steps: [
        {
          _key: 's1',
          number: '1',
          title: 'Diagnose und Strategie',
          description: 'Wir analysieren deine aktuelle Situation, definieren deinen Wunschkunden und entwickeln die Positionierung, die dich in deinem lokalen Markt differenziert. Du weißt genau, mit wem du sprichst und was du sagen sollst.',
        },
        {
          _key: 's2',
          number: '2',
          title: 'Umsetzung und Aufbau',
          description: 'Wir strukturieren deine Website um, schreiben die Texte neu, erstellen optimierte Seiten nach Stadtteil und Suchintention und integrieren am Markt verfügbare Tools zur Lead-Erfassung.',
        },
        {
          _key: 's3',
          number: '3',
          title: 'Monatliches organisches Tracking',
          description: '6 Monate lang messen, justieren und optimieren wir — SEO, Conversion und Metriken — damit die Ergebnisse Monat für Monat wachsen, ohne auf bezahlte Werbung angewiesen zu sein.',
        },
      ],
    },
    {
      _key: 'landing-offer',
      _type: 'landingOffer',
      enabled: true,
      headline: 'Alles, was du brauchst, damit deine Website für dich arbeitet',
      comparison: [
        { _key: 'c1', before: '"Ich bin Immobilienmakler"', after: '"Ich helfe Familien, ihr Zuhause in Hamburg zu finden"' },
        { _key: 'c2', before: 'Generische Website ohne organischen Traffic', after: 'Optimierte Seiten nach Stadt und Suchintention' },
        { _key: 'c3', before: 'Leads von ImmoScout24 zu Höchstpreisen', after: 'Direkte Leads über Google, ohne Zwischenhändler' },
        { _key: 'c4', before: 'Kontaktformular, das niemand ausfüllt', after: 'Automatisiertes System zur Lead-Erfassung und -Qualifizierung' },
        { _key: 'c5', before: 'Keine Kennzahlen, keine Richtung', after: 'Monatliches Reporting + strategische Anpassungen' },
      ],
      services: [
        { _key: 'sv1', title: 'Strategische Positionierung + ICP-Definition' },
        { _key: 'sv2', title: 'Website-Restrukturierung + Seitenarchitektur' },
        { _key: 'sv3', title: 'Conversion-orientierte Webtexte' },
        { _key: 'sv4', title: 'Lokales und intentionsbasiertes SEO nach Stadt/Stadtteil/Zielgruppe' },
        { _key: 'sv5', title: 'Integration von Lead-Erfassungs-Tools' },
        { _key: 'sv6', title: 'Monatliches organisches Tracking — mindestens 6 Monate' },
      ],
      ctaLabel: 'Kostenloses Gespräch buchen',
      ctaHref: CTA_HREF,
    },
    {
      _key: 'landing-testimonials',
      _type: 'landingTestimonials',
      enabled: true,
      headline: 'Was diejenigen sagen, die bereits mit dieser Methodik gearbeitet haben',
      subtitle: 'Ich arbeite mit Gründern, lokalen Unternehmen und Maklern, die organisch und systematisch wachsen wollen.',
      testimonials: [
        { _key: 'lt1', name: 'Andres Ugueto', role: 'Founder & CEO', quote: 'Nestor hat genau verstanden, was wir brauchten. Unsere Website wurde von einer Visitenkarte zu einer Anfragen-Maschine.' },
        { _key: 'lt2', name: 'Alvaro Gargano', role: 'Co-Founder', quote: 'Der strategische Ansatz hat den entscheidenden Unterschied gemacht. Es geht nicht um eine hübsche Website, sondern darum, dass sie funktioniert.' },
        { _key: 'lt3', name: 'Anna Wolf', role: 'Marketing Director', quote: 'Professionell, methodisch und ergebnisorientiert. Ich empfehle die Zusammenarbeit mit Nestor ohne Zögern.' },
      ],
    },
    {
      _key: 'landing-faq',
      _type: 'landingFaq',
      enabled: true,
      headline: 'Häufige Fragen zur digitalen Strategie für Immobilienmakler',
      faqs: [
        { _key: 'f1', question: 'Wann sehe ich erste Ergebnisse?', answer: 'Veränderungen an Website und Positionierung sind ab dem ersten Monat sichtbar. Lokales SEO konsolidiert Ergebnisse zwischen 3 und 6 Monaten — deshalb beträgt die Mindestlaufzeit 6 Monate.' },
        { _key: 'f2', question: 'Muss ich meine gesamte Website ändern?', answer: 'Nicht immer. In vielen Fällen reicht eine Restrukturierung und Überarbeitung der bestehenden Texte aus. Das klären wir gemeinsam im Erstgespräch.' },
        { _key: 'f3', question: 'Funktioniert das, wenn ich schon ein Profil bei ImmoScout24 oder Immowelt habe?', answer: 'Ja, und genau das ist das Ziel. Portale sind teuer und machen abhängig. Dieses System baut einen eigenen Kanal auf, der diese Abhängigkeit Monat für Monat reduziert.' },
        { _key: 'f4', question: 'Kann ich mehrere Services anbieten und trotzdem eine Nische haben?', answer: 'Absolut. Die Strategie besteht darin, ein Hauptangebot klar zu positionieren und sekundäre Seiten für jeden weiteren Service zu erstellen — jede mit eigenem SEO und Conversion-Ziel.' },
        { _key: 'f5', question: 'Arbeitest du auch mit Maklern außerhalb Deutschlands?', answer: 'Ja. Ich arbeite remote mit Maklern in Deutschland, Österreich, der Schweiz, Spanien und Lateinamerika. Der Prozess ist 100 % online.' },
        { _key: 'f6', question: 'Was passiert nach den 6 Monaten?', answer: 'Wir entscheiden gemeinsam, ob das monatliche Tracking weiterläuft oder ob du das System eigenständig verwaltest. Keine Vertragsbindung.' },
      ],
    },
    {
      _key: 'landing-cta-final',
      _type: 'landingCtaFinal',
      enabled: true,
      headline: 'Bereit, dass deine Website anfängt, Kunden zu generieren?',
      copy: 'In 30 Minuten analysieren wir deine aktuelle digitale Präsenz und ich sage dir genau, wo deine größte Chance für organisches Wachstum liegt — kostenlos und unverbindlich.',
      ctaLabel: 'KOSTENLOSES GESPRÄCH BUCHEN',
      ctaHref: CTA_HREF,
      scarcityText: 'Ich nehme nur eine begrenzte Anzahl an Projekten pro Quartal an.',
    },
  ],
}

// ---- English homepage (page-home-en-landing) ---------------------------

const homePageEn = {
  _id: 'page-home-en-landing',
  _type: 'page',
  language: 'en',
  title: 'Digital Strategy for Real Estate Agents',
  slug: { _type: 'slug', current: 'home' },
  seo: {
    title: 'Digital Strategy for Real Estate Agents | Nestor Segura',
    description: 'Are you a real estate agent whose website generates no leads? I build digital strategies with local SEO, clear positioning, and lead automation so Google brings you clients — without paid ads. Book your free call.',
  },
  sections: [
    {
      _key: 'landing-hero',
      _type: 'landingHero',
      enabled: true,
      headline: 'Digital Strategy for Real Estate Agents Who Want Clients Without Depending on Portals',
      subtitle: 'I transform your online presence into a system that attracts buyers and homeowners directly from Google — with clear positioning, local SEO, and lead automation.',
      ctaLabel: 'Book your free call',
      ctaHref: CTA_HREF,
      ctaSecondaryLabel: 'See how it works ↓',
      ctaSecondaryHref: '#how-it-works',
    },
    {
      _key: 'landing-problem',
      _type: 'landingProblem',
      enabled: true,
      headline: 'Why real estate agents lose clients on Google without knowing it',
      intro: 'Most agents have an online presence. The problem is that it doesn\'t work. It doesn\'t generate calls, doesn\'t qualify leads, doesn\'t rank. And the reason is almost always the same.',
      problems: [
        { _key: 'p1', number: '01', title: 'No clear positioning', description: '"I\'m a real estate agent" means nothing to Google or your ideal client. Without a specific message, you\'re invisible among hundreds of competitors offering exactly the same thing.' },
        { _key: 'p2', number: '02', title: 'Offering too broad', description: 'Sales, purchases, rentals, luxury, first homes... for everyone. When you try to speak to everyone, you speak to no one — and Google doesn\'t know who to send your way.' },
        { _key: 'p3', number: '03', title: 'No niche or defined locality', description: 'A website that doesn\'t target specific local keywords by city, neighbourhood, or client type won\'t appear when your ideal client is searching for exactly what you offer.' },
        { _key: 'p4', number: '04', title: 'No lead capture system', description: 'Visitors arrive, but there\'s nothing to capture, qualify, or guide them into a conversation. The traffic is lost without a trace — and without leads.' },
      ],
      closing: 'All of this shows up in a single metric: your website exists, but it doesn\'t generate clients.',
    },
    {
      _key: 'landing-guide',
      _type: 'landingGuide',
      enabled: true,
      headline: 'Digital strategy focused on results, not pretty websites',
      paragraphs: [
        'I\'ve analysed dozens of real estate agent websites. The pattern of mistakes is almost always the same — and there\'s a clear solution.',
        'I\'m not a real estate agent. I\'m a digital strategist specialised in building systems that turn visitors into clients. And what I\'ve learned working with local businesses is that the problem is rarely the service — it\'s how it\'s communicated and positioned online.',
      ],
      testimonials: [
        { _key: 't1', author: 'Andres Ugueto', role: 'Founder & CEO', quote: 'Nestor understood exactly what we needed. Our website went from being a business card to a lead-generating machine.' },
        { _key: 't2', author: 'Alvaro Gargano', role: 'Co-Founder', quote: 'The strategic approach made all the difference. It\'s not about having a pretty website — it\'s about making it work.' },
        { _key: 't3', author: 'Anna Wolf', role: 'Marketing Director', quote: 'Professional, methodical, and results-oriented. I recommend working with Nestor without hesitation.' },
      ],
    },
    {
      _key: 'landing-plan',
      _type: 'landingPlan',
      enabled: true,
      headline: 'From invisible agent to digital reference in your area — in 3 steps',
      steps: [
        {
          _key: 's1',
          number: '1',
          title: 'Diagnosis and strategy',
          description: 'We analyse your current situation, define your ideal client, and design the positioning that sets you apart in your local market. You know exactly who you\'re talking to and what to say.',
        },
        {
          _key: 's2',
          number: '2',
          title: 'Execution and build',
          description: 'We restructure your website, rewrite the copy, create pages optimised by area and search intent, and integrate lead capture tools available on the market.',
        },
        {
          _key: 's3',
          number: '3',
          title: 'Monthly organic tracking',
          description: 'For 6 months we measure, adjust, and optimise — SEO, conversion, and metrics — so results grow month after month without relying on paid advertising.',
        },
      ],
    },
    {
      _key: 'landing-offer',
      _type: 'landingOffer',
      enabled: true,
      headline: 'Everything you need to make your website work for you',
      comparison: [
        { _key: 'c1', before: '"I\'m a real estate agent"', after: '"I help families find their home in London"' },
        { _key: 'c2', before: 'Generic website with no organic traffic', after: 'Pages optimised by city and search intent' },
        { _key: 'c3', before: 'Leads from Rightmove at premium prices', after: 'Direct leads from Google, no middlemen' },
        { _key: 'c4', before: 'Contact form nobody fills in', after: 'Automated lead capture and qualification system' },
        { _key: 'c5', before: 'No metrics, no direction', after: 'Monthly reporting + strategic adjustments' },
      ],
      services: [
        { _key: 'sv1', title: 'Strategic positioning + ICP definition' },
        { _key: 'sv2', title: 'Website restructuring + page architecture' },
        { _key: 'sv3', title: 'Conversion-oriented web copy' },
        { _key: 'sv4', title: 'Local and intent-based SEO by city/neighbourhood/audience' },
        { _key: 'sv5', title: 'Lead capture tool integration' },
        { _key: 'sv6', title: 'Monthly organic tracking — minimum 6 months' },
      ],
      ctaLabel: 'Book your free call',
      ctaHref: CTA_HREF,
    },
    {
      _key: 'landing-testimonials',
      _type: 'landingTestimonials',
      enabled: true,
      headline: 'What those who\'ve worked with this methodology say',
      subtitle: 'I work with founders, local businesses, and agents who want to grow organically and systematically.',
      testimonials: [
        { _key: 'lt1', name: 'Andres Ugueto', role: 'Founder & CEO', quote: 'Nestor understood exactly what we needed. Our website went from being a business card to a lead-generating machine.' },
        { _key: 'lt2', name: 'Alvaro Gargano', role: 'Co-Founder', quote: 'The strategic approach made all the difference. It\'s not about having a pretty website — it\'s about making it work.' },
        { _key: 'lt3', name: 'Anna Wolf', role: 'Marketing Director', quote: 'Professional, methodical, and results-oriented. I recommend working with Nestor without hesitation.' },
      ],
    },
    {
      _key: 'landing-faq',
      _type: 'landingFaq',
      enabled: true,
      headline: 'Frequently asked questions about digital strategy for real estate agents',
      faqs: [
        { _key: 'f1', question: 'How soon will I see results?', answer: 'Changes to website and positioning are visible from the first month. Local SEO consolidates results between 3 and 6 months — that\'s why the minimum engagement is 6 months.' },
        { _key: 'f2', question: 'Do I need to change my entire website?', answer: 'Not always. In many cases, restructuring and rewriting existing copy is enough. We\'ll evaluate it together on the initial call.' },
        { _key: 'f3', question: 'Does this work if I already have a profile on Zillow or Rightmove?', answer: 'Yes, and that\'s precisely the goal. Portals are expensive and create dependency. This system builds your own channel that reduces that dependency month after month.' },
        { _key: 'f4', question: 'Can I offer multiple services and still have a niche?', answer: 'Absolutely. The strategy is to position one main offer clearly, then create secondary pages for each additional service — each with its own SEO and conversion goal.' },
        { _key: 'f5', question: 'Do you work with agents outside of Germany?', answer: 'Yes. I work remotely with agents in Germany, the DACH region, Spain, and Latin America. The process is 100% online.' },
        { _key: 'f6', question: 'What happens after the 6 months?', answer: 'We decide together whether to continue monthly tracking or whether you manage the system independently. No binding contracts.' },
      ],
    },
    {
      _key: 'landing-cta-final',
      _type: 'landingCtaFinal',
      enabled: true,
      headline: 'Ready for your website to start generating clients?',
      copy: 'In 30 minutes we\'ll analyse your current digital presence and I\'ll tell you exactly where your biggest opportunity for organic growth lies — free, no strings attached.',
      ctaLabel: 'BOOK YOUR FREE CALL',
      ctaHref: CTA_HREF,
      scarcityText: 'I accept a limited number of projects per quarter.',
    },
  ],
}

// ---- Spanish homepage (page-home-es-landing) ---------------------------
// ES homepage is managed by scripts/seed-landing-es.ts
// To avoid conflicts, do not uncomment the ES entry below.

// ---- Main execution ----------------------------------------------------

async function seed() {
  console.log('Starting Sanity content seed...\n')

  const documents = [
    { doc: siteSettings, label: 'siteSettings' },
    { doc: homePageDe, label: 'page-home-de-landing (German)' },
    { doc: homePageEn, label: 'page-home-en-landing (English)' },
    // ES homepage is managed by scripts/seed-landing-es.ts (page-home-es-landing)
  ]

  for (const { doc, label } of documents) {
    process.stdout.write(`  Seeding ${label}... `)
    await client.createOrReplace(doc as Parameters<typeof client.createOrReplace>[0])
    console.log('done')
  }

  console.log('\nAll documents seeded successfully.')
  console.log(`Project: ${projectId} / Dataset: ${dataset}`)
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
