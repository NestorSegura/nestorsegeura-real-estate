import { defineArrayMember, defineField, defineType } from 'sanity'

export const landingOfferType = defineType({
  name: 'landingOffer',
  title: 'Landing Offer',
  type: 'object',
  fields: [
    defineField({ name: 'headline', title: 'Headline', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'comparison',
      title: 'Before/After Comparison',
      type: 'array',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'before', title: 'Before', type: 'string' }),
          defineField({ name: 'after', title: 'After', type: 'string' }),
        ],
      })],
    }),
    defineField({
      name: 'services',
      title: 'Service Cards',
      type: 'array',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Title', type: 'string' }),
        ],
      })],
    }),
    defineField({ name: 'ctaLabel', title: 'CTA Label', type: 'string' }),
    defineField({ name: 'ctaHref', title: 'CTA URL', type: 'url' }),
    defineField({ name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'headline' },
    prepare: ({ title }) => ({ title: title ?? 'Landing Offer', subtitle: 'Offer Section' }),
  },
})
