import type { ColorSwatchType } from './components/colorPicker/types/colorPickerTypes'

// to apply CSS from a RGB interface
export const rgbToCSS = (rgb: [number, number, number]): string => `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`

export const isTurnedOff = (rgb: [number, number, number]): boolean => rgb.every(v => v === 0)

export const toLedTuple = (value: ColorSwatchType): [number, number, number] => {
  const rgb = value.ledRgb ?? value.rgb
  return [rgb.red, rgb.green, rgb.blue]
}
