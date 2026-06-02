import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'primary' | 'secondary' | 'ghost' | 'danger'
}

const toneClasses: Record<NonNullable<Props['tone']>, string> = {
  primary:
    'bg-[var(--accent-strong)] text-[var(--accent-ink)] shadow-[0_18px_40px_-24px_rgba(171,118,54,0.9)] hover:bg-[var(--accent)]',
  secondary:
    'bg-[var(--forest)] text-white shadow-[0_18px_40px_-24px_rgba(31,74,54,0.9)] hover:bg-[var(--forest-strong)]',
  ghost:
    'bg-transparent text-[var(--ink-muted)] ring-1 ring-black/10 hover:bg-black/5',
  danger: 'bg-[#7b332c] text-white hover:bg-[#612821]',
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
