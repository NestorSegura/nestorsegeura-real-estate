import type { PortableTextBlock } from '@portabletext/react'

export type TocItem = {
  id: string
  text: string
  level: 'h2' | 'h3'
}

export function extractHeadings(blocks: PortableTextBlock[]): TocItem[] {
  return blocks
    .filter(
      (block) =>
        block._type === 'block' &&
        (block.style === 'h2' || block.style === 'h3')
    )
    .map((block) => {
      const style = block.style as 'h2' | 'h3'
      const children = (block.children ?? []) as Array<{ text?: string }>
      const text = children.map((child) => child.text ?? '').join('')
      return {
        id: `${style}-${block._key}`,
        text,
        level: style,
      }
    })
}
