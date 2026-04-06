import { defineArrayMember, defineField, defineType } from 'sanity'

export const landingTestimonialsType = defineType({
  name: 'landingTestimonials',
  title: 'Landing Testimonials',
  type: 'object',
  fields: [
    defineField({ name: 'headline', title: 'Headline', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'subtitle', title: 'Subtitle', type: 'text', rows: 2 }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Name', type: 'string' }),
          defineField({ name: 'role', title: 'Role', type: 'string' }),
          defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3 }),
          defineField({ name: 'image', title: 'Photo', type: 'image', options: { hotspot: true } }),
        ],
      })],
    }),
    defineField({ name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'headline' },
    prepare: ({ title }) => ({ title: title ?? 'Landing Testimonials', subtitle: 'Testimonials Section' }),
  },
})
