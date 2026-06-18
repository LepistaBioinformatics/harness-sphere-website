import { useTranslation } from 'react-i18next'
import { Container } from '../ui/container'
import { SectionHeading } from '../ui/section-heading'

export function Ecosystem() {
  const { t } = useTranslation()
  const items = t('ecosystem.items', { returnObjects: true }) as {
    name: string
    desc: string
  }[]
  const accents = ['var(--color-brand-400)', 'var(--color-infra)', 'var(--color-science)']

  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          eyebrow={t('ecosystem.eyebrow')}
          title={t('ecosystem.title')}
          subtitle={t('ecosystem.subtitle')}
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={item.name}
              style={{ ['--glow' as string]: accents[i] }}
              className="rounded-2xl border border-white/10 bg-brand-950/50 p-6"
            >
              <div className="mb-4 h-1 w-10 rounded-full bg-[var(--glow)]" />
              <h3 className="font-display text-lg font-semibold text-white">{item.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-200/75">{item.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
