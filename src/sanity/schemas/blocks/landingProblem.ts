import { defineArrayMember, defineField, defineType } from 'sanity'

export const landingProblemType = defineType({
  name: 'landingProblem',
  title: 'Landing Problem',
  type: 'object',
  fields: [
    defineField({ name: 'headline', title: 'Headline', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 3 }),
    defineField({
      name: 'problems',
      title: 'Problems',
      type: 'array',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'number', title: 'Number', type: 'string' }),
          defineField({ name: 'title', title: 'Title', type: 'string' }),
          defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
        ],
      })],
    }),
    defineField({ name: 'closing', title: 'Closing Text', type: 'string' }),
    defineField({ name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'headline' },
    prepare: ({ title }) => ({ title: title ?? 'Landing Problem', subtitle: 'Problem Section' }),
  },
})
