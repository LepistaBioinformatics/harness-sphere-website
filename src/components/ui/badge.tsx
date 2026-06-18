import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-medium uppercase tracking-wider',
  {
    variants: {
      tone: {
        critical: 'border-brand-400/50 bg-brand-400/15 text-brand-200',
        optional: 'border-white/15 bg-white/5 text-brand-200/80',
        signal: 'border-signal/40 bg-signal/10 text-signal-soft',
        science: 'border-science/40 bg-science/10 text-science',
        azure: 'border-azure/40 bg-azure/10 text-azure-soft',
        infra: 'border-infra/40 bg-infra/10 text-infra-soft',
        saas: 'border-saas/40 bg-saas/10 text-saas-soft',
      },
    },
    defaultVariants: { tone: 'optional' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
