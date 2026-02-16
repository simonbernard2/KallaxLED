import type { ColorSwatchType } from '../types/colorPickerTypes'

type ColorSwatchProps = ColorSwatchType & {
  selected: boolean
  onClick?: (swatch: ColorSwatchType) => void
}

const ColorSwatch = (props: ColorSwatchProps) => {
  const { selected, onClick, ...swatch } = props
  const styleRGB = () => `rgb(${swatch.rgb.red},${swatch.rgb.green},${swatch.rgb.blue})`
  const handleSelect = () => {
    if (!onClick) return
    onClick(swatch)
  }

  return (
    <button
      type="button"
      key={swatch.id}
      onClick={handleSelect}
      style={{ backgroundColor: styleRGB() }}
      className={`h-8 w-8 rounded-full cursor-pointer hover:scale-125 hover:shadow-md transition  ${selected ? 'ring-3' : ''} `}
      aria-label={swatch.name}
    />
  )
}

export default ColorSwatch
