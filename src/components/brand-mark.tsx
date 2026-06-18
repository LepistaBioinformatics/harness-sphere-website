import { cn } from '../lib/cn'

/**
 * HarnessSphere mark — an orbital sphere: concentric rings (the layers) with a
 * bright core (the watcher) and signal dots travelling the outer orbit.
 * Placeholder wordmark until a final logo is provided.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn('h-8 w-8', className)}
    >
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
      <ellipse cx="24" cy="24" rx="21" ry="8" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" />
      <ellipse
        cx="24"
        cy="24"
        rx="8"
        ry="21"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.5"
      />
      <circle cx="24" cy="24" r="5" fill="currentColor" />
      <circle cx="45" cy="24" r="2.4" fill="currentColor" />
      <circle cx="24" cy="3" r="2" fill="currentColor" fillOpacity="0.7" />
    </svg>
  )
}

/** GitHub glyph — lucide v1 dropped brand icons, so we inline it. */
export function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cn('h-4 w-4', className)}>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.92 1.23 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.21.7.82.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-white',
        className,
      )}
    >
      <BrandMark className="h-7 w-7 text-brand-300" />
      HarnessSphere
    </span>
  )
}
