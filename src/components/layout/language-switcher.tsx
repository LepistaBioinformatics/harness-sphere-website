import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import { SUPPORTED_LOCALES, type Locale } from '../../i18n'
import { cn } from '../../lib/cn'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const current = (i18n.resolvedLanguage ?? 'en-US') as Locale

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-brand-950/60 p-1 backdrop-blur"
      role="group"
      aria-label={t('lang.label')}
    >
      <Languages className="ml-1.5 h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => i18n.changeLanguage(locale)}
          aria-pressed={current === locale}
          className={cn(
            'rounded-full px-2.5 py-1 font-mono text-xs font-medium uppercase tracking-wider transition-colors',
            current === locale
              ? 'bg-brand-400 text-brand-975'
              : 'text-brand-200/70 hover:text-white',
          )}
        >
          {locale.split('-')[0]}
        </button>
      ))}
    </div>
  )
}
