import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Container } from '../ui/container'
import { buttonVariants } from '../ui/button'
import { GitHubIcon } from '../brand-mark'
import { GITHUB_URL } from '../../lib/constants'
import { cn } from '../../lib/cn'
import { OrbitVisual } from './orbit-visual'

export function Hero() {
  const { t } = useTranslation()

  const stats = [
    { value: t('hero.stats.binary'), hint: t('hero.stats.binaryHint') },
    { value: t('hero.stats.layers'), hint: t('hero.stats.layersHint') },
    { value: t('hero.stats.otel'), hint: t('hero.stats.otelHint') },
  ]

  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 lg:pb-28">
      <Container className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p
            className="animate-rise mb-5 inline-flex items-center gap-2 rounded-full border border-brand-600/50 bg-brand-900/40 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-brand-200"
            style={{ animationDelay: '0ms' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal-soft shadow-[0_0_8px] shadow-signal-soft" />
            {t('hero.eyebrow')}
          </p>

          <h1
            className="animate-rise font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            style={{ animationDelay: '80ms' }}
          >
            {t('hero.title')}{' '}
            <span className="bg-gradient-to-r from-brand-300 via-brand-200 to-infra-soft bg-clip-text text-transparent">
              {t('hero.highlight')}
            </span>
          </h1>

          <p
            className="animate-rise mt-6 max-w-xl text-lg leading-relaxed text-brand-200/80"
            style={{ animationDelay: '160ms' }}
          >
            {t('hero.subtitle')}
          </p>

          <div
            className="animate-rise mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: '240ms' }}
          >
            <Link to="/docs" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}>
              {t('hero.ctaPrimary')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }))}
            >
              <GitHubIcon className="h-4 w-4" />
              {t('hero.ctaGithub')}
            </a>
          </div>

          <dl
            className="animate-rise mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8"
            style={{ animationDelay: '320ms' }}
          >
            {stats.map((s) => (
              <div key={s.value}>
                <dt className="font-display text-2xl font-semibold text-white">{s.value}</dt>
                <dd className="mt-1 text-xs leading-snug text-brand-200/60">{s.hint}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div
          className="animate-rise relative hidden lg:block"
          style={{ animationDelay: '200ms' }}
        >
          <OrbitVisual />
        </div>
      </Container>
    </section>
  )
}
