import type { RGB } from "~/features/bookshelf/types/bookshelfTypes";

// to apply CSS from a RGB interface
export const rgbToCSS = (rgb: RGB): string => `rgb(${rgb.red},${rgb.green},${rgb.blue})`
