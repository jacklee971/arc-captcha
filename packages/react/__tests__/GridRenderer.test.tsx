import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { GridRenderer } from "../src/GridRenderer";

function makeFrame(fill: number): number[][] {
  return Array.from({ length: 64 }, () => Array.from({ length: 64 }, () => fill));
}

describe("GridRenderer", () => {
  it("renders a canvas element", () => {
    const { container } = render(
      <GridRenderer frame={makeFrame(0)} size={512} onCellClick={() => {}} />
    );
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
  });

  it("sets canvas dimensions based on size prop", () => {
    const { container } = render(
      <GridRenderer frame={makeFrame(0)} size={256} onCellClick={() => {}} />
    );
    const canvas = container.querySelector("canvas")!;
    expect(canvas.width).toBe(256);
    expect(canvas.height).toBe(256);
  });

  it("calls onCellClick with grid coordinates on click", () => {
    const onCellClick = vi.fn();
    const { container } = render(
      <GridRenderer frame={makeFrame(0)} size={512} onCellClick={onCellClick} />
    );
    const canvas = container.querySelector("canvas")!;
    fireEvent.click(canvas);
    expect(onCellClick).toHaveBeenCalled();
  });
});
