import { defineArrayMember, defineField, defineType } from 'sanity'

export const testimonialsBlockType = defineType({
  name: 'testimonialsBlock',
  title: 'Testimonials Block',
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'style', title: 'Style' },
  ],
  fields: [
    // Content fields
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'quote',
              title: 'Quote',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'author',
              title: 'Author',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'role',
              title: 'Role / Title',
              type: 'string',
            }),
            defineField({
              name: 'avatar',
              title: 'Avatar',
              type: 'image',
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: 'author', subtitle: 'role' },
          },
        }),
      ],
      validation: (Rule) => Rule.min(2).max(6),
    }),
    // Style fields
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      group: 'style',
      initialValue: true,
    }),
    defineField({
      name: 'colorScheme',
      title: 'Color Scheme',
      type: 'string',
      group: 'style',
      options: {
        list: [
          { title: 'Light', value: 'light' },
          { title: 'Dark', value: 'dark' },
        ],
      },
      initialValue: 'light',
    }),
    defineField({
      name: 'spacing',
      title: 'Spacing',
      type: 'string',
      group: 'style',
      options: {
        list: [
          { title: 'Compact', value: 'compact' },
          { title: 'Normal', value: 'normal' },
          { title: 'Spacious', value: 'spacious' },
        ],
      },
      initialValue: 'normal',
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return { title: title ?? 'Testimonials Block' }
    },
  },
})
