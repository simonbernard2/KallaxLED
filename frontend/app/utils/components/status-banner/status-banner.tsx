type Tone = 'info' | 'status' | 'error'

interface StatusBannerProps {
  /** Nothing renders when this is null/empty, so callers can pass state straight through. */
  message: string | null | undefined
  tone?: Tone
  className?: string
}

const toneClasses: Record<Tone, string> = {
  info: 'text-[var(--ink-muted)]',
  status: 'text-[var(--forest-ink)]',
  error: 'text-[var(--danger)] border-[var(--danger)]/25',
}

/**
 * The one place feedback is rendered.
 *
 * Every route used to inline its own `{status && <div className="panel …">}` pair, which meant four
 * near-identical blocks and no announcement to assistive tech. `aria-live="polite"` matters here:
 * these banners sit at the bottom of long pages, so a screen reader user otherwise gets no signal
 * that anything happened at all.
 */
const StatusBanner = ({ message, tone = 'status', className = '' }: StatusBannerProps) => {
  if (!message) return null

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`panel text-sm ${toneClasses[tone]} ${className}`.trim()}
    >
      {message}
    </div>
  )
}

export default StatusBanner
