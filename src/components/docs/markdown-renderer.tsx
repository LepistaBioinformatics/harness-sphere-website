import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

const prose = [
  'prose prose-invert max-w-none',
  // Headings
  'prose-headings:font-display prose-headings:tracking-tight prose-headings:scroll-mt-24',
  'prose-h1:text-3xl prose-h1:sm:text-4xl prose-h2:mt-12 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2',
  // Body
  'prose-p:text-brand-200/85 prose-li:text-brand-200/85 prose-strong:text-white',
  // Links
  'prose-a:font-medium prose-a:text-azure-soft prose-a:no-underline hover:prose-a:underline',
  // Inline code + code blocks
  'prose-code:rounded prose-code:bg-brand-900/70 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.85em] prose-code:text-brand-200 prose-code:before:content-none prose-code:after:content-none',
  'prose-pre:rounded-2xl prose-pre:border prose-pre:border-white/10 prose-pre:bg-brand-950/80 prose-pre:font-mono',
  // Tables (the harness-sphere docs are table-heavy)
  'prose-table:overflow-hidden prose-table:rounded-xl prose-th:border-b prose-th:border-white/15 prose-th:text-brand-200 prose-td:border-white/5',
  // Quotes
  'prose-blockquote:border-l-brand-400 prose-blockquote:bg-brand-900/30 prose-blockquote:py-1 prose-blockquote:not-italic prose-blockquote:text-brand-200/80',
].join(' ')

export function MarkdownRenderer({ children }: { children: string }) {
  return (
    <div className={prose}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          rehypeHighlight,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ]}
        components={{
          a({ href, children, ...props }) {
            const external = href?.startsWith('http')
            return (
              <a
                href={href}
                {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                {...props}
              >
                {children}
              </a>
            )
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
