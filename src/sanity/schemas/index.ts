import { type SchemaTypeDefinition } from 'sanity'
import { pageType } from './documents/page'
import { postType } from './documents/post'
import { siteSettingsType } from './documents/siteSettings'

export const schemaTypes: SchemaTypeDefinition[] = [pageType, postType, siteSettingsType]
