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

export const addLEDtoBox = (grid: Grid, led: LED, i: number, j: number): Box[][] => {
  const newGrid = structuredClone(grid)
  if (newGrid.boxes[i][j].leds.some((l) => l.id === led.id)) {
    newGrid.boxes[i][j].leds = newGrid.boxes[i][j].leds.filter((l: LED) => l.id !== led.id)
    return newGrid.boxes
  }
  newGrid.boxes[i][j].leds.push(led)
  return newGrid.boxes
}

export const setBoxLEDsRGB = (box: Box, color: Color): Box => {
  box.leds.forEach((_, index) => {
    box.leds[index].rgb = color.rgb
  })
  return box
}
