/**
 * Decorative "observatory" sphere: concentric orbits (the layers) rotating at
 * different speeds, signal dots travelling them, a glowing core (the watcher).
 * Purely presentational — hidden from assistive tech.
 */
export function OrbitVisual() {
  const orbits = [
    { r: 56, dur: '38s', color: 'var(--color-brand-400)', dot: 'var(--color-brand-200)', reverse: false },
    { r: 92, dur: '26s', color: 'var(--color-azure)', dot: 'var(--color-azure-soft)', reverse: true },
    { r: 128, dur: '46s', color: 'var(--color-infra)', dot: 'var(--color-infra-soft)', reverse: false },
    { r: 164, dur: '60s', color: 'var(--color-science)', dot: 'var(--color-science)', reverse: true },
  ]

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden="true">
      {/* core glow */}
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/30 blur-3xl" />

      <svg viewBox="-200 -200 400 400" className="relative h-full w-full">
        <defs>
          <radialGradient id="core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="40%" stopColor="var(--color-brand-300)" />
            <stop offset="100%" stopColor="var(--color-brand-600)" />
          </radialGradient>
        </defs>

        {orbits.map((o) => (
          <g
            key={o.r}
            className={o.reverse ? '[animation:spin_var(--d)_linear_infinite_reverse]' : '[animation:spin_var(--d)_linear_infinite]'}
            style={{ ['--d' as string]: o.dur, transformOrigin: 'center' }}
          >
            <circle
              r={o.r}
              fill="none"
              stroke={o.color}
              strokeOpacity={0.35}
              strokeWidth={1}
            />
            <circle cx={o.r} cy={0} r={4.5} fill={o.dot}>
            </circle>
            <circle cx={o.r} cy={0} r={9} fill={o.dot} opacity={0.25} />
          </g>
        ))}

        {/* core */}
        <circle r={20} fill="url(#core)" />
        <circle r={20} fill="none" stroke="#fff" strokeOpacity={0.4} strokeWidth={0.75} />
      </svg>
    </div>
  )
}
