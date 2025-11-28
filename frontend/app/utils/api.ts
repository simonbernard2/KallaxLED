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

export const addLEDtoBox = (led: LED, box: Box): Box => {
  if (box.leds.some((l) => l.id === led.id)) {
    return box
  }

  const newBox = { ...box }
  newBox.leds.push(led)
  return newBox
}

export const setBoxLEDsRGB = (box: Box, color: Color): Box => {
  box.leds.forEach((_, index) => {
    box.leds[index].rgb = color.rgb
  })
  return box
}
