import { describe, expect, it } from "vitest";
import bookshelfReducer from "~/features/bookshelf/slices/bookshelfSlice";

describe("bookshelfSlice", () => {
  it("returns the initial state when no action is dispatched", () => {
    const state = bookshelfReducer(undefined, { type: "unknown" });

    expect(state.width).toBe(3);
    expect(state.height).toBe(3);
    expect(state.boxes).toHaveLength(9);
    expect(state.boxes[0]).toEqual({
      id: 0,
      rgb: { red: 120, green: 120, blue: 120 },
    });
  });

  it("creates incrementing box identifiers", () => {
    const state = bookshelfReducer(undefined, { type: "unknown" });
    const ids = state.boxes.map((box) => box.id);

    expect(ids).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
