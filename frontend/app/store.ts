import { configureStore } from "@reduxjs/toolkit";
import bookshelfReducer from './features/bookshelf/slices/bookshelfSlice'
import colorPickerReducer from './features/colorPicker/slices/colorPickerSlice'

export const store = configureStore({
  reducer: {
    bookshelf: bookshelfReducer,
    colorpicker: colorPickerReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
