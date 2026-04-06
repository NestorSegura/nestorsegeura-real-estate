import { defineArrayMember, defineField, defineType } from 'sanity'

export const landingGuideType = defineType({
  name: 'landingGuide',
  title: 'Landing Guide',
  type: 'object',
  fields: [
    defineField({ name: 'headline', title: 'Headline', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'paragraphs',
      title: 'Paragraphs',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({ name: 'image', title: 'Profile Image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'author', title: 'Author', type: 'string' }),
          defineField({ name: 'role', title: 'Role', type: 'string' }),
          defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3 }),
        ],
      })],
    }),
    defineField({ name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'headline' },
    prepare: ({ title }) => ({ title: title ?? 'Landing Guide', subtitle: 'Guide Section' }),
  },
})
