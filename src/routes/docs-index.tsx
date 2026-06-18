import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, FileText } from 'lucide-react'
import { Container } from '../components/ui/container'
import { SectionHeading } from '../components/ui/section-heading'
import { useManifest } from '../content/useManifest'
import type { DocCategory } from '../content/manifest'
import type { Locale } from '../i18n'
import { FALLBACK_LOCALE } from '../i18n'

const CATEGORY_ORDER: DocCategory[] = ['basics', 'configuration', 'integration', 'reference']

export default function DocsIndex() {
  const { t, i18n } = useTranslation()
  const locale = (i18n.resolvedLanguage ?? FALLBACK_LOCALE) as Locale
  const docs = useManifest()

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: (docs ?? []).filter((d) => d.category === category),
  })).filter((g) => g.items.length > 0)

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="HarnessSphere"
        title={t('docs.title')}
        subtitle={t('docs.subtitle')}
      />

      <div className="mt-14 space-y-12">
        {grouped.map(({ category, items }) => (
          <section key={category}>
            <h2 className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
              {t(`docs.categories.${category}`)}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((doc) => (
                <Link
                  key={doc.slug}
                  to={`/docs/${doc.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-brand-950/50 p-5 transition-all hover:-translate-y-0.5 hover:border-brand-400/50 hover:bg-brand-900/50"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-800/50 text-brand-200 transition-colors group-hover:text-white">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 font-display font-medium text-white">
                    {doc.title[locale] ?? doc.title[FALLBACK_LOCALE]}
                  </span>
                  <ArrowRight className="h-4 w-4 text-brand-300 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Container>
  )
}
