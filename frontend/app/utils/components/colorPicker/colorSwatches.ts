import type { ColorSwatchType, RGBType } from "./types/colorPickerTypes"

// Tuned for WS2812-class LEDs so physical output tracks on-screen swatches more closely.
const LED_GAMMA = 1.85
const LED_CHANNEL_BALANCE = {
  red: 1.0,
  green: 0.74,
  blue: 0.8,
}

const clampChannel = (value: number): number => (Math.min(255, Math.max(0, Math.round(value))))

const calibrateChannel = (value: number, balance: number): number => {
  const normalized = clampChannel(value) / 255
  return clampChannel((normalized ** LED_GAMMA) * 255 * balance)
}

const calibrateLedRGB = (rgb: RGBType): RGBType => ({
  red: calibrateChannel(rgb.red, LED_CHANNEL_BALANCE.red),
  green: calibrateChannel(rgb.green, LED_CHANNEL_BALANCE.green),
  blue: calibrateChannel(rgb.blue, LED_CHANNEL_BALANCE.blue),
})

const swatch = (id: number, name: string, rgb: RGBType): ColorSwatchType => ({
  id,
  name,
  rgb,
  ledRgb: calibrateLedRGB(rgb),
})

export const colors: ColorSwatchType[] = [
  swatch(1, "red", { red: 244, green: 67, blue: 54 }),
  swatch(2, "rose", { red: 233, green: 30, blue: 99 }),
  swatch(3, "magenta", { red: 216, green: 27, blue: 96 }),
  swatch(4, "purple", { red: 156, green: 39, blue: 176 }),
  swatch(5, "indigo", { red: 92, green: 107, blue: 192 }),
  swatch(6, "blue", { red: 33, green: 150, blue: 243 }),
  swatch(7, "cyan", { red: 0, green: 188, blue: 212 }),
  swatch(8, "sky", { red: 79, green: 195, blue: 247 }),
  swatch(9, "teal", { red: 0, green: 150, blue: 136 }),
  swatch(10, "green", { red: 76, green: 175, blue: 80 }),
  swatch(11, "lightGreen", { red: 139, green: 195, blue: 74 }),
  swatch(12, "lime", { red: 205, green: 220, blue: 57 }),
  swatch(13, "yellow", { red: 255, green: 235, blue: 59 }),
  swatch(14, "amber", { red: 255, green: 193, blue: 7 }),
  swatch(15, "orange", { red: 255, green: 152, blue: 0 }),
  swatch(16, "warmWhite", { red: 255, green: 214, blue: 170 }),
  swatch(17, "white", { red: 255, green: 255, blue: 255 }),
  swatch(18, "off", { red: 0, green: 0, blue: 0 }),
]
