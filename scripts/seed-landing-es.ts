import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId) { console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID'); process.exit(1) }
if (!token) { console.error('Missing SANITY_API_TOKEN'); process.exit(1) }

const client = createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false })

const CTA_HREF = 'https://tidycal.com/1vn62y3/website-als-verkaufskanal-optimieren'

const PAGE_ID = 'page-home-es-landing'

const page = {
  _id: PAGE_ID,
  _type: 'page',
  language: 'es',
  title: 'Estrategia Digital para Agentes Inmobiliarios',
  slug: { _type: 'slug', current: 'home' },
  seo: {
    title: 'Estrategia Digital para Agentes Inmobiliarios | Nestor Segura',
    description: '¿Eres agente inmobiliario y tu web no genera leads? Diseño estrategias digitales con SEO local, posicionamiento claro y automatización de leads para que Google te traiga clientes sin pagar publicidad. Reserva tu llamada gratuita.',
  },
  sections: [
    {
      _key: 'landing-hero',
      _type: 'landingHero',
      enabled: true,
      headline: 'Estrategia Digital para Agentes Inmobiliarios que quieren clientes sin depender de portales',
      subtitle: 'Transformo tu presencia online en un sistema que atrae compradores y propietarios directamente desde Google — con posicionamiento claro, SEO local y automatización de leads.',
      ctaLabel: 'Reserva tu llamada gratuita',
      ctaHref: CTA_HREF,
      ctaSecondaryLabel: 'Ver cómo funciona ↓',
      ctaSecondaryHref: '#como-funciona',
    },
    {
      _key: 'landing-problem',
      _type: 'landingProblem',
      enabled: true,
      headline: 'Por qué los agentes inmobiliarios pierden clientes en Google sin saberlo',
      intro: 'La mayoría de agentes tienen presencia online. El problema es que esa presencia no trabaja. No genera llamadas, no cualifica leads, no posiciona. Y el motivo casi siempre es el mismo.',
      problems: [
        {
          _key: 'p1',
          number: '01',
          title: 'Sin posicionamiento claro',
          description: '"Soy agente inmobiliario" no le dice nada a Google ni a tu cliente ideal. Sin un mensaje específico, eres invisible entre cientos de competidores que ofrecen exactamente lo mismo.',
        },
        {
          _key: 'p2',
          number: '02',
          title: 'Oferta demasiado amplia',
          description: 'Venta, compra, alquiler, lujo, primera vivienda... para todos. Cuando intentas hablarle a todos, no le hablas a nadie — y Google no sabe a quién enviarte.',
        },
        {
          _key: 'p3',
          number: '03',
          title: 'Sin nicho ni localidad definida',
          description: 'Una web que no ataca keywords locales específicas por ciudad, barrio o tipo de cliente no aparece cuando tu cliente ideal está buscando exactamente lo que tú ofreces.',
        },
        {
          _key: 'p4',
          number: '04',
          title: 'Sin sistema de captación',
          description: 'Los visitantes llegan, pero no hay nada que los capture, cualifique ni lleve a una conversación. El tráfico se pierde sin dejar rastro — y sin dejar leads.',
        },
      ],
      closing: 'Todo esto se refleja en una sola métrica: tu web existe, pero no genera clientes.',
    },
    {
      _key: 'landing-guide',
      _type: 'landingGuide',
      enabled: true,
      headline: 'Estrategia digital enfocada en resultados, no en webs bonitas',
      paragraphs: [
        'He analizado decenas de páginas web de agentes inmobiliarios. El patrón de errores es casi siempre el mismo — y tiene solución clara.',
        'No soy agente inmobiliario. Soy estratega digital especializado en construir sistemas que convierten visitas en clientes. Y lo que he aprendido trabajando con negocios locales es que el problema rara vez está en el servicio — está en cómo se comunica y cómo se posiciona online.',
      ],
      testimonials: [
        { _key: 't1', author: 'Andres Ugueto', role: 'Founder & CEO', quote: 'Nestor entendió exactamente lo que necesitábamos. Nuestra web pasó de ser una tarjeta de visita a una máquina de generar consultas.' },
        { _key: 't2', author: 'Alvaro Gargano', role: 'Co-Founder', quote: 'El enfoque estratégico hizo toda la diferencia. No se trata de tener una web bonita, sino de que funcione.' },
        { _key: 't3', author: 'Anna Wolf', role: 'Marketing Director', quote: 'Profesional, metódico y orientado a resultados. Recomiendo trabajar con Nestor sin dudarlo.' },
      ],
    },
    {
      _key: 'landing-plan',
      _type: 'landingPlan',
      enabled: true,
      headline: 'De agente invisible a referente digital en tu zona — en 3 pasos',
      steps: [
        {
          _key: 's1',
          number: '1',
          title: 'Diagnóstico y estrategia',
          description: 'Analizamos tu situación actual, definimos tu cliente ideal y diseñamos el posicionamiento que te diferencia en tu mercado local. Sabes exactamente con quién hablas y qué decirle.',
        },
        {
          _key: 's2',
          number: '2',
          title: 'Ejecución y construcción',
          description: 'Reestructuramos tu web, reescribimos el copy, creamos páginas optimizadas por zona e intención de búsqueda, e integramos herramientas de captación de leads existentes en el mercado.',
        },
        {
          _key: 's3',
          number: '3',
          title: 'Seguimiento orgánico mensual',
          description: 'Durante 6 meses medimos, ajustamos y optimizamos — SEO, conversión y métricas — para que los resultados crezcan mes a mes sin depender de publicidad pagada.',
        },
      ],
    },
    {
      _key: 'landing-offer',
      _type: 'landingOffer',
      enabled: true,
      headline: 'Todo lo que necesitas para que tu web trabaje por ti',
      comparison: [
        { _key: 'c1', before: '"Soy agente inmobiliario"', after: '"Ayudo a familias a encontrar su hogar en Madrid"' },
        { _key: 'c2', before: 'Web genérica sin tráfico orgánico', after: 'Páginas optimizadas por ciudad e intención' },
        { _key: 'c3', before: 'Leads de Idealista a precio de oro', after: 'Leads directos desde Google, sin intermediarios' },
        { _key: 'c4', before: 'Formulario de contacto que nadie llena', after: 'Sistema automatizado de captación y cualificación' },
        { _key: 'c5', before: 'Sin métricas ni dirección', after: 'Reporting mensual + ajustes estratégicos' },
      ],
      services: [
        { _key: 'sv1', title: 'Posicionamiento estratégico + definición de ICP' },
        { _key: 'sv2', title: 'Reestructuración web + arquitectura de páginas' },
        { _key: 'sv3', title: 'Web copy orientado a conversión' },
        { _key: 'sv4', title: 'SEO local e intencional por ciudad/barrio/audiencia' },
        { _key: 'sv5', title: 'Integración de herramientas de captación de leads' },
        { _key: 'sv6', title: 'Seguimiento mensual orgánico — mínimo 6 meses' },
      ],
      ctaLabel: 'Reserva tu llamada gratuita',
      ctaHref: CTA_HREF,
    },
    {
      _key: 'landing-testimonials',
      _type: 'landingTestimonials',
      enabled: true,
      headline: 'Lo que dicen quienes ya trabajaron con esta metodología',
      subtitle: 'Trabajo con fundadores, negocios locales y agentes que quieren crecer de forma orgánica y sistemática.',
      testimonials: [
        { _key: 'lt1', name: 'Andres Ugueto', role: 'Founder & CEO', quote: 'Nestor entendió exactamente lo que necesitábamos. Nuestra web pasó de ser una tarjeta de visita a una máquina de generar consultas.' },
        { _key: 'lt2', name: 'Alvaro Gargano', role: 'Co-Founder', quote: 'El enfoque estratégico hizo toda la diferencia. No se trata de tener una web bonita, sino de que funcione.' },
        { _key: 'lt3', name: 'Anna Wolf', role: 'Marketing Director', quote: 'Profesional, metódico y orientado a resultados. Recomiendo trabajar con Nestor sin dudarlo.' },
      ],
    },
    {
      _key: 'landing-faq',
      _type: 'landingFaq',
      enabled: true,
      headline: 'Preguntas frecuentes sobre estrategia digital para agentes inmobiliarios',
      faqs: [
        { _key: 'f1', question: '¿En cuánto tiempo veo resultados?', answer: 'Los cambios en web y posicionamiento se ven desde el primer mes. El SEO local consolida resultados entre 3 y 6 meses — por eso el seguimiento mínimo es de 6 meses.' },
        { _key: 'f2', question: '¿Necesito cambiar toda mi web?', answer: 'No siempre. En muchos casos una reestructuración y reescritura del copy existente es suficiente. Lo evaluamos juntos en la llamada inicial.' },
        { _key: 'f3', question: '¿Funciona si ya tengo perfil en Idealista o Fotocasa?', answer: 'Sí, y es precisamente el objetivo. Los portales son costosos y dependientes. Este sistema construye un canal propio que reduce esa dependencia mes a mes.' },
        { _key: 'f4', question: '¿Puedo ofrecer varios servicios y aun así tener un nicho?', answer: 'Absolutamente. La estrategia consiste en posicionar una oferta principal de forma clara, y crear páginas secundarias para cada servicio adicional — cada una con su propio SEO y objetivo de conversión.' },
        { _key: 'f5', question: '¿Trabajas con agentes fuera de España?', answer: 'Sí. Trabajo en remoto con agentes en España, DACH y Latinoamérica. El proceso es 100% online.' },
        { _key: 'f6', question: '¿Qué pasa después de los 6 meses?', answer: 'Definimos juntos si continúa el seguimiento mensual o si pasas a gestionar el sistema de forma autónoma. Sin contratos forzosos.' },
      ],
    },
    {
      _key: 'landing-cta-final',
      _type: 'landingCtaFinal',
      enabled: true,
      headline: '¿Listo para que tu web empiece a generar clientes?',
      copy: 'En 30 minutos analizamos tu presencia digital actual y te digo exactamente dónde está tu mayor oportunidad de crecimiento orgánico — sin coste, sin compromiso.',
      ctaLabel: 'RESERVA TU LLAMADA GRATUITA',
      ctaHref: CTA_HREF,
      scarcityText: 'Acepto un número limitado de proyectos por trimestre.',
    },
  ],
}

async function seed() {
  console.log('Seeding ES landing page...')
  await client.createOrReplace(page)
  console.log(`Created/updated: ${PAGE_ID}`)
  console.log('Done!')
}

seed().catch((err) => { console.error(err); process.exit(1) })
