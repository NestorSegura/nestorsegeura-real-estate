import { defineField, defineType } from 'sanity'

export const landingHeroType = defineType({
  name: 'landingHero',
  title: 'Landing Hero',
  type: 'object',
  fields: [
    defineField({ name: 'headline', title: 'Headline (H1)', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'subtitle', title: 'Subtitle', type: 'text', rows: 3 }),
    defineField({ name: 'ctaLabel', title: 'CTA Label', type: 'string' }),
    defineField({ name: 'ctaHref', title: 'CTA URL', type: 'url' }),
    defineField({ name: 'ctaSecondaryLabel', title: 'Secondary CTA Label', type: 'string' }),
    defineField({ name: 'ctaSecondaryHref', title: 'Secondary CTA Href', type: 'string' }),
    defineField({ name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'headline' },
    prepare: ({ title }) => ({ title: title ?? 'Landing Hero', subtitle: 'Landing Hero' }),
  },
})
