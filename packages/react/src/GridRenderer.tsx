import { useRef, useEffect, useCallback } from "react";
import type { Frame } from "./types";
import { colorToHex } from "./colors";

interface GridRendererProps {
  frame: Frame;
  size: number;
  onCellClick: (x: number, y: number) => void;
}

export function GridRenderer({ frame, size, onCellClick }: GridRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellSize = size / 64;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const colorIndex = frame[y]?.[x] ?? 0;
        ctx.fillStyle = colorToHex(colorIndex);
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }, [frame, cellSize]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const pixelX = e.clientX - rect.left;
      const pixelY = e.clientY - rect.top;
      const cellX = Math.floor((pixelX / rect.width) * 64);
      const cellY = Math.floor((pixelY / rect.height) * 64);
      const clampedX = Math.max(0, Math.min(63, cellX));
      const clampedY = Math.max(0, Math.min(63, cellY));
      onCellClick(clampedX, clampedY);
    },
    [onCellClick]
  );

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onClick={handleClick}
      style={{ imageRendering: "pixelated", cursor: "crosshair" }}
    />
  );
}
