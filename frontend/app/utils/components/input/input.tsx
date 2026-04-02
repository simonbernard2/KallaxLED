import type { ChangeEvent } from 'react'

interface Props {
  name: string
  label: string
  type?: 'number' | 'text' | 'search' | 'url'
  min?: number
  max?: number
  placeholder?: string
  value: number | string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

const Input = ({ name, label, type = 'text', min, max, placeholder, value, onChange }: Props) => {
  return (
    <label htmlFor={name} className="field">
      <span className="field-label">{label}</span>
      <input
        id={name}
        className="field-input"
        type={type}
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e)}
      />
    </label>
  )
}

export default Input
