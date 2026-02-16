import type { ChangeEvent } from "react"

interface Props {
  name: string
  label: string
  type: "number" | "text"
  min?: number
  max?: number
  value: number | string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}
const Input = (props: Props) => {
  const { name, label, type, min, max, value, onChange } = props
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="font-semibold">{label}:</label>
      <input
        id={name}
        className="bg-neutral-300 dark:bg-neutral-700 focus:outline-neutral-500 px-2 py-1 rounded"
        type={type}
        value={value}
        min={min}
        max={max}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e)}
      />

    </div>
  )
}

export default Input
