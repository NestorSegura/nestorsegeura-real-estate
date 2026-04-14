import { type SchemaTypeDefinition } from 'sanity'
import { blockContentType } from './objects/blockContent'
import { pageType } from './documents/page'
import { postType } from './documents/post'
import { authorType } from './documents/author'
import { siteSettingsType } from './documents/siteSettings'
import { heroSectionType } from './blocks/heroSection'
import { featureStripType } from './blocks/featureStrip'
import { testimonialsBlockType } from './blocks/testimonialsBlock'
import { ctaBlockType } from './blocks/ctaBlock'
import { problemSolutionBlockType } from './blocks/problemSolutionBlock'
import { servicesBlockType } from './blocks/servicesBlock'
import { faqBlockType } from './blocks/faqBlock'
import { referencesBlockType } from './blocks/referencesBlock'
import { landingHeroType } from './blocks/landingHero'
import { landingProblemType } from './blocks/landingProblem'
import { landingGuideType } from './blocks/landingGuide'
import { landingPlanType } from './blocks/landingPlan'
import { landingOfferType } from './blocks/landingOffer'
import { landingTestimonialsType } from './blocks/landingTestimonials'
import { landingFaqType } from './blocks/landingFaq'
import { landingCtaFinalType } from './blocks/landingCtaFinal'

export const schemaTypes: SchemaTypeDefinition[] = [
  blockContentType,
  pageType,
  postType,
  authorType,
  siteSettingsType,
  heroSectionType,
  featureStripType,
  testimonialsBlockType,
  ctaBlockType,
  problemSolutionBlockType,
  servicesBlockType,
  faqBlockType,
  referencesBlockType,
  landingHeroType,
  landingProblemType,
  landingGuideType,
  landingPlanType,
  landingOfferType,
  landingTestimonialsType,
  landingFaqType,
  landingCtaFinalType,
]
