import { defineField, defineType } from 'sanity'

export const heroSectionType = defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'style', title: 'Style' },
  ],
  fields: [
    // Content fields
    defineField({
      name: 'badge',
      title: 'Badge Text',
      type: 'string',
      description: 'Small label displayed above the headline (e.g. "Exclusively for Real Estate Agents")',
      group: 'content',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'highlightedText',
      title: 'Highlighted Text',
      type: 'string',
      description: 'Part of the headline rendered in the accent color (teal). Must match text within the headline exactly.',
      group: 'content',
    }),
    defineField({
      name: 'subheadline',
      title: 'Subheadline',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'ctaHref',
      title: 'CTA URL',
      type: 'url',
      description: 'Per-block CTA override — if empty, frontend uses SiteSettings.defaultCtaHref',
      group: 'content',
    }),
    defineField({
      name: 'ctaSecondaryText',
      title: 'CTA Secondary Text',
      type: 'string',
      description: 'Small text displayed next to the CTA (e.g. "* No credit card required")',
      group: 'content',
    }),
    defineField({
      name: 'portraitImage',
      title: 'Portrait Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Portrait photo displayed in the right column',
      group: 'content',
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
    select: {
      title: 'headline',
      media: 'portraitImage',
    },
    prepare({ title, media }) {
      return {
        title: title ?? 'Hero Section',
        subtitle: 'Hero Section',
        media,
      }
    },
  },
})
