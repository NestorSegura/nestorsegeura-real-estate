import { defineArrayMember, defineField, defineType } from 'sanity'

export const servicesBlockType = defineType({
  name: 'servicesBlock',
  title: 'Services Block',
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
      name: 'services',
      title: 'Services',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'number',
              title: 'Number',
              type: 'number',
              description: 'Display order number',
            }),
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'features',
              title: 'Features',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
            }),
            defineField({
              name: 'ctaLabel',
              title: 'CTA Label',
              type: 'string',
            }),
            defineField({
              name: 'ctaHref',
              title: 'CTA URL',
              type: 'url',
            }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'number' },
            prepare({ title, subtitle }) {
              return {
                title: title ?? 'Service item',
                subtitle: subtitle != null ? `#${subtitle}` : undefined,
              }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.min(2).max(4),
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
      return { title: title ?? 'Services Block' }
    },
  },
})
