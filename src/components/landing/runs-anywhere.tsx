import { useTranslation } from 'react-i18next'
import { Cpu } from 'lucide-react'
import { Container } from '../ui/container'
import { SectionHeading } from '../ui/section-heading'

export function RunsAnywhere() {
  const { t } = useTranslation()
  const targets = t('runsAnywhere.targets', { returnObjects: true }) as string[]

  return (
    <section className="py-20">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow={t('runsAnywhere.eyebrow')}
            title={t('runsAnywhere.title')}
            subtitle={t('runsAnywhere.subtitle')}
          />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-brand-200/60">
            {t('runsAnywhere.note')}
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {targets.map((target) => (
            <li
              key={target}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-brand-950/50 px-4 py-3.5"
            >
              <Cpu className="h-4 w-4 shrink-0 text-infra-soft" aria-hidden="true" />
              <span className="font-mono text-sm text-brand-200/85">{target}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
