import type { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Eye, Globe, Network, Server, Sparkles, Wrench } from 'lucide-react'
import { Container } from '../ui/container'
import { SectionHeading } from '../ui/section-heading'
import { Badge } from '../ui/badge'

type Tone = 'critical' | 'optional'

interface LayerDef {
  id: string
  icon: ComponentType<{ className?: string }>
  glow: string
  tone: Tone
  star?: boolean
}

const LAYERS: LayerDef[] = [
  { id: 'host', icon: Server, glow: 'var(--color-brand-400)', tone: 'critical' },
  { id: 'self', icon: Eye, glow: 'var(--color-azure)', tone: 'critical' },
  { id: 'container', icon: Box, glow: 'var(--color-infra)', tone: 'optional' },
  { id: 'gateway', icon: Network, glow: 'var(--color-signal)', tone: 'optional' },
  { id: 'harness', icon: Sparkles, glow: 'var(--color-science)', tone: 'optional', star: true },
  { id: 'tools', icon: Wrench, glow: 'var(--color-saas)', tone: 'optional' },
  { id: 'api', icon: Globe, glow: 'var(--color-azure)', tone: 'optional' },
]

export function Layers() {
  const { t } = useTranslation()

  return (
    <section id="layers" className="scroll-mt-20 py-20">
      <Container>
        <SectionHeading
          eyebrow={t('layers.eyebrow')}
          title={t('layers.title')}
          subtitle={t('layers.subtitle')}
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LAYERS.map(({ id, icon: Icon, glow, tone, star }) => (
            <div
              key={id}
              style={{ ['--glow' as string]: glow }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-brand-950/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--glow)]/50 hover:shadow-[0_24px_60px_-30px_var(--glow)]"
            >
              {/* accent wash on hover */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[var(--glow)] opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-20" />

              <div className="mb-5 flex items-center justify-between">
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-brand-900/60 text-[var(--glow)]"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <Badge tone={tone === 'critical' ? 'critical' : 'optional'}>
                  {t(`layers.${tone}`)}
                </Badge>
              </div>

              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
                {t(`layers.items.${id}.name`)}
                {star && <span className="text-science" aria-hidden="true">★</span>}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-200/75">
                {t(`layers.items.${id}.desc`)}
              </p>
            </div>
          ))}

          {/* trailing "and counting" tile */}
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/10 p-6 text-center">
            <p className="font-mono text-sm text-brand-200/50">
              host · self · container · gateway · ai · tools · api
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
