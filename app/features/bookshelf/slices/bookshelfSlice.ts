import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RGB, GridType } from "../types/bookshelfTypes";

const DefaultGridWidth = 3
const DefaultGridHeight = 3
const DefaultRGBValue: RGB = {
  red: 0,
  green: 0,
  blue: 0
}
const createBoxes = (number: number) =>
  Array.from({ length: number }, (_, idx) => ({
    id: idx,
    rgb: DefaultRGBValue
  }))

const initialState = {
  width: DefaultGridWidth,
  height: DefaultGridHeight,
  boxes: createBoxes(DefaultGridWidth * DefaultGridHeight)
}

export const bookshelfSlice = createSlice({
  name: "bookshelf",
  initialState,
  reducers: {
    updateGridDimensions: (state: GridType, action: PayloadAction<{ width: number, height: number }>) => {
      state.width = action.payload.width;
      state.height = action.payload.height;
      const boxCount = action.payload.width * action.payload.height
      const resizedBoxes = state.boxes.slice(0, boxCount);
      if (resizedBoxes.length < boxCount) {
        for (let idx = resizedBoxes.length; idx < boxCount; idx++) {
          resizedBoxes.push({ id: idx, rgb: { ...DefaultRGBValue } })
        }
      }
      state.boxes = resizedBoxes;
    }
  },
})

export const { updateGridDimensions } = bookshelfSlice.actions;
export default bookshelfSlice.reducer;
