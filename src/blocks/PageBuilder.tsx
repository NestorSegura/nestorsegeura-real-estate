import { HeroSection } from './HeroSection'
import { FeatureStrip } from './FeatureStrip'
import { TestimonialsBlock } from './TestimonialsBlock'
import { CtaBlock } from './CtaBlock'
import { ProblemSolutionBlock } from './ProblemSolutionBlock'
import { ServicesBlock } from './ServicesBlock'
import { FaqBlock } from './FaqBlock'
import { ReferencesBlock } from './ReferencesBlock'

export type PageSection = {
  _type: string
  _key: string
  enabled?: boolean
  colorScheme?: 'light' | 'dark'
  spacing?: 'compact' | 'normal' | 'spacious'
  sectionId?: string
  [key: string]: unknown
}

interface PageBuilderProps {
  sections: PageSection[]
}

/**
 * Dispatches Sanity page sections to their React components.
 * - Skips blocks where enabled === false
 * - Renders GradientDivider between color scheme transitions
 * - console.warn (not throw) for unknown block types
 */
export function PageBuilder({ sections }: PageBuilderProps) {
  const enabled = sections.filter((block) => block.enabled !== false)

  const elements: React.ReactNode[] = []

  enabled.forEach((block) => {
    switch (block._type) {
      case 'heroSection':
        elements.push(<HeroSection key={block._key} {...(block as Parameters<typeof HeroSection>[0])} />)
        break
      case 'featureStrip':
        elements.push(<FeatureStrip key={block._key} {...(block as Parameters<typeof FeatureStrip>[0])} sectionId={block.sectionId} />)
        break
      case 'testimonialsBlock':
        elements.push(<TestimonialsBlock key={block._key} {...(block as Parameters<typeof TestimonialsBlock>[0])} sectionId={block.sectionId} />)
        break
      case 'ctaBlock':
        elements.push(<CtaBlock key={block._key} {...(block as Parameters<typeof CtaBlock>[0])} sectionId={block.sectionId} />)
        break
      case 'problemSolutionBlock':
        elements.push(<ProblemSolutionBlock key={block._key} {...(block as Parameters<typeof ProblemSolutionBlock>[0])} sectionId={block.sectionId} />)
        break
      case 'servicesBlock':
        elements.push(<ServicesBlock key={block._key} {...(block as Parameters<typeof ServicesBlock>[0])} sectionId={block.sectionId} />)
        break
      case 'faqBlock':
        elements.push(<FaqBlock key={block._key} {...(block as Parameters<typeof FaqBlock>[0])} sectionId={block.sectionId} />)
        break
      case 'referencesBlock':
        elements.push(<ReferencesBlock key={block._key} {...(block as Parameters<typeof ReferencesBlock>[0])} sectionId={block.sectionId} />)
        break
      default:
        // eslint-disable-next-line no-console
        console.warn(`[PageBuilder] Unknown block type: ${(block as { _type: string })._type}`)
        break
    }
  })

  return <>{elements}</>
}
