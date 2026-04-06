import { defineArrayMember, defineField, defineType } from 'sanity'

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'SEO Title',
          type: 'string',
        }),
        defineField({
          name: 'description',
          title: 'SEO Description',
          type: 'text',
          rows: 3,
        }),
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [
        defineArrayMember({ type: 'heroSection' }),
        defineArrayMember({ type: 'featureStrip' }),
        defineArrayMember({ type: 'testimonialsBlock' }),
        defineArrayMember({ type: 'ctaBlock' }),
        defineArrayMember({ type: 'problemSolutionBlock' }),
        defineArrayMember({ type: 'servicesBlock' }),
        defineArrayMember({ type: 'faqBlock' }),
        defineArrayMember({ type: 'referencesBlock' }),
        defineArrayMember({ type: 'landingHero' }),
        defineArrayMember({ type: 'landingProblem' }),
        defineArrayMember({ type: 'landingGuide' }),
        defineArrayMember({ type: 'landingPlan' }),
        defineArrayMember({ type: 'landingOffer' }),
        defineArrayMember({ type: 'landingTestimonials' }),
        defineArrayMember({ type: 'landingFaq' }),
        defineArrayMember({ type: 'landingCtaFinal' }),
      ],
      description: 'Page builder blocks',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
    },
  },
})
