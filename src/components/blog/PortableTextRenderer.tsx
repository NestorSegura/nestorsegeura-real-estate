import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import type { PortableTextComponents } from '@portabletext/react'
import { urlFor } from '@/sanity/lib/image'

const components: PortableTextComponents = {
  types: {
    image: ({ value }: { value: { asset?: unknown; caption?: string; alt?: string } }) => {
      if (!value?.asset) return null
      return (
        <figure className="my-8">
          <Image
            src={urlFor(value).width(800).height(450).url()}
            alt={value.alt ?? ''}
            width={800}
            height={450}
            className="rounded-lg w-full h-auto"
          />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  block: {
    h2: ({ children, value }) => (
      <h2
        id={`h2-${value._key}`}
        className="text-2xl font-bold mt-10 mb-4 scroll-mt-24 text-foreground leading-tight"
      >
        {children}
      </h2>
    ),
    h3: ({ children, value }) => (
      <h3
        id={`h3-${value._key}`}
        className="text-xl font-semibold mt-8 mb-3 scroll-mt-24 text-foreground leading-snug"
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold mt-6 mb-2 text-foreground">{children}</h4>
    ),
    normal: ({ children }) => (
      <p className="text-base leading-relaxed text-foreground mb-4">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-6 text-muted-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside pl-6 my-4 space-y-1 text-foreground">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside pl-6 my-4 space-y-1 text-foreground">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="bg-muted text-sm font-mono px-1.5 py-0.5 rounded">{children}</code>
    ),
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
      >
        {children}
      </a>
    ),
  },
}

interface PortableTextRendererProps {
  value: Parameters<typeof PortableText>[0]['value']
}

export function PortableTextRenderer({ value }: PortableTextRendererProps) {
  return (
    <div className="max-w-none">
      <PortableText value={value} components={components} />
    </div>
  )
}
