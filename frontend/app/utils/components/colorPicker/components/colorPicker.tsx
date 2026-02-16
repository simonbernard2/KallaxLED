import { useState } from 'react'
import { colors } from '../colorSwatches'
import ColorSwatch from './colorSwatch'
import type { ColorSwatchType } from '../types/colorPickerTypes'

interface Props {
  onClick: (selected: ColorSwatchType) => void
}
const ColorPicker = (props: Props) => {
  const offSwatch = colors.find(swatch => swatch.name === 'off') ?? colors[0]
  const [selected, setSelected] = useState<ColorSwatchType>(offSwatch)
  const handleSelect = (swatch: ColorSwatchType) => {
    if (!swatch) {
      return
    }
    setSelected(swatch)
    props.onClick(swatch)
  }

  const isSelected = (id: number) => id === selected?.id
  return (
    <div className="grid grid-cols-6 gap-2 bg-neutral-600 p-6 rounded-lg shadow-xl">
      {colors.map(swatch => {
        const { id, name, rgb } = swatch
        return <ColorSwatch key={id} id={id} rgb={rgb} name={name} onClick={handleSelect} selected={isSelected(id)} />
      })}
    </div>
  )
}

export default ColorPicker
