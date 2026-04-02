export const rgbToCSS = (rgb: [number, number, number]): string => `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`

export const isTurnedOff = (rgb: [number, number, number]): boolean => rgb.every(v => v === 0)

export const hexToRgbTuple = (hex: string): [number, number, number] => {
  const sanitized = hex.replace('#', '')
  const value = sanitized.length === 3 ? sanitized.split('').map(char => `${char}${char}`).join('') : sanitized

  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ]
}

export const splitCommaList = (value: string) =>
  value
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)

export const joinCommaList = (values: string[] | undefined) => (values ?? []).join(', ')
