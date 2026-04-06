import { defineField, defineType } from 'sanity'

export const landingCtaFinalType = defineType({
  name: 'landingCtaFinal',
  title: 'Landing CTA Final',
  type: 'object',
  fields: [
    defineField({ name: 'headline', title: 'Headline', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'copy', title: 'Copy', type: 'text', rows: 3 }),
    defineField({ name: 'ctaLabel', title: 'CTA Label', type: 'string' }),
    defineField({ name: 'ctaHref', title: 'CTA URL', type: 'url' }),
    defineField({ name: 'scarcityText', title: 'Scarcity Text', type: 'string' }),
    defineField({ name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'headline' },
    prepare: ({ title }) => ({ title: title ?? 'Landing CTA Final', subtitle: 'CTA Final Section' }),
  },
})
