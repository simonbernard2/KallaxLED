import { describe, expect, it } from "vitest";
import bookshelfReducer, {
  updateGridDimensions,
} from "~/features/bookshelf/slices/bookshelfSlice";

describe("bookshelfSlice", () => {
  it("returns the initial state when no action is dispatched", () => {
    const state = bookshelfReducer(undefined, { type: "unknown" });

    expect(state.width).toBe(3);
    expect(state.height).toBe(3);
    expect(state.boxes).toHaveLength(9);
    expect(state.boxes[0]).toEqual({ id: 0, rgb: { red: 0, green: 0, blue: 0 } });
  });

  it("creates incrementing box identifiers", () => {
    const state = bookshelfReducer(undefined, { type: "unknown" });
    const ids = state.boxes.map((box) => box.id);

    expect(ids).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("resizes the grid and trims boxes when dimensions shrink", () => {
    const initialState = bookshelfReducer(undefined, { type: "unknown" });
    const updated = bookshelfReducer(
      initialState,
      updateGridDimensions({ width: 2, height: 2 }),
    );

    expect(updated.width).toBe(2);
    expect(updated.height).toBe(2);
    expect(updated.boxes).toHaveLength(4);
    expect(updated.boxes.map((box) => box.id)).toEqual([0, 1, 2, 3]);
  });

  it("extends the grid and appends new boxes with default colors", () => {
    const initialState = bookshelfReducer(undefined, { type: "unknown" });
    const updated = bookshelfReducer(
      initialState,
      updateGridDimensions({ width: 4, height: 3 }),
    );

    expect(updated.width).toBe(4);
    expect(updated.height).toBe(3);
    expect(updated.boxes).toHaveLength(12);
    expect(updated.boxes[11]).toEqual({ id: 11, rgb: { red: 0, green: 0, blue: 0 } });
  });
});
