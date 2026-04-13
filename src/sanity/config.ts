import { documentInternationalization } from '@sanity/document-internationalization'
import { defineConfig } from 'sanity'
import { presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemas'

const singletonActions = new Set(['publish', 'discardChanges', 'restore'])
const singletonTypes = new Set(['siteSettings'])

export default defineConfig({
  name: 'nestorsegura-real-estate',
  title: 'Nestor Segura Real Estate',
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID ?? '0cn4widw',
  dataset: process.env.PUBLIC_SANITY_DATASET ?? 'production',
  basePath: '/studio',
  plugins: [
    documentInternationalization({
      supportedLanguages: [
        { id: 'es', title: 'Spanish' },
        { id: 'de', title: 'German' },
        { id: 'en', title: 'English' },
      ],
      schemaTypes: ['page', 'post'],
    }),
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(
                S.document().schemaType('siteSettings').documentId('siteSettings'),
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => !singletonTypes.has(item.getId() ?? ''),
            ),
          ]),
    }),
    presentationTool({
      previewUrl: {
        initial: process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:3000',
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && singletonActions.has(action))
        : input,
  },
})
