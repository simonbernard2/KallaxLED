export interface Color {
  rgb: [number, number, number]
}
export interface LED extends Color {
  id: number
}

export interface Box {
  leds: LED[]
}

export interface Grid {
  id?: string
  name: string
  boxes: Box[][]
}

export const createBoxes = (rows: number, cols: number): Box[][] => {
  const rowWithBoxes = Array.from({ length: rows }, () => ({
    leds: [],
  }))

  const boxes = Array.from({ length: cols }, () => [...rowWithBoxes])
  return boxes
}

