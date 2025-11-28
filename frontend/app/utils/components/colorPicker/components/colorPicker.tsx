import { useState } from "react"
import { colors } from "../colorSwatches"
import ColorSwatch from "./colorSwatch"
import type { ColorSwatchType } from "../types/colorPickerTypes";

interface Props {
  onClick: (selected: ColorSwatchType) => void
}
const ColorPicker = (props: Props) => {
  const [selected, setSelected] = useState<ColorSwatchType>({
    "id": 18,
    "rgb": {
      "red": 0,
      "green": 0,
      "blue": 0
    },
    "name": "off"
  })
  const handleSelect = (swatch: ColorSwatchType) => {
    if (!swatch) { return }
    setSelected(swatch)
    props.onClick(swatch)
  }

  const isSelected = (id: number) => (id === selected?.id)
  return (
    <div className="grid grid-cols-6 gap-2 bg-slate-500 p-6 rounded-lg">
      {colors.map((swatch) => {
        const { id, name, rgb } = swatch
        return (
          <ColorSwatch
            key={id}
            id={id}
            rgb={rgb}
            name={name}
            onClick={handleSelect}
            selected={isSelected(id)}
          />
        )
      })}
    </div>
  )
}

export default ColorPicker;
