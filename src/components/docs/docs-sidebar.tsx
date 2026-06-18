import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { DocCategory, DocEntry } from '../../content/manifest'
import type { Locale } from '../../i18n'
import { FALLBACK_LOCALE } from '../../i18n'
import { cn } from '../../lib/cn'

const CATEGORY_ORDER: DocCategory[] = ['basics', 'configuration', 'integration', 'reference']

export function DocsSidebar({ docs }: { docs: DocEntry[] }) {
  const { t, i18n } = useTranslation()
  const locale = (i18n.resolvedLanguage ?? FALLBACK_LOCALE) as Locale

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: docs.filter((d) => d.category === category),
  })).filter((g) => g.items.length > 0)

  return (
    <nav className="space-y-7" aria-label={t('docs.title')}>
      {grouped.map(({ category, items }) => (
        <div key={category}>
          <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
            {t(`docs.categories.${category}`)}
          </h3>
          <ul className="space-y-0.5 border-l border-white/10">
            {items.map((doc) => (
              <li key={doc.slug}>
                <NavLink
                  to={`/docs/${doc.slug}`}
                  className={({ isActive }) =>
                    cn(
                      '-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors',
                      isActive
                        ? 'border-brand-400 font-medium text-white'
                        : 'border-transparent text-brand-200/70 hover:border-white/30 hover:text-white',
                    )
                  }
                >
                  {doc.title[locale] ?? doc.title[FALLBACK_LOCALE]}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
