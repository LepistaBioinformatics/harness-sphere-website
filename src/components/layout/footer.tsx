import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Wordmark } from '../brand-mark'
import { Container } from '../ui/container'
import { GITHUB_URL, LEPISTA_URL } from '../../lib/constants'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="mt-24 border-t border-white/10 bg-brand-975/60">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-sm">
          <Wordmark />
          <p className="mt-4 text-sm leading-relaxed text-brand-200/70">
            {t('footer.tagline')}
          </p>
        </div>

        <div>
          <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
            {t('footer.product')}
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link to="/docs" className="text-brand-200/80 transition-colors hover:text-white">
                {t('footer.docs')}
              </Link>
            </li>
            <li>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="text-brand-200/80 transition-colors hover:text-white"
              >
                {t('footer.github')}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
            {t('footer.resources')}
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="text-brand-200/60">{t('footer.license')}</li>
            <li>
              <a
                href={LEPISTA_URL}
                target="_blank"
                rel="noreferrer"
                className="text-brand-200/80 transition-colors hover:text-white"
              >
                {t('footer.builtBy')}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <Container className="flex flex-col gap-2 border-t border-white/5 py-6 text-xs text-brand-200/50 sm:flex-row sm:items-center sm:justify-between">
        <span>© HarnessSphere · {t('footer.rights')}</span>
        <span className="font-mono">harnesssphere</span>
      </Container>
    </footer>
  )
}
