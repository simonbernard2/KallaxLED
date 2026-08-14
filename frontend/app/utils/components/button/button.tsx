import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'primary' | 'secondary' | 'ghost' | 'danger'
}

const toneClasses: Record<NonNullable<Props['tone']>, string> = {
  primary:
    'bg-[var(--accent-strong)] text-[var(--accent-ink)] shadow-[0_18px_40px_-24px_rgba(171,118,54,0.9)] hover:bg-[var(--accent)]',
  secondary:
    'bg-[var(--forest)] text-white shadow-[0_18px_40px_-24px_rgba(31,74,54,0.9)] hover:bg-[var(--forest-strong)]',
  ghost: 'bg-transparent text-[var(--ink-muted)] ring-1 ring-[var(--surface-border)] hover:bg-[var(--surface-hover)]',
  // Kept as a literal fill rather than --danger: this carries white text, and --danger lightens in
  // dark mode to stay readable as text on a panel.
  danger: 'bg-[#8f3a31] text-white hover:bg-[#a04539]',
}

const Button = ({ tone = 'primary', className = '', type = 'button', ...props }: Props) => (
  <button
    type={type}
    className={[
      'button-base',
      toneClasses[tone],
      props.disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer',
      className,
    ].join(' ')}
    {...props}
  />
)

export default Button
