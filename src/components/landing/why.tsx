import { useTranslation } from 'react-i18next'
import { Check, X } from 'lucide-react'
import { Container } from '../ui/container'
import { SectionHeading } from '../ui/section-heading'
import { asList } from '../../lib/as-list'

export function Why() {
  const { t } = useTranslation()
  const pain = asList<string>(t('why.pain', { returnObjects: true }))
  const solution = asList<string>(t('why.solution', { returnObjects: true }))

  return (
    <section className="py-20">
      <Container>
        <SectionHeading eyebrow={t('why.eyebrow')} title={t('why.title')} />
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-200/75">
          {t('why.body')}
        </p>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-brand-950/40 p-7">
            <h3 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold text-brand-200">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-alert/15 text-alert">
                <X className="h-4 w-4" aria-hidden="true" />
              </span>
              {t('why.painTitle')}
            </h3>
            <ul className="space-y-3.5">
              {pain.map((item) => (
                <li key={item} className="flex gap-3 text-brand-200/75">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-alert/70" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-2xl border border-brand-500/40 bg-gradient-to-b from-brand-900/50 to-brand-950/40 p-7 shadow-[0_24px_80px_-40px] shadow-brand-500/60">
            <h3 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold text-white">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-signal/15 text-signal-soft">
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
              {t('why.solutionTitle')}
            </h3>
            <ul className="space-y-3.5">
              {solution.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-signal-soft" aria-hidden="true" />
                  <span className="text-brand-200/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}
