import { defineField, defineType } from 'sanity'

export const ctaBlockType = defineType({
  name: 'ctaBlock',
  title: 'CTA Block',
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'style', title: 'Style' },
  ],
  fields: [
    // Content fields
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtext',
      title: 'Subtext',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctaHref',
      title: 'CTA URL',
      type: 'url',
      description: 'Per-block CTA override — if empty, frontend uses SiteSettings.defaultCtaHref',
      group: 'content',
    }),
    // Style fields
    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      group: 'style',
      options: {
        list: [
          { title: 'Primary', value: 'primary' },
          { title: 'Secondary', value: 'secondary' },
        ],
      },
      initialValue: 'primary',
    }),
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
    select: { title: 'headline', subtitle: 'variant' },
    prepare({ title, subtitle }) {
      return {
        title: title ?? 'CTA Block',
        subtitle: subtitle ? `Variant: ${subtitle}` : 'CTA Block',
      }
    },
  },
})
