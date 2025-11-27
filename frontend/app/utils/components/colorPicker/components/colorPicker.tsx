import { useState } from "react"
import { colors } from "../colorSwatches"
import ColorSwatch from "./colorSwatch"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "~/store";
import { updateSelection } from "../slices/colorPickerSlice"
import type { ColorSwatchType } from "../types/colorPickerTypes";

const ColorPicker = () => {
  const state = useSelector((state: RootState) => state.colorpicker)
  const dispatch = useDispatch();
  const [selected, setSelected] = useState<ColorSwatchType | undefined>(state.selectedColor)
  const handleSelect = (swatch: ColorSwatchType) => {
    if (swatch.id === selected?.id) {
      dispatch(updateSelection({ selectedColor: undefined }))
      setSelected(undefined)
    } else {
      dispatch(updateSelection({ selectedColor: swatch }))
      setSelected(swatch)
    }
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
