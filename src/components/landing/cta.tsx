import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Star } from 'lucide-react'
import { Container } from '../ui/container'
import { buttonVariants } from '../ui/button'
import { GITHUB_URL } from '../../lib/constants'
import { cn } from '../../lib/cn'

export function CTA() {
  const { t } = useTranslation()

  return (
    <section className="py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-brand-500/40 bg-gradient-to-br from-brand-800/60 via-brand-900/50 to-brand-950/60 px-7 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-azure/20 blur-3xl" />

          <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t('cta.title')}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-brand-200/80">
            {t('cta.subtitle')}
          </p>
          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/docs" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}>
              {t('cta.primary')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }))}
            >
              <Star className="h-4 w-4" aria-hidden="true" />
              {t('cta.secondary')}
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}
