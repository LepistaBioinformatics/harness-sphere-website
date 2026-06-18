import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Info } from 'lucide-react'
import { Container } from '../components/ui/container'
import { DocsSidebar } from '../components/docs/docs-sidebar'
import { MarkdownRenderer } from '../components/docs/markdown-renderer'
import { DownloadButton } from '../components/docs/download-button'
import { useManifest } from '../content/useManifest'
import { useMarkdown } from '../content/useMarkdown'
import type { Locale } from '../i18n'
import { FALLBACK_LOCALE } from '../i18n'

export default function DocPage() {
  const { slug = '' } = useParams()
  const { t, i18n } = useTranslation()
  const locale = (i18n.resolvedLanguage ?? FALLBACK_LOCALE) as Locale
  const docs = useManifest()
  const doc = useMarkdown(slug, locale)

  return (
    <Container className="py-12">
      <Link
        to="/docs"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-brand-200/70 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('docs.backToDocs')}
      </Link>

      <div className="grid gap-12 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          {docs && <DocsSidebar docs={docs} />}
        </aside>

        <article>
          <div className="mb-8 flex items-center justify-between gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-brand-300">
              {doc.entry ? t(`docs.categories.${doc.entry.category}`) : t('docs.readTime')}
            </span>
            {doc.status === 'ready' && (
              <DownloadButton url={doc.downloadUrl} filename={`${slug}.md`} />
            )}
          </div>

          {doc.usedFallback && doc.status === 'ready' && (
            <div className="mb-8 flex items-start gap-3 rounded-xl border border-science/30 bg-science/10 p-4 text-sm text-science">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{t('docs.fallbackNotice')}</p>
            </div>
          )}

          {doc.status === 'loading' && (
            <p className="font-mono text-sm text-brand-200/60">{t('docs.loading')}</p>
          )}

          {doc.status === 'error' && (
            <div className="rounded-2xl border border-white/10 bg-brand-950/50 p-8">
              <h1 className="font-display text-2xl font-semibold text-white">
                {t('docs.errorTitle')}
              </h1>
              <p className="mt-3 text-brand-200/70">{t('docs.errorBody')}</p>
            </div>
          )}

          {doc.status === 'ready' && <MarkdownRenderer>{doc.text}</MarkdownRenderer>}
        </article>
      </div>
    </Container>
  )
}
