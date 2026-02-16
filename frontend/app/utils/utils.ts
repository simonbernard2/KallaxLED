// to apply CSS from a RGB interface
export const rgbToCSS = (rgb: [number, number, number]): string => `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`

export const isTurnedOff = (rgb: [number, number, number]): boolean => rgb.every(v => v === 0)
