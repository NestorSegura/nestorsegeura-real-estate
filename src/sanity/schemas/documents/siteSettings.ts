import { defineField, defineType, defineArrayMember } from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'general', title: 'General' },
    { name: 'nav', title: 'Navigation' },
    { name: 'seo', title: 'SEO' },
    { name: 'footer', title: 'Footer' },
  ],
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      group: 'general',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'general',
    }),
    defineField({
      name: 'defaultCtaHref',
      title: 'Default CTA URL',
      type: 'url',
      group: 'general',
      description: 'Global calendar booking URL — individual blocks can override this',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({
          name: 'title',
          title: 'Default SEO Title',
          type: 'string',
        }),
        defineField({
          name: 'description',
          title: 'Default SEO Description',
          type: 'text',
          rows: 3,
        }),
        defineField({
          name: 'ogImage',
          title: 'Default OG Image',
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
      ],
    }),
    // -------------------------------------------------------------------------
    // Legacy navigation[] — preserved for Phase 8 compatibility (single-label)
    // -------------------------------------------------------------------------
    defineField({
      name: 'navigation',
      title: 'Navigation (Legacy)',
      type: 'array',
      group: 'nav',
      description: 'Legacy single-label nav items — use "Navigation Items" below for Phase 9+',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'URL',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'href',
            },
          },
        },
      ],
    }),
    // -------------------------------------------------------------------------
    // Phase 9 Navigation — per-locale labels
    // -------------------------------------------------------------------------
    defineField({
      name: 'navItems',
      title: 'Navigation Items',
      type: 'array',
      group: 'nav',
      description: 'Phase 9 navbar — per-locale labels for each nav link',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'key',
              title: 'Route Key',
              type: 'string',
              description: 'Matches i18n route key (e.g. "blog", "analyse", "kontakt")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'labelDe',
              title: 'Label (DE)',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'labelEn',
              title: 'Label (EN)',
              type: 'string',
            }),
            defineField({
              name: 'labelEs',
              title: 'Label (ES)',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              title: 'labelDe',
              subtitle: 'key',
            },
            prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
              return {
                title: title ?? '(no label)',
                subtitle: subtitle ? `key: ${subtitle}` : '',
              }
            },
          },
        }),
      ],
    }),
    // -------------------------------------------------------------------------
    // Phase 9 CTA — per-locale label + single URL (Calendly)
    // -------------------------------------------------------------------------
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'object',
      group: 'nav',
      description: 'Per-locale label for the primary nav CTA button (e.g. "Termin buchen")',
      fields: [
        defineField({
          name: 'de',
          title: 'Label (DE)',
          type: 'string',
        }),
        defineField({
          name: 'en',
          title: 'Label (EN)',
          type: 'string',
        }),
        defineField({
          name: 'es',
          title: 'Label (ES)',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'ctaHref',
      title: 'CTA URL (Calendly)',
      type: 'url',
      group: 'nav',
      description: 'Calendly booking link used by the nav CTA button across all locales',
      validation: (Rule) =>
        Rule.uri({ scheme: ['https'] }).warning('Should be a valid https URL'),
    }),
    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      group: 'footer',
      fields: [
        defineField({
          name: 'socialLinks',
          title: 'Social Links',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'platform',
                  title: 'Platform',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'url',
                  title: 'URL',
                  type: 'url',
                  validation: (Rule) => Rule.required(),
                }),
              ],
              preview: {
                select: {
                  title: 'platform',
                  subtitle: 'url',
                },
              },
            },
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'siteName',
      subtitle: 'tagline',
    },
  },
})
