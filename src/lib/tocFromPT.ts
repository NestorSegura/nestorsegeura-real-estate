/**
 * Table of Contents extraction from Portable Text body.
 *
 * Filters the body array for h2 and h3 block nodes, joins their children
 * text spans, and produces slug IDs matching the rendered heading IDs in
 * PTRenderer (override h2/h3 to add `id` attribute with the same slug).
 */

export interface TocItem {
  text: string
  id: string
  level: 2 | 3
}

/**
 * Extract h2/h3 headings from a Portable Text body array.
 *
 * @param body - The portable text array from a Sanity post's body field.
 * @returns Array of TocItem objects ready for a sidebar TOC component.
 */
export function extractToc(body: unknown[]): TocItem[] {
  if (!body) return []
  return body
    .filter(
      (block: any) =>
        block._type === 'block' && (block.style === 'h2' || block.style === 'h3'),
    )
    .map((block: any) => {
      const text =
        block.children?.map((s: any) => s.text ?? '').join('') ?? ''
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 60)
      return { text, id, level: (block.style === 'h2' ? 2 : 3) as 2 | 3 }
    })
}
