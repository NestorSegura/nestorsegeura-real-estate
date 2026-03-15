import { defineArrayMember, defineField, defineType } from 'sanity'

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
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
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
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
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
          { title: 'SVG Path Animation', value: 'svgPath' },
          { title: 'Background Image', value: 'backgroundImage' },
          { title: 'Text Only', value: 'textOnly' },
        ],
      },
      initialValue: 'svgPath',
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
      initialValue: 'dark',
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
      subtitle: 'variant',
    },
    prepare({ title, subtitle }) {
      return {
        title: title ?? 'Hero Section',
        subtitle: subtitle ? `Variant: ${subtitle}` : 'Hero Section',
      }
    },
  },
})
