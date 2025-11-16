import { createSlice } from "@reduxjs/toolkit";
import type { RGB } from "../types/bookshelfTypes";

const DefaultGridWidth = 3
const DefaultBoxCount = 9
const DefaultRGBValue: RGB = {
  red: 120,
  green: 120,
  blue: 120
}
const createBoxes = (number: number) =>
  Array.from({ length: number }, (_, idx) => ({
    id: idx,
    rgb: DefaultRGBValue
  }))
const initialState = {
  width: DefaultGridWidth,
  numberOfBoxes: DefaultBoxCount,
  boxes: createBoxes(DefaultBoxCount)
}

export const bookshelfSlice = createSlice({
  name: "bookshelf",
  initialState,
  reducers: {},
})

export default bookshelfSlice.reducer
