/** Official ARC-AGI-3 16-color palette (index 0-15) */
export const ARC_COLORS: readonly string[] = [
  "#FFFFFF", // 0: white
  "#CCCCCC", // 1: light gray
  "#999999", // 2: medium gray
  "#666666", // 3: dark gray
  "#333333", // 4: darker gray
  "#000000", // 5: black
  "#E53AA3", // 6: magenta
  "#FF7BCC", // 7: pink
  "#F93C31", // 8: red
  "#1E93FF", // 9: blue
  "#88D8F1", // 10: light blue
  "#FFDC00", // 11: yellow
  "#FF851B", // 12: orange
  "#921231", // 13: maroon
  "#4FCC30", // 14: green
  "#A356D6", // 15: purple
] as const;

const FALLBACK_COLOR = "#FF00FF";

/** Convert a color index (0-15) to a hex string */
export function colorToHex(index: number): string {
  return ARC_COLORS[index] ?? FALLBACK_COLOR;
}
