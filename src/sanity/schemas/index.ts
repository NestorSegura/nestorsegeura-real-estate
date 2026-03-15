import { type SchemaTypeDefinition } from 'sanity'
import { pageType } from './documents/page'
import { postType } from './documents/post'
import { siteSettingsType } from './documents/siteSettings'
import { heroSectionType } from './blocks/heroSection'
import { featureStripType } from './blocks/featureStrip'
import { testimonialsBlockType } from './blocks/testimonialsBlock'
import { ctaBlockType } from './blocks/ctaBlock'
import { problemSolutionBlockType } from './blocks/problemSolutionBlock'
import { servicesBlockType } from './blocks/servicesBlock'
import { faqBlockType } from './blocks/faqBlock'
import { referencesBlockType } from './blocks/referencesBlock'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  pageType,
  postType,
  siteSettingsType,
  // Page Builder Blocks
  heroSectionType,
  featureStripType,
  testimonialsBlockType,
  ctaBlockType,
  problemSolutionBlockType,
  servicesBlockType,
  faqBlockType,
  referencesBlockType,
]
