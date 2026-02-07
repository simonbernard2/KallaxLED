export interface Color {
  rgb: [number, number, number]
}

export interface LED {
  id: number
  rgb: [number, number, number]
}

export interface Box {
  id?: number
  x: number
  y: number
  leds: number[]
}

export interface Grid {
  id?: number
  name: string
  width: number
  height: number
  boxes: Box[][]
}

export interface Book {
  id?: number
  title: string
  author: string
  isbn?: string | null
  tags: string[]
  box?: {
    id: number
    x: number
    y: number
  } | null
}

export interface BookCreatePayload {
  title: string
  author: string
  isbn?: string | null
  tags: string[]
  box_id?: number | null
}

export interface BookUpdatePayload {
  title?: string
  author?: string
  isbn?: string | null
  tags?: string[]
  box_id?: number | null
}

export interface BookImportResult {
  created: number
  skipped: number
  errors: string[]
}

export interface BoxProps {
  box: Box
  i: number
  j: number
}

export const createBoxes = (width: number, height: number): Box[][] => {
  const boxes: Box[][] = []
  for (let y = 0; y < height; y += 1) {
    const row: Box[] = []
    for (let x = 0; x < width; x += 1) {
      row.push({ x, y, leds: [] })
    }
    boxes.push(row)
  }
  return boxes
}

export const addLEDtoBox = (grid: Grid, ledId: number, i: number, j: number): Box[][] => {
  const newGrid = structuredClone(grid)
  const current = newGrid.boxes[i][j].leds
  if (current.includes(ledId)) {
    newGrid.boxes[i][j].leds = current.filter((id) => id !== ledId)
    return newGrid.boxes
  }
  newGrid.boxes[i][j].leds.push(ledId)
  return newGrid.boxes
}
