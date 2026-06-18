import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'
import { Container } from '../ui/container'
import { SectionHeading } from '../ui/section-heading'

export function Resilience() {
  const { t } = useTranslation()
  const points = t('resilience.points', { returnObjects: true }) as {
    title: string
    body: string
  }[]

  return (
    <section className="py-20">
      <Container className="rounded-3xl border border-white/10 bg-brand-950/40 px-7 py-14 sm:px-12">
        <div className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-signal-soft">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          {t('resilience.eyebrow')}
        </div>
        <SectionHeading title={t('resilience.title')} subtitle={t('resilience.subtitle')} />

        <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {points.map((p, i) => (
            <div key={p.title} className="flex gap-4">
              <span className="font-mono text-sm font-medium text-brand-400">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-display font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-200/75">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
