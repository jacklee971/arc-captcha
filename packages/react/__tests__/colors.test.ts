import { describe, it, expect } from "vitest";
import { ARC_COLORS, colorToHex } from "../src/colors";

describe("ARC_COLORS", () => {
  it("has exactly 16 colors", () => {
    expect(ARC_COLORS).toHaveLength(16);
  });

  it("maps index 0 to white (#FFFFFF)", () => {
    expect(ARC_COLORS[0]).toBe("#FFFFFF");
  });

  it("maps index 5 to black (#000000)", () => {
    expect(ARC_COLORS[5]).toBe("#000000");
  });

  it("maps index 8 to red (#F93C31)", () => {
    expect(ARC_COLORS[8]).toBe("#F93C31");
  });
});

describe("colorToHex", () => {
  it("returns hex string for valid index", () => {
    expect(colorToHex(9)).toBe("#1E93FF");
  });

  it("returns fallback for out-of-range index", () => {
    expect(colorToHex(99)).toBe("#FF00FF");
  });
});
