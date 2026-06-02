interface BoxCoordinates {
  x: number
  y: number
}

export const formatBoxLabel = ({ x, y }: BoxCoordinates) => `Column ${x + 1}, Row ${y + 1}`
