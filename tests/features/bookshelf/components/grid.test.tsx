import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Grid from "~/features/bookshelf/components/grid";

describe("Grid", () => {
  it("renders the expected number of boxes and applies grid columns", () => {
    const { container } = render(
      <Grid
        width={2}
        boxes={[
          { id: 1, rgb: { red: 0, green: 0, blue: 0 } },
          { id: 2, rgb: { red: 255, green: 255, blue: 255 } },
        ]}
      />,
    );

    const grid = container.firstElementChild as HTMLElement;
    const boxes = grid.querySelectorAll("div");

    expect(grid.style.gridTemplateColumns).toBe("repeat(2, minmax(0, 1fr))");
    expect(boxes.length).toBe(2);
  });
});
