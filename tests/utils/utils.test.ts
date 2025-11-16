import { describe, expect, it } from "vitest";
import { rgbToCSS } from "~/utils/utils";

describe("rgbToCSS", () => {
  it("converts RGB object to CSS string", () => {
    expect(rgbToCSS({ red: 0, green: 128, blue: 255 })).toBe(
      "rgb(0,128,255)",
    );
  });

  it("handles edge channel values", () => {
    expect(rgbToCSS({ red: 255, green: 255, blue: 255 })).toBe(
      "rgb(255,255,255)",
    );
    expect(rgbToCSS({ red: 0, green: 0, blue: 0 })).toBe("rgb(0,0,0)");
  });
});
