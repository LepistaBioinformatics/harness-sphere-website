import { cn } from '../../lib/cn'

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-brand-950/50 p-6 backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  )
}
