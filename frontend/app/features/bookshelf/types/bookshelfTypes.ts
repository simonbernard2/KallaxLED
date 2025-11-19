export interface RGB {
  red: number
  green: number
  blue: number
}

export interface BoxType {
  id: number
  rgb: RGB
}

export interface GridType {
  width: number
  height: number
  boxes: BoxType[]
}
