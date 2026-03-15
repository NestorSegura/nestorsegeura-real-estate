/**
 * Sanity Content Seed Script
 * ===========================
 * Seeds all homepage content (DE, EN, ES) and siteSettings into Sanity CMS.
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

const CTA_URL = 'https://cal.com/nestorsegura/erstgespraech'

// ---- siteSettings ------------------------------------------------------

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  siteName: 'nestorsegura.com',
  tagline: 'Web Design für Immobilienmakler',
  defaultCtaHref: CTA_URL,
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

// ---- German homepage (page-home-de) ------------------------------------

const homePageDe = {
  _id: 'page-home-de',
  _type: 'page',
  slug: { current: 'home' },
  language: 'de',
  sections: [
    // 1. Hero
    {
      _key: 'de-hero',
      _type: 'heroSection',
      headline: 'Ihre Website arbeitet nicht für Sie? Das ändern wir.',
      subheadline:
        'Wir bauen Websites, die Immobilienmakler von der Konkurrenz abheben — mit professionellem Design, klarer Sprache und einem Termin-Button, den Ihre Kunden wirklich klicken.',
      ctaLabel: 'Erstgespräch vereinbaren',
      ctaHref: CTA_URL,
      variant: 'svgPath',
      colorScheme: 'dark',
      enabled: true,
      spacing: 'spacious',
    },
    // 2. Feature Strip
    {
      _key: 'de-features',
      _type: 'featureStrip',
      title: 'Warum Makler uns vertrauen',
      features: [
        {
          _key: 'de-feat-1',
          icon: 'building',
          title: 'Branchenkenntnis',
          description:
            'Wir kennen die Sprache der Immobilienbranche. Kein allgemeines Web-Design, sondern maßgeschneiderte Lösungen für Makler.',
        },
        {
          _key: 'de-feat-2',
          icon: 'target',
          title: 'Conversion-Optimierung',
          description:
            'Jedes Element Ihrer Website hat ein Ziel: Besucher in Anfragen verwandeln. Design folgt Funktion, nicht umgekehrt.',
        },
        {
          _key: 'de-feat-3',
          icon: 'handshake',
          title: 'Persönliche Betreuung',
          description:
            'Kein Ticket-System, kein Call-Center. Sie sprechen direkt mit uns — von der ersten Idee bis zum Launch und darüber hinaus.',
        },
      ],
      colorScheme: 'light',
      enabled: true,
      spacing: 'normal',
    },
    // 3. Problem / Solution
    {
      _key: 'de-problem',
      _type: 'problemSolutionBlock',
      title: 'Kennen Sie das?',
      problems: [
        {
          _key: 'de-prob-1',
          number: 1,
          headline: 'Ihre Website existiert, aber bringt keine Anfragen',
          description:
            'Sie haben eine Website, aber das Telefon klingelt deshalb nicht öfter. Besucher kommen, schauen sich um — und verschwinden wieder.',
        },
        {
          _key: 'de-prob-2',
          number: 2,
          headline: 'Der Online-Auftritt wirkt nicht so professionell wie Sie selbst',
          description:
            'Sie präsentieren Immobilien im Wert von Millionen — aber Ihre Website sieht aus wie ein Hobby-Projekt aus den 2010er Jahren.',
        },
        {
          _key: 'de-prob-3',
          number: 3,
          headline: 'Keine Zeit für Marketing, Design und Technik',
          description:
            'Ihr Kerngeschäft ist die Immobilie, nicht die Website. Aber ohne digitale Präsenz verlieren Sie potenzielle Kunden täglich.',
        },
      ],
      colorScheme: 'light',
      enabled: true,
      spacing: 'normal',
    },
    // 4. Services
    {
      _key: 'de-services',
      _type: 'servicesBlock',
      title: 'Unsere Leistungen',
      services: [
        {
          _key: 'de-svc-1',
          number: 1,
          name: 'Website-Erstellung',
          description:
            'Eine neue Website, die Ihr Büro repräsentiert, Vertrauen schafft und Anfragen generiert. Fertig in 4–6 Wochen.',
          features: [
            'Individuelles Design mit Ihrer Markenidentität',
            'Mobile-first und technisch optimiert',
            'Integriertes Terminbuchungs-System',
            'Sanity CMS — einfach selbst bearbeiten',
          ],
          ctaLabel: 'Erstgespräch vereinbaren',
          ctaHref: CTA_URL,
        },
        {
          _key: 'de-svc-2',
          number: 2,
          name: 'Website-Analyse',
          description:
            'Wir analysieren Ihre bestehende Website und zeigen Ihnen genau, wo Sie Anfragen verlieren — mit konkreten Verbesserungsvorschlägen.',
          features: [
            'Technische Performance-Analyse',
            'Conversion-Rate-Bewertung',
            'Wettbewerbervergleich',
            'Priorisierte Handlungsempfehlungen',
          ],
          ctaLabel: 'Erstgespräch vereinbaren',
          ctaHref: CTA_URL,
        },
        {
          _key: 'de-svc-3',
          number: 3,
          name: 'Laufende Betreuung',
          description:
            'Ihr Website-Partner für den Alltag: Änderungen, Updates, neue Inhalte und technischer Support — flexibel und ohne Vertragsbindung.',
          features: [
            'Monatliche Inhaltsänderungen inklusive',
            'Technische Wartung und Updates',
            'Neue Seiten und Funktionen bei Bedarf',
            'Direkter Ansprechpartner per WhatsApp',
          ],
          ctaLabel: 'Erstgespräch vereinbaren',
          ctaHref: CTA_URL,
        },
      ],
      colorScheme: 'dark',
      enabled: true,
      spacing: 'spacious',
    },
    // 5. Testimonials
    {
      _key: 'de-testimonials',
      _type: 'testimonialsBlock',
      title: 'Das sagen unsere Kunden',
      testimonials: [
        {
          _key: 'de-test-1',
          quote:
            'Seit dem Relaunch bekomme ich regelmäßig Anfragen über die Website. Vorher war das praktisch null. Nestor hat genau verstanden, was Makler brauchen.',
          author: 'Klaus-Dieter Hoffmann',
          role: 'Immobilienmakler, Hamburg',
        },
        {
          _key: 'de-test-2',
          quote:
            'Die neue Website sieht nicht nur professionell aus — sie funktioniert auch. Meine Kunden sprechen mich oft auf das Design an. Das ist unbezahlbar.',
          author: 'Sabine Müller',
          role: 'Maklerin, München',
        },
        {
          _key: 'de-test-3',
          quote:
            'Endlich jemand, der die Immobilienbranche wirklich kennt. Keine generischen Texte, kein Copy-Paste-Design. Ein echter Partner.',
          author: 'Thomas Bergmann',
          role: 'Geschäftsführer, Bergmann Immobilien',
        },
      ],
      colorScheme: 'light',
      enabled: true,
      spacing: 'spacious',
    },
    // 6. References
    {
      _key: 'de-references',
      _type: 'referencesBlock',
      title: 'Unsere Projekte',
      references: [
        {
          _key: 'de-ref-1',
          name: 'Hoffmann Immobilien',
          description:
            'Kompletter Website-Neustart für ein etabliertes Maklerbüro in Hamburg. Conversion-Rate um 340 % gesteigert.',
          url: 'https://example.com',
        },
        {
          _key: 'de-ref-2',
          name: 'Müller & Partner',
          description:
            'Neue Markenidentität und Website für eine Maklergemeinschaft mit 5 Standorten in Bayern.',
          url: 'https://example.com',
        },
        {
          _key: 'de-ref-3',
          name: 'Bergmann Immobilien',
          description:
            'Website-Analyse und Redesign für einen Berliner Makler. 2× mehr Anfragen im ersten Monat nach Launch.',
          url: 'https://example.com',
        },
      ],
      colorScheme: 'light',
      enabled: true,
      spacing: 'spacious',
    },
    // 7. FAQ
    {
      _key: 'de-faq',
      _type: 'faqBlock',
      title: 'Häufig gestellte Fragen',
      faqs: [
        {
          _key: 'de-faq-1',
          question: 'Wie lange dauert die Erstellung einer neuen Website?',
          answer:
            'In der Regel 4–6 Wochen vom Erstgespräch bis zum Launch. Das hängt davon ab, wie schnell Inhalte und Feedback von Ihrer Seite kommen. Wir halten Sie während des gesamten Prozesses auf dem Laufenden.',
        },
        {
          _key: 'de-faq-2',
          question: 'Was kostet eine Website für Immobilienmakler?',
          answer:
            'Das hängt vom Umfang ab. Eine professionelle Makler-Website startet bei etwa 2.500 €. Im Erstgespräch besprechen wir Ihre Anforderungen und erstellen ein transparentes Angebot — ohne versteckte Kosten.',
        },
        {
          _key: 'de-faq-3',
          question: 'Kann ich die Website nach dem Launch selbst bearbeiten?',
          answer:
            'Ja, absolut. Wir bauen auf ein benutzerfreundliches CMS (Sanity), das auch ohne Programmierkenntnisse einfach zu bedienen ist. Im Launch-Paket ist eine persönliche Einführung enthalten.',
        },
        {
          _key: 'de-faq-4',
          question: 'Arbeiten Sie auch mit bestehenden Websites?',
          answer:
            'Ja. Wir bieten sowohl komplette Neuentwicklungen als auch Website-Analysen und gezielte Verbesserungen bestehender Seiten an. In unserem Erstgespräch klären wir, was für Sie am sinnvollsten ist.',
        },
        {
          _key: 'de-faq-5',
          question: 'Was unterscheidet Sie von allgemeinen Web-Agenturen?',
          answer:
            'Wir arbeiten ausschließlich mit Immobilienmaklern. Das bedeutet: Wir kennen Ihre Zielgruppe, Ihre Branche und die Texte, die bei Ihren Kunden ankommen. Kein allgemeines Design, kein Rätselraten — nur bewährte Lösungen für Makler.',
        },
        {
          _key: 'de-faq-6',
          question: 'Gibt es eine Vertragsbindung bei der laufenden Betreuung?',
          answer:
            'Nein. Unsere Betreuungspakete sind monatlich kündbar. Wir glauben daran, dass Sie bei uns bleiben, weil Sie zufrieden sind — nicht weil Sie müssen.',
        },
      ],
      colorScheme: 'light',
      enabled: true,
      spacing: 'spacious',
    },
    // 8. CTA
    {
      _key: 'de-cta',
      _type: 'ctaBlock',
      headline: 'Bereit für mehr Anfragen?',
      subtext:
        'Buchen Sie jetzt Ihr kostenloses Erstgespräch. Wir analysieren Ihre aktuelle Situation und zeigen Ihnen, wie eine professionelle Website Ihr Geschäft verändern kann — ohne Verkaufsdruck.',
      ctaLabel: 'Erstgespräch vereinbaren',
      ctaHref: CTA_URL,
      variant: 'primary',
      colorScheme: 'dark',
      enabled: true,
      spacing: 'spacious',
    },
  ],
}

// ---- English homepage (page-home-en) -----------------------------------

const homePageEn = {
  _id: 'page-home-en',
  _type: 'page',
  slug: { current: 'home' },
  language: 'en',
  sections: [
    // 1. Hero
    {
      _key: 'en-hero',
      _type: 'heroSection',
      headline: 'Your website is not working for you? Let\'s change that.',
      subheadline:
        'We build websites that help real estate agents stand out from the competition — with professional design, clear messaging, and a booking button your clients actually click.',
      ctaLabel: 'Book Free Consultation',
      ctaHref: CTA_URL,
      variant: 'svgPath',
      colorScheme: 'dark',
      enabled: true,
      spacing: 'spacious',
    },
    // 2. Feature Strip
    {
      _key: 'en-features',
      _type: 'featureStrip',
      title: 'Why agents trust us',
      features: [
        {
          _key: 'en-feat-1',
          icon: 'building',
          title: 'Industry Expertise',
          description:
            'We speak the language of real estate. No generic web design — tailored solutions built specifically for agents.',
        },
        {
          _key: 'en-feat-2',
          icon: 'target',
          title: 'Conversion-Focused',
          description:
            'Every element of your website has one goal: turning visitors into inquiries. Design follows function, not the other way around.',
        },
        {
          _key: 'en-feat-3',
          icon: 'handshake',
          title: 'Personal Support',
          description:
            'No ticket system, no call center. You talk directly with us — from the first idea to launch and beyond.',
        },
      ],
      colorScheme: 'light',
      enabled: true,
      spacing: 'normal',
    },
    // 3. Problem / Solution
    {
      _key: 'en-problem',
      _type: 'problemSolutionBlock',
      title: 'Does this sound familiar?',
      problems: [
        {
          _key: 'en-prob-1',
          number: 1,
          headline: 'Your website exists but brings no inquiries',
          description:
            'You have a website, but the phone doesn\'t ring more because of it. Visitors come, look around — and leave.',
        },
        {
          _key: 'en-prob-2',
          number: 2,
          headline: 'Your online presence doesn\'t match your professionalism',
          description:
            'You present properties worth millions — but your website looks like a hobby project from 2012.',
        },
        {
          _key: 'en-prob-3',
          number: 3,
          headline: 'No time for marketing, design, and tech',
          description:
            'Your core business is real estate, not websites. But without a strong digital presence, you\'re losing potential clients every day.',
        },
      ],
      colorScheme: 'light',
      enabled: true,
      spacing: 'normal',
    },
    // 4. Services
    {
      _key: 'en-services',
      _type: 'servicesBlock',
      title: 'Our Services',
      services: [
        {
          _key: 'en-svc-1',
          number: 1,
          name: 'Website Creation',
          description:
            'A new website that represents your agency, builds trust, and generates inquiries. Ready in 4–6 weeks.',
          features: [
            'Custom design with your brand identity',
            'Mobile-first and technically optimized',
            'Integrated appointment booking system',
            'Sanity CMS — easy to edit yourself',
          ],
          ctaLabel: 'Book Free Consultation',
          ctaHref: CTA_URL,
        },
        {
          _key: 'en-svc-2',
          number: 2,
          name: 'Website Analysis',
          description:
            'We analyze your existing website and show you exactly where you\'re losing inquiries — with concrete improvement suggestions.',
          features: [
            'Technical performance analysis',
            'Conversion rate evaluation',
            'Competitor comparison',
            'Prioritized action recommendations',
          ],
          ctaLabel: 'Book Free Consultation',
          ctaHref: CTA_URL,
        },
        {
          _key: 'en-svc-3',
          number: 3,
          name: 'Ongoing Support',
          description:
            'Your website partner for everyday needs: changes, updates, new content, and technical support — flexible and no long-term contract.',
          features: [
            'Monthly content changes included',
            'Technical maintenance and updates',
            'New pages and features on demand',
            'Direct contact via WhatsApp',
          ],
          ctaLabel: 'Book Free Consultation',
          ctaHref: CTA_URL,
        },
      ],
      colorScheme: 'dark',
      enabled: true,
      spacing: 'spacious',
    },
    // 5. Testimonials
    {
      _key: 'en-testimonials',
      _type: 'testimonialsBlock',
      title: 'What our clients say',
      testimonials: [
        {
          _key: 'en-test-1',
          quote:
            'Since the relaunch I get regular inquiries through the website. Before it was practically zero. Nestor understood exactly what agents need.',
          author: 'Klaus-Dieter Hoffmann',
          role: 'Real Estate Agent, Hamburg',
        },
        {
          _key: 'en-test-2',
          quote:
            'The new website not only looks professional — it actually works. My clients often mention the design. That\'s priceless.',
          author: 'Sabine Müller',
          role: 'Agent, Munich',
        },
        {
          _key: 'en-test-3',
          quote:
            'Finally someone who truly knows the real estate industry. No generic copy, no cookie-cutter design. A real partner.',
          author: 'Thomas Bergmann',
          role: 'CEO, Bergmann Immobilien',
        },
      ],
      colorScheme: 'light',
      enabled: true,
      spacing: 'spacious',
    },
    // 6. References
    {
      _key: 'en-references',
      _type: 'referencesBlock',
      title: 'Our Projects',
      references: [
        {
          _key: 'en-ref-1',
          name: 'Hoffmann Immobilien',
          description:
            'Complete website relaunch for an established agency in Hamburg. Conversion rate increased by 340%.',
          url: 'https://example.com',
        },
        {
          _key: 'en-ref-2',
          name: 'Müller & Partner',
          description:
            'New brand identity and website for a real estate partnership with 5 locations in Bavaria.',
          url: 'https://example.com',
        },
        {
          _key: 'en-ref-3',
          name: 'Bergmann Immobilien',
          description:
            'Website analysis and redesign for a Berlin-based agent. 2× more inquiries in the first month after launch.',
          url: 'https://example.com',
        },
      ],
      colorScheme: 'light',
      enabled: true,
      spacing: 'spacious',
    },
    // 7. FAQ
    {
      _key: 'en-faq',
      _type: 'faqBlock',
      title: 'Frequently Asked Questions',
      faqs: [
        {
          _key: 'en-faq-1',
          question: 'How long does it take to build a new website?',
          answer:
            'Typically 4–6 weeks from the initial consultation to launch. This depends on how quickly content and feedback arrive from your side. We keep you updated throughout the entire process.',
        },
        {
          _key: 'en-faq-2',
          question: 'How much does a real estate agent website cost?',
          answer:
            'It depends on the scope. A professional agent website starts at around €2,500. In the initial consultation we discuss your requirements and provide a transparent quote — no hidden costs.',
        },
        {
          _key: 'en-faq-3',
          question: 'Can I edit the website myself after launch?',
          answer:
            'Yes, absolutely. We build on a user-friendly CMS (Sanity) that\'s easy to use even without coding knowledge. The launch package includes a personal walkthrough.',
        },
        {
          _key: 'en-faq-4',
          question: 'Do you also work with existing websites?',
          answer:
            'Yes. We offer both complete new builds and website analyses with targeted improvements for existing sites. In our initial consultation we\'ll determine what makes the most sense for you.',
        },
        {
          _key: 'en-faq-5',
          question: 'What sets you apart from general web agencies?',
          answer:
            'We work exclusively with real estate agents. That means we know your target audience, your industry, and the messages that resonate with your clients. No generic design, no guesswork — just proven solutions for agents.',
        },
      ],
      colorScheme: 'light',
      enabled: true,
      spacing: 'spacious',
    },
    // 8. CTA
    {
      _key: 'en-cta',
      _type: 'ctaBlock',
      headline: 'Ready for more inquiries?',
      subtext:
        'Book your free consultation now. We\'ll analyze your current situation and show you how a professional website can transform your business — no sales pressure.',
      ctaLabel: 'Book Free Consultation',
      ctaHref: CTA_URL,
      variant: 'primary',
      colorScheme: 'dark',
      enabled: true,
      spacing: 'spacious',
    },
  ],
}

// ---- Spanish homepage (page-home-es) -----------------------------------

const homePageEs = {
  _id: 'page-home-es',
  _type: 'page',
  slug: { current: 'home' },
  language: 'es',
  sections: [
    // 1. Hero
    {
      _key: 'es-hero',
      _type: 'heroSection',
      headline: '¿Su web no genera clientes? Lo cambiamos ahora.',
      subheadline:
        'Creamos webs que ayudan a los agentes inmobiliarios a destacar — con diseño profesional, mensajes claros y un botón de cita que sus clientes realmente pulsan.',
      ctaLabel: 'Agendar consulta gratuita',
      ctaHref: CTA_URL,
      variant: 'svgPath',
      colorScheme: 'dark',
      enabled: true,
      spacing: 'spacious',
    },
    // 2. Feature Strip
    {
      _key: 'es-features',
      _type: 'featureStrip',
      title: 'Por qué los agentes confían en nosotros',
      features: [
        {
          _key: 'es-feat-1',
          icon: 'building',
          title: 'Expertise del sector',
          description:
            'Hablamos el idioma del sector inmobiliario. Nada de diseño genérico — soluciones hechas a medida para agentes.',
        },
        {
          _key: 'es-feat-2',
          icon: 'target',
          title: 'Orientado a la conversión',
          description:
            'Cada elemento de su web tiene un objetivo: convertir visitas en consultas. El diseño sigue la función, no al revés.',
        },
        {
          _key: 'es-feat-3',
          icon: 'handshake',
          title: 'Atención personalizada',
          description:
            'Sin sistema de tickets ni call center. Habla directamente con nosotros — desde la primera idea hasta el lanzamiento y más allá.',
        },
      ],
      colorScheme: 'light',
      enabled: true,
      spacing: 'normal',
    },
    // 3. Problem / Solution
    {
      _key: 'es-problem',
      _type: 'problemSolutionBlock',
      title: '¿Le suena familiar?',
      problems: [
        {
          _key: 'es-prob-1',
          number: 1,
          headline: 'Su web existe pero no genera consultas',
          description:
            'Tiene una web, pero el teléfono no suena más por eso. Los visitantes llegan, miran — y se van.',
        },
        {
          _key: 'es-prob-2',
          number: 2,
          headline: 'Su presencia online no refleja su profesionalidad',
          description:
            'Presenta propiedades que valen millones — pero su web parece un proyecto amateur de hace una década.',
        },
        {
          _key: 'es-prob-3',
          number: 3,
          headline: 'Sin tiempo para marketing, diseño y tecnología',
          description:
            'Su negocio principal es el inmueble, no la web. Pero sin presencia digital sólida, pierde clientes potenciales cada día.',
        },
      ],
      colorScheme: 'light',
      enabled: true,
      spacing: 'normal',
    },
    // 4. Services
    {
      _key: 'es-services',
      _type: 'servicesBlock',
      title: 'Nuestros Servicios',
      services: [
        {
          _key: 'es-svc-1',
          number: 1,
          name: 'Creación de web',
          description:
            'Una web nueva que represente su agencia, genere confianza y atraiga consultas. Lista en 4–6 semanas.',
          features: [
            'Diseño personalizado con su identidad de marca',
            'Mobile-first y optimizada técnicamente',
            'Sistema integrado de reserva de citas',
            'CMS Sanity — fácil de editar usted mismo',
          ],
          ctaLabel: 'Agendar consulta gratuita',
          ctaHref: CTA_URL,
        },
        {
          _key: 'es-svc-2',
          number: 2,
          name: 'Análisis web',
          description:
            'Analizamos su web actual y le mostramos exactamente dónde está perdiendo consultas — con sugerencias concretas de mejora.',
          features: [
            'Análisis de rendimiento técnico',
            'Evaluación de tasa de conversión',
            'Comparativa con la competencia',
            'Recomendaciones priorizadas',
          ],
          ctaLabel: 'Agendar consulta gratuita',
          ctaHref: CTA_URL,
        },
        {
          _key: 'es-svc-3',
          number: 3,
          name: 'Soporte continuo',
          description:
            'Su socio web para el día a día: cambios, actualizaciones, nuevos contenidos y soporte técnico — flexible y sin permanencia.',
          features: [
            'Cambios de contenido mensuales incluidos',
            'Mantenimiento técnico y actualizaciones',
            'Nuevas páginas y funciones bajo demanda',
            'Contacto directo por WhatsApp',
          ],
          ctaLabel: 'Agendar consulta gratuita',
          ctaHref: CTA_URL,
        },
      ],
      colorScheme: 'dark',
      enabled: true,
      spacing: 'spacious',
    },
    // 5. Testimonials
    {
      _key: 'es-testimonials',
      _type: 'testimonialsBlock',
      title: 'Lo que dicen nuestros clientes',
      testimonials: [
        {
          _key: 'es-test-1',
          quote:
            'Desde el relanzamiento recibo consultas regulares a través de la web. Antes era prácticamente cero. Nestor entendió exactamente lo que necesitan los agentes.',
          author: 'Klaus-Dieter Hoffmann',
          role: 'Agente inmobiliario, Hamburgo',
        },
        {
          _key: 'es-test-2',
          quote:
            'La nueva web no solo tiene un aspecto profesional — también funciona. Mis clientes suelen comentar el diseño. Eso no tiene precio.',
          author: 'Sabine Müller',
          role: 'Agente, Múnich',
        },
        {
          _key: 'es-test-3',
          quote:
            'Por fin alguien que conoce de verdad el sector inmobiliario. Nada de textos genéricos ni diseños de plantilla. Un socio de verdad.',
          author: 'Thomas Bergmann',
          role: 'CEO, Bergmann Immobilien',
        },
      ],
      colorScheme: 'light',
      enabled: true,
      spacing: 'spacious',
    },
    // 6. References
    {
      _key: 'es-references',
      _type: 'referencesBlock',
      title: 'Nuestros Proyectos',
      references: [
        {
          _key: 'es-ref-1',
          name: 'Hoffmann Immobilien',
          description:
            'Relanzamiento completo del sitio web para una agencia consolidada en Hamburgo. Tasa de conversión aumentada un 340%.',
          url: 'https://example.com',
        },
        {
          _key: 'es-ref-2',
          name: 'Müller & Partner',
          description:
            'Nueva identidad de marca y web para una asociación inmobiliaria con 5 sedes en Baviera.',
          url: 'https://example.com',
        },
        {
          _key: 'es-ref-3',
          name: 'Bergmann Immobilien',
          description:
            'Análisis y rediseño web para un agente en Berlín. 2× más consultas en el primer mes tras el lanzamiento.',
          url: 'https://example.com',
        },
      ],
      colorScheme: 'light',
      enabled: true,
      spacing: 'spacious',
    },
    // 7. FAQ
    {
      _key: 'es-faq',
      _type: 'faqBlock',
      title: 'Preguntas frecuentes',
      faqs: [
        {
          _key: 'es-faq-1',
          question: '¿Cuánto tarda en crearse una nueva web?',
          answer:
            'Normalmente entre 4 y 6 semanas desde la consulta inicial hasta el lanzamiento. Depende de la velocidad con la que lleguen los contenidos y el feedback de su parte. Le mantenemos informado durante todo el proceso.',
        },
        {
          _key: 'es-faq-2',
          question: '¿Cuánto cuesta una web para agentes inmobiliarios?',
          answer:
            'Depende del alcance. Una web profesional para agentes comienza en unos 2.500 €. En la consulta inicial hablamos de sus necesidades y le entregamos un presupuesto transparente — sin costes ocultos.',
        },
        {
          _key: 'es-faq-3',
          question: '¿Puedo editar la web yo mismo después del lanzamiento?',
          answer:
            'Sí, absolutamente. Construimos sobre un CMS fácil de usar (Sanity) que se maneja sin conocimientos de programación. El paquete de lanzamiento incluye una sesión de formación personalizada.',
        },
        {
          _key: 'es-faq-4',
          question: '¿También trabajan con webs existentes?',
          answer:
            'Sí. Ofrecemos tanto desarrollo completamente nuevo como análisis y mejoras dirigidas para sitios existentes. En la consulta inicial determinaremos qué tiene más sentido para usted.',
        },
        {
          _key: 'es-faq-5',
          question: '¿Qué les diferencia de una agencia web generalista?',
          answer:
            'Trabajamos exclusivamente con agentes inmobiliarios. Eso significa que conocemos su público objetivo, su sector y los mensajes que conectan con sus clientes. Sin diseño genérico, sin conjeturas — solo soluciones probadas para agentes.',
        },
      ],
      colorScheme: 'light',
      enabled: true,
      spacing: 'spacious',
    },
    // 8. CTA
    {
      _key: 'es-cta',
      _type: 'ctaBlock',
      headline: '¿Listo para recibir más consultas?',
      subtext:
        'Reserve ahora su consulta gratuita. Analizaremos su situación actual y le mostraremos cómo una web profesional puede transformar su negocio — sin presión de venta.',
      ctaLabel: 'Agendar consulta gratuita',
      ctaHref: CTA_URL,
      variant: 'primary',
      colorScheme: 'dark',
      enabled: true,
      spacing: 'spacious',
    },
  ],
}

// ---- Main execution ----------------------------------------------------

async function seed() {
  console.log('Starting Sanity content seed...\n')

  const documents = [
    { doc: siteSettings, label: 'siteSettings' },
    { doc: homePageDe, label: 'page-home-de (German)' },
    { doc: homePageEn, label: 'page-home-en (English)' },
    { doc: homePageEs, label: 'page-home-es (Spanish)' },
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
