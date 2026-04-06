import { defineArrayMember, defineField, defineType } from 'sanity'

export const landingFaqType = defineType({
  name: 'landingFaq',
  title: 'Landing FAQ',
  type: 'object',
  fields: [
    defineField({ name: 'headline', title: 'Headline', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'faqs',
      title: 'FAQ Items',
      type: 'array',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'question', title: 'Question', type: 'string' }),
          defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 3 }),
        ],
      })],
    }),
    defineField({ name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'headline' },
    prepare: ({ title }) => ({ title: title ?? 'Landing FAQ', subtitle: 'FAQ Section' }),
  },
})
