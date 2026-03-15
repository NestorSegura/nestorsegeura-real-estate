import { defineArrayMember, defineField, defineType } from 'sanity'

export const problemSolutionBlockType = defineType({
  name: 'problemSolutionBlock',
  title: 'Problem/Solution Block',
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
      name: 'problems',
      title: 'Problems',
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
              name: 'headline',
              title: 'Headline',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            }),
          ],
          preview: {
            select: { title: 'headline', subtitle: 'number' },
            prepare({ title, subtitle }) {
              return {
                title: title ?? 'Problem item',
                subtitle: subtitle != null ? `#${subtitle}` : undefined,
              }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.min(3).max(5),
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
      return { title: title ?? 'Problem/Solution Block' }
    },
  },
})
