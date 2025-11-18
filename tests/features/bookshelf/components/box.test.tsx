import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Box from "~/features/bookshelf/components/box";

describe("Box", () => {
  it("renders a box with the supplied background color", () => {
    const { container } = render(
      <Box id={1} rgb={{ red: 10, green: 20, blue: 30 }} />,
    );

    const box = container.firstElementChild as HTMLElement;
    expect(box).toHaveStyle({ backgroundColor: "rgb(10,20,30)" });
  });

  it("renders an off state with dashed border and label when all channels are zero", () => {
    const { container } = render(<Box id={2} rgb={{ red: 0, green: 0, blue: 0 }} />);

    const box = container.firstElementChild as HTMLElement;
    expect(box).toHaveTextContent("OFF");
    expect(box).toHaveClass("border-dashed");
    expect(box.style.backgroundColor).toBe("transparent");
  });
});
