import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ColorSwatchType } from "../types/colorPickerTypes";

interface SwatchState {
  selectedColor?: ColorSwatchType
}
const initialState: SwatchState = {}
const colorPickerSlice = createSlice({
  name: "colorPicker",
  initialState,
  reducers: {
    updateSelection: (state: SwatchState, action: PayloadAction<SwatchState>) => {
      state.selectedColor = action.payload.selectedColor
    }
  }
})

export const { updateSelection } = colorPickerSlice.actions;
export default colorPickerSlice.reducer

