export interface RGBType {
  red: number
  green: number
  blue: number
}

export interface ColorSwatchType {
  id: number
  name: string
  rgb: RGBType
  ledRgb?: RGBType
}
