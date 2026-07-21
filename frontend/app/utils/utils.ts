import { useEffect, useMemo, useRef } from 'react'

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

/**
 * Trailing-edge debounce that always calls the latest callback.
 *
 * Used to push color-picker changes to the strip while dragging without flooding the Pi with a
 * request per pixel of travel.
 */
export const useDebouncedCallback = <A extends unknown[]>(callback: (...args: A) => void, delayMs = 120) => {
  const latest = useRef(callback)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    latest.current = callback
  })

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  return useMemo(
    () =>
      (...args: A) => {
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => latest.current(...args), delayMs)
      },
    [delayMs]
  )
}
