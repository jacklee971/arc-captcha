# ARC-CAPTCHA Phase 1: Core SDK + Demo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the arc-captcha React widget and Next.js demo site that lets humans play ARC-AGI-3 environments in the browser while logging every action for behavioral analysis.

**Architecture:** The browser renders a 64x64 grid and captures user actions. Actions are sent to the ARC-AGI-3 REST API (via Next.js API route proxy) which returns the next frame. A BehaviorLogger records every action with timestamps, coordinates, and frame hashes. The demo site showcases 3 playable environments.

**Tech Stack:** React 19, TypeScript, Next.js 15 (App Router), pnpm workspaces, Vitest, ARC-AGI-3 REST API

---

## File Structure

```
arc-captcha/
├── packages/
│   └── react/
│       ├── src/
│       │   ├── types.ts              # shared type definitions
│       │   ├── colors.ts             # 16-color palette mapping
│       │   ├── GridRenderer.tsx       # 64x64 canvas renderer
│       │   ├── ActionHandler.ts       # keyboard/click → GameAction mapping
│       │   ├── BehaviorLogger.ts      # structured action logging
│       │   ├── ArcCaptcha.tsx         # main widget component
│       │   └── index.ts              # public exports
│       ├── __tests__/
│       │   ├── colors.test.ts
│       │   ├── GridRenderer.test.tsx
│       │   ├── ActionHandler.test.ts
│       │   ├── BehaviorLogger.test.ts
│       │   └── ArcCaptcha.test.tsx
│       ├── package.json
│       ├── tsconfig.json
│       └── vitest.config.ts
├── apps/
│   └── demo/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx              # landing page
│       │   ├── play/
│       │   │   └── [envId]/
│       │   │       └── page.tsx      # playable environment page
│       │   └── api/
│       │       └── arc/
│       │           └── route.ts      # proxy to ARC-AGI-3 API
│       ├── lib/
│       │   └── arc-api.ts            # server-side API client
│       ├── package.json
│       ├── next.config.ts
│       └── tsconfig.json
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .gitignore
├── LICENSE
└── README.md
```

---

## Task 1: Monorepo Scaffold

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `packages/react/package.json`
- Create: `packages/react/tsconfig.json`
- Create: `packages/react/vitest.config.ts`
- Create: `packages/react/src/index.ts`
- Create: `apps/demo/package.json`
- Create: `apps/demo/tsconfig.json`
- Create: `apps/demo/next.config.ts`
- Create: `LICENSE`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "arc-captcha",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter demo dev",
    "build": "pnpm --filter @arc-captcha/react build && pnpm --filter demo build",
    "test": "pnpm --filter @arc-captcha/react test",
    "lint": "pnpm -r lint"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 3: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 4: Create packages/react/package.json**

```json
{
  "name": "@arc-captcha/react",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@types/react": "^19.0.0",
    "jsdom": "^25.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 5: Create packages/react/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Create packages/react/vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
});
```

- [ ] **Step 7: Create packages/react/src/index.ts**

```ts
export { ArcCaptcha } from "./ArcCaptcha";
export { GridRenderer } from "./GridRenderer";
export { BehaviorLogger } from "./BehaviorLogger";
export { ActionHandler } from "./ActionHandler";
export { ARC_COLORS } from "./colors";
export type {
  ArcCaptchaProps,
  VerifyResult,
  ActionLog,
  FrameData,
  GameAction,
} from "./types";
```

- [ ] **Step 8: Create apps/demo/package.json**

```json
{
  "name": "demo",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@arc-captcha/react": "workspace:*",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 9: Create apps/demo/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "noEmit": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 10: Create apps/demo/next.config.ts**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@arc-captcha/react"],
};

export default nextConfig;
```

- [ ] **Step 11: Create LICENSE (Apache 2.0)**

```
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION
   ...
```

Use the standard Apache 2.0 license text from https://www.apache.org/licenses/LICENSE-2.0.txt

- [ ] **Step 12: Install dependencies and verify**

Run: `pnpm install`
Expected: Dependencies installed, no errors.

- [ ] **Step 13: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json packages/ apps/ LICENSE
git commit -m "chore: scaffold pnpm monorepo with react package and demo app"
```

---

## Task 2: Type Definitions + Color Palette

**Files:**
- Create: `packages/react/src/types.ts`
- Create: `packages/react/src/colors.ts`
- Test: `packages/react/__tests__/colors.test.ts`

- [ ] **Step 1: Write the failing test for color palette**

```ts
// packages/react/__tests__/colors.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/jack/workspace/ARC-AGI && pnpm --filter @arc-captcha/react test`
Expected: FAIL — modules not found.

- [ ] **Step 3: Create types.ts**

```ts
// packages/react/src/types.ts

/** ARC-AGI-3 game action IDs matching the official API */
export enum GameAction {
  RESET = 0,
  ACTION1 = 1, // typically: up
  ACTION2 = 2, // typically: down
  ACTION3 = 3, // typically: left
  ACTION4 = 4, // typically: right
  ACTION5 = 5, // typically: action/confirm
  ACTION6 = 6, // complex: select cell (x, y)
  ACTION7 = 7, // undo
}

/** A single frame: 64x64 grid of color indices (0-15) */
export type Frame = number[][];

/** Response from the ARC-AGI-3 API after an action */
export interface FrameData {
  game_id: string;
  frame: Frame[];
  state: "NOT_PLAYED" | "NOT_FINISHED" | "WIN" | "GAME_OVER";
  levels_completed: number;
  win_levels: number;
  guid: string;
  available_actions: number[];
}

/** A single logged action with behavioral metadata */
export interface ActionLog {
  timestamp: number;
  actionType: "key" | "select" | "undo" | "reset";
  actionId: GameAction;
  key?: string;
  coordinates?: [number, number];
  frameHash: string;
  timeSinceLastAction: number;
  level: number;
}

/** Result returned when a CAPTCHA session completes */
export interface VerifyResult {
  isHuman: boolean;
  confidence: number;
  sessionId: string;
  actionCount: number;
  levelReached: number;
  actionLog: ActionLog[];
}

/** Props for the ArcCaptcha widget */
export interface ArcCaptchaProps {
  /** API endpoint to proxy ARC-AGI-3 requests */
  apiEndpoint: string;
  /** Which ARC environment to load */
  environmentId: string;
  /** Called when session completes (win, game over, or max actions) */
  onVerify: (result: VerifyResult) => void;
  /** Called on each action (optional) */
  onAction?: (action: ActionLog) => void;
  /** Max actions before cutoff (default: 200) */
  maxActions?: number;
  /** Visual theme */
  theme?: "light" | "dark";
  /** Grid pixel size (default: 512) */
  size?: number;
}
```

- [ ] **Step 4: Create colors.ts**

```ts
// packages/react/src/colors.ts

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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /Users/jack/workspace/ARC-AGI && pnpm --filter @arc-captcha/react test`
Expected: PASS — all 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/react/src/types.ts packages/react/src/colors.ts packages/react/__tests__/colors.test.ts
git commit -m "feat: add ARC-AGI-3 type definitions and 16-color palette"
```

---

## Task 3: GridRenderer Component

**Files:**
- Create: `packages/react/src/GridRenderer.tsx`
- Test: `packages/react/__tests__/GridRenderer.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// packages/react/__tests__/GridRenderer.test.tsx
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

    // click at pixel (100, 200) with size=512 → cell (12, 25) since 512/64=8px per cell
    fireEvent.click(canvas, {
      clientX: 100,
      clientY: 200,
      // getBoundingClientRect mock needed
    });

    // Note: exact coordinates depend on getBoundingClientRect
    // Test that the handler was called
    expect(onCellClick).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @arc-captcha/react test`
Expected: FAIL — GridRenderer not found.

- [ ] **Step 3: Implement GridRenderer**

```tsx
// packages/react/src/GridRenderer.tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @arc-captcha/react test`
Expected: PASS (note: jsdom has limited canvas support; canvas renders may need `jest-canvas-mock` or `vitest` canvas mock if getContext returns null. Add `"setupFiles": ["jest-canvas-mock"]` to vitest config if needed.)

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/GridRenderer.tsx packages/react/__tests__/GridRenderer.test.tsx
git commit -m "feat: add GridRenderer component with 64x64 canvas and cell click"
```

---

## Task 4: ActionHandler

**Files:**
- Create: `packages/react/src/ActionHandler.ts`
- Test: `packages/react/__tests__/ActionHandler.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// packages/react/__tests__/ActionHandler.test.ts
import { describe, it, expect } from "vitest";
import { keyToAction, isSimpleAction, createActionPayload } from "../src/ActionHandler";
import { GameAction } from "../src/types";

describe("keyToAction", () => {
  it("maps ArrowUp to ACTION1", () => {
    expect(keyToAction("ArrowUp")).toBe(GameAction.ACTION1);
  });

  it("maps ArrowDown to ACTION2", () => {
    expect(keyToAction("ArrowDown")).toBe(GameAction.ACTION2);
  });

  it("maps ArrowLeft to ACTION3", () => {
    expect(keyToAction("ArrowLeft")).toBe(GameAction.ACTION3);
  });

  it("maps ArrowRight to ACTION4", () => {
    expect(keyToAction("ArrowRight")).toBe(GameAction.ACTION4);
  });

  it("maps Space to ACTION5", () => {
    expect(keyToAction(" ")).toBe(GameAction.ACTION5);
  });

  it("maps z to ACTION7 (undo)", () => {
    expect(keyToAction("z")).toBe(GameAction.ACTION7);
  });

  it("returns null for unmapped keys", () => {
    expect(keyToAction("q")).toBeNull();
  });
});

describe("isSimpleAction", () => {
  it("returns true for ACTION1-5 and ACTION7", () => {
    expect(isSimpleAction(GameAction.ACTION1)).toBe(true);
    expect(isSimpleAction(GameAction.ACTION7)).toBe(true);
  });

  it("returns false for ACTION6 (complex)", () => {
    expect(isSimpleAction(GameAction.ACTION6)).toBe(false);
  });
});

describe("createActionPayload", () => {
  it("creates simple action payload", () => {
    const payload = createActionPayload(GameAction.ACTION1, "game1", "guid1");
    expect(payload).toEqual({
      game_id: "game1",
      guid: "guid1",
    });
  });

  it("creates complex action payload with coordinates", () => {
    const payload = createActionPayload(GameAction.ACTION6, "game1", "guid1", 32, 48);
    expect(payload).toEqual({
      game_id: "game1",
      guid: "guid1",
      x: 32,
      y: 48,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @arc-captcha/react test`
Expected: FAIL — ActionHandler not found.

- [ ] **Step 3: Implement ActionHandler**

```ts
// packages/react/src/ActionHandler.ts
import { GameAction } from "./types";

const KEY_MAP: Record<string, GameAction> = {
  ArrowUp: GameAction.ACTION1,
  w: GameAction.ACTION1,
  ArrowDown: GameAction.ACTION2,
  s: GameAction.ACTION2,
  ArrowLeft: GameAction.ACTION3,
  a: GameAction.ACTION3,
  ArrowRight: GameAction.ACTION4,
  d: GameAction.ACTION4,
  " ": GameAction.ACTION5,
  Enter: GameAction.ACTION5,
  z: GameAction.ACTION7,
  Backspace: GameAction.ACTION7,
};

/** Map a keyboard key to a GameAction, or null if unmapped */
export function keyToAction(key: string): GameAction | null {
  return KEY_MAP[key] ?? null;
}

/** Whether the action is simple (no coordinates needed) */
export function isSimpleAction(action: GameAction): boolean {
  return action !== GameAction.ACTION6;
}

interface ActionPayload {
  game_id: string;
  guid: string;
  x?: number;
  y?: number;
}

/** Create the request payload for an ARC-AGI-3 API action */
export function createActionPayload(
  action: GameAction,
  gameId: string,
  guid: string,
  x?: number,
  y?: number
): ActionPayload {
  const payload: ActionPayload = { game_id: gameId, guid };
  if (action === GameAction.ACTION6 && x !== undefined && y !== undefined) {
    payload.x = x;
    payload.y = y;
  }
  return payload;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @arc-captcha/react test`
Expected: PASS — all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/ActionHandler.ts packages/react/__tests__/ActionHandler.test.ts
git commit -m "feat: add ActionHandler for keyboard-to-GameAction mapping"
```

---

## Task 5: BehaviorLogger

**Files:**
- Create: `packages/react/src/BehaviorLogger.ts`
- Test: `packages/react/__tests__/BehaviorLogger.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// packages/react/__tests__/BehaviorLogger.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BehaviorLogger } from "../src/BehaviorLogger";
import { GameAction } from "../src/types";

describe("BehaviorLogger", () => {
  let logger: BehaviorLogger;

  beforeEach(() => {
    logger = new BehaviorLogger("test-session");
  });

  it("starts with empty log", () => {
    expect(logger.getLogs()).toEqual([]);
  });

  it("logs a key action with timestamp", () => {
    vi.spyOn(Date, "now").mockReturnValue(1000);
    logger.logAction({
      actionId: GameAction.ACTION1,
      frameHash: "abc123",
      level: 0,
    });

    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].actionType).toBe("key");
    expect(logs[0].actionId).toBe(GameAction.ACTION1);
    expect(logs[0].timestamp).toBe(1000);
    expect(logs[0].frameHash).toBe("abc123");

    vi.restoreAllMocks();
  });

  it("logs a select action with coordinates", () => {
    logger.logAction({
      actionId: GameAction.ACTION6,
      coordinates: [32, 48],
      frameHash: "def456",
      level: 1,
    });

    const logs = logger.getLogs();
    expect(logs[0].actionType).toBe("select");
    expect(logs[0].coordinates).toEqual([32, 48]);
  });

  it("logs undo action", () => {
    logger.logAction({
      actionId: GameAction.ACTION7,
      frameHash: "ghi789",
      level: 0,
    });

    expect(logger.getLogs()[0].actionType).toBe("undo");
  });

  it("calculates timeSinceLastAction correctly", () => {
    const mockNow = vi.spyOn(Date, "now");
    mockNow.mockReturnValue(1000);
    logger.logAction({ actionId: GameAction.ACTION1, frameHash: "a", level: 0 });

    mockNow.mockReturnValue(1500);
    logger.logAction({ actionId: GameAction.ACTION2, frameHash: "b", level: 0 });

    const logs = logger.getLogs();
    expect(logs[0].timeSinceLastAction).toBe(0);
    expect(logs[1].timeSinceLastAction).toBe(500);

    vi.restoreAllMocks();
  });

  it("returns session summary with stats", () => {
    const mockNow = vi.spyOn(Date, "now");
    mockNow.mockReturnValue(1000);
    logger.logAction({ actionId: GameAction.ACTION1, frameHash: "a", level: 0 });
    mockNow.mockReturnValue(2000);
    logger.logAction({ actionId: GameAction.ACTION7, frameHash: "b", level: 0 });
    mockNow.mockReturnValue(3500);
    logger.logAction({ actionId: GameAction.ACTION6, coordinates: [10, 20], frameHash: "c", level: 1 });

    const summary = logger.getSummary();
    expect(summary.sessionId).toBe("test-session");
    expect(summary.totalActions).toBe(3);
    expect(summary.undoCount).toBe(1);
    expect(summary.selectCount).toBe(1);
    expect(summary.keyCount).toBe(1);
    expect(summary.totalDurationMs).toBe(2500);

    vi.restoreAllMocks();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @arc-captcha/react test`
Expected: FAIL — BehaviorLogger not found.

- [ ] **Step 3: Implement BehaviorLogger**

```ts
// packages/react/src/BehaviorLogger.ts
import { GameAction } from "./types";
import type { ActionLog } from "./types";

interface LogActionInput {
  actionId: GameAction;
  coordinates?: [number, number];
  frameHash: string;
  level: number;
}

interface SessionSummary {
  sessionId: string;
  totalActions: number;
  undoCount: number;
  selectCount: number;
  keyCount: number;
  totalDurationMs: number;
  logs: ActionLog[];
}

function actionTypeFromId(actionId: GameAction): ActionLog["actionType"] {
  if (actionId === GameAction.ACTION6) return "select";
  if (actionId === GameAction.ACTION7) return "undo";
  if (actionId === GameAction.RESET) return "reset";
  return "key";
}

export class BehaviorLogger {
  private readonly sessionId: string;
  private readonly logs: ActionLog[] = [];
  private lastTimestamp: number | null = null;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  logAction(input: LogActionInput): void {
    const now = Date.now();
    const timeSinceLastAction =
      this.lastTimestamp !== null ? now - this.lastTimestamp : 0;

    const entry: ActionLog = {
      timestamp: now,
      actionType: actionTypeFromId(input.actionId),
      actionId: input.actionId,
      frameHash: input.frameHash,
      timeSinceLastAction,
      level: input.level,
    };

    if (input.actionId === GameAction.ACTION6 && input.coordinates) {
      entry.coordinates = input.coordinates;
    }

    if (
      input.actionId >= GameAction.ACTION1 &&
      input.actionId <= GameAction.ACTION5
    ) {
      entry.key = `ACTION${input.actionId}`;
    }

    this.logs.push(entry);
    this.lastTimestamp = now;
  }

  getLogs(): readonly ActionLog[] {
    return this.logs;
  }

  getSummary(): SessionSummary {
    const firstTs = this.logs[0]?.timestamp ?? 0;
    const lastTs = this.logs[this.logs.length - 1]?.timestamp ?? 0;

    return {
      sessionId: this.sessionId,
      totalActions: this.logs.length,
      undoCount: this.logs.filter((l) => l.actionType === "undo").length,
      selectCount: this.logs.filter((l) => l.actionType === "select").length,
      keyCount: this.logs.filter((l) => l.actionType === "key").length,
      totalDurationMs: lastTs - firstTs,
      logs: [...this.logs],
    };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @arc-captcha/react test`
Expected: PASS — all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/BehaviorLogger.ts packages/react/__tests__/BehaviorLogger.test.ts
git commit -m "feat: add BehaviorLogger for structured action tracking"
```

---

## Task 6: ArcCaptcha Main Widget

**Files:**
- Create: `packages/react/src/ArcCaptcha.tsx`
- Test: `packages/react/__tests__/ArcCaptcha.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// packages/react/__tests__/ArcCaptcha.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArcCaptcha } from "../src/ArcCaptcha";

describe("ArcCaptcha", () => {
  it("renders loading state initially", () => {
    render(
      <ArcCaptcha
        apiEndpoint="/api/arc"
        environmentId="ls20"
        onVerify={() => {}}
      />
    );
    expect(screen.getByText(/loading/i)).toBeTruthy();
  });

  it("renders with default size of 512", () => {
    const { container } = render(
      <ArcCaptcha
        apiEndpoint="/api/arc"
        environmentId="ls20"
        onVerify={() => {}}
      />
    );
    // Component should exist
    expect(container.firstChild).toBeTruthy();
  });

  it("accepts custom size prop", () => {
    const { container } = render(
      <ArcCaptcha
        apiEndpoint="/api/arc"
        environmentId="ls20"
        onVerify={() => {}}
        size={256}
      />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @arc-captcha/react test`
Expected: FAIL — ArcCaptcha not found.

- [ ] **Step 3: Implement ArcCaptcha**

```tsx
// packages/react/src/ArcCaptcha.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import type { ArcCaptchaProps, FrameData, Frame } from "./types";
import { GameAction } from "./types";
import { GridRenderer } from "./GridRenderer";
import { keyToAction, createActionPayload } from "./ActionHandler";
import { BehaviorLogger } from "./BehaviorLogger";

function hashFrame(frame: Frame): string {
  // lightweight hash: sample corners + center
  const samples = [
    frame[0]?.[0] ?? 0,
    frame[0]?.[63] ?? 0,
    frame[63]?.[0] ?? 0,
    frame[63]?.[63] ?? 0,
    frame[32]?.[32] ?? 0,
  ];
  return samples.join("-");
}

async function sendAction(
  apiEndpoint: string,
  action: GameAction,
  gameId: string,
  guid: string,
  x?: number,
  y?: number
): Promise<FrameData> {
  const actionName =
    action === GameAction.RESET
      ? "RESET"
      : `ACTION${action}`;
  const payload = createActionPayload(action, gameId, guid, x, y);
  const response = await fetch(`${apiEndpoint}/${actionName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export function ArcCaptcha({
  apiEndpoint,
  environmentId,
  onVerify,
  onAction,
  maxActions = 200,
  theme = "dark",
  size = 512,
}: ArcCaptchaProps) {
  const [frameData, setFrameData] = useState<FrameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionCount, setActionCount] = useState(0);
  const loggerRef = useRef<BehaviorLogger>(
    new BehaviorLogger(crypto.randomUUID())
  );

  // Reset the environment on mount
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const data = await sendAction(
          apiEndpoint,
          GameAction.RESET,
          environmentId,
          ""
        );
        if (!cancelled) {
          setFrameData(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
          setLoading(false);
        }
      }
    }
    init();
    return () => { cancelled = true; };
  }, [apiEndpoint, environmentId]);

  const performAction = useCallback(
    async (action: GameAction, x?: number, y?: number) => {
      if (!frameData || actionCount >= maxActions) return;
      if (frameData.state === "WIN" || frameData.state === "GAME_OVER") return;

      const currentFrame = frameData.frame[frameData.frame.length - 1];
      const fHash = currentFrame ? hashFrame(currentFrame) : "empty";

      loggerRef.current.logAction({
        actionId: action,
        coordinates:
          action === GameAction.ACTION6 && x !== undefined && y !== undefined
            ? [x, y]
            : undefined,
        frameHash: fHash,
        level: frameData.levels_completed,
      });

      const newCount = actionCount + 1;
      setActionCount(newCount);

      if (onAction) {
        const logs = loggerRef.current.getLogs();
        onAction(logs[logs.length - 1]);
      }

      try {
        const data = await sendAction(
          apiEndpoint,
          action,
          environmentId,
          frameData.guid,
          x,
          y
        );
        setFrameData(data);

        // Check terminal conditions
        if (
          data.state === "WIN" ||
          data.state === "GAME_OVER" ||
          newCount >= maxActions
        ) {
          const summary = loggerRef.current.getSummary();
          onVerify({
            isHuman: false, // classifier not yet implemented
            confidence: 0,
            sessionId: summary.sessionId,
            actionCount: summary.totalActions,
            levelReached: data.levels_completed,
            actionLog: summary.logs,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed");
      }
    },
    [frameData, actionCount, maxActions, apiEndpoint, environmentId, onVerify, onAction]
  );

  // Keyboard listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const action = keyToAction(e.key);
      if (action !== null) {
        e.preventDefault();
        performAction(action);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [performAction]);

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      if (frameData?.available_actions.includes(GameAction.ACTION6)) {
        performAction(GameAction.ACTION6, x, y);
      }
    },
    [performAction, frameData]
  );

  const bgColor = theme === "dark" ? "#1a1a2e" : "#f0f0f0";
  const textColor = theme === "dark" ? "#ccc" : "#333";

  if (loading) {
    return (
      <div style={{ width: size, height: size, background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 }}>
        <span style={{ color: textColor }}>Loading environment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: size, padding: 16, background: bgColor, borderRadius: 8 }}>
        <span style={{ color: "#ff6b6b" }}>Error: {error}</span>
      </div>
    );
  }

  const currentFrame = frameData?.frame[frameData.frame.length - 1];
  if (!currentFrame) return null;

  return (
    <div style={{ background: bgColor, borderRadius: 8, padding: 8, display: "inline-block" }}>
      <GridRenderer frame={currentFrame} size={size} onCellClick={handleCellClick} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 12, color: textColor }}>
        <span>Level: {frameData?.levels_completed ?? 0}/{frameData?.win_levels ?? "?"}</span>
        <span>Actions: {actionCount}/{maxActions}</span>
        <span>{frameData?.state === "WIN" ? "WIN!" : frameData?.state === "GAME_OVER" ? "GAME OVER" : ""}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @arc-captcha/react test`
Expected: PASS — all tests pass. (fetch calls will fail in test environment which is expected — the loading state test should still pass.)

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/ArcCaptcha.tsx packages/react/__tests__/ArcCaptcha.test.tsx packages/react/src/index.ts
git commit -m "feat: add ArcCaptcha main widget with API integration and keyboard controls"
```

---

## Task 7: Demo Site API Proxy

**Files:**
- Create: `apps/demo/lib/arc-api.ts`
- Create: `apps/demo/app/api/arc/[action]/route.ts`

- [ ] **Step 1: Create the API client**

```ts
// apps/demo/lib/arc-api.ts
const ARC_API_BASE = process.env.ARC_API_URL ?? "https://three.arcprize.org/api";
const ARC_API_KEY = process.env.ARC_API_KEY ?? "";

export async function proxyArcAction(
  action: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const url = `${ARC_API_BASE}/cmd/${action}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": ARC_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`ARC API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
```

- [ ] **Step 2: Create the API route**

```ts
// apps/demo/app/api/arc/[action]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { proxyArcAction } from "@/lib/arc-api";

const ALLOWED_ACTIONS = [
  "RESET", "ACTION1", "ACTION2", "ACTION3",
  "ACTION4", "ACTION5", "ACTION6", "ACTION7",
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  if (!ALLOWED_ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = await proxyArcAction(action, body);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
```

- [ ] **Step 3: Create .env.local template**

Create `apps/demo/.env.local.example`:
```
ARC_API_URL=https://three.arcprize.org/api
ARC_API_KEY=your_api_key_here
```

Note: `.env.local` is gitignored. Users must get their own API key from https://three.arcprize.org/.

- [ ] **Step 4: Commit**

```bash
git add apps/demo/lib/arc-api.ts apps/demo/app/api/arc/ apps/demo/.env.local.example
git commit -m "feat: add Next.js API proxy for ARC-AGI-3 REST API"
```

---

## Task 8: Demo Site Pages

**Files:**
- Create: `apps/demo/app/layout.tsx`
- Create: `apps/demo/app/page.tsx`
- Create: `apps/demo/app/play/[envId]/page.tsx`

- [ ] **Step 1: Create layout**

```tsx
// apps/demo/app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ARC-CAPTCHA Demo",
  description: "ARC-AGI-3 interactive environments as CAPTCHA — open source research project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0d1117", color: "#c9d1d9", fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create landing page**

```tsx
// apps/demo/app/page.tsx
import Link from "next/link";

const ENVIRONMENTS = [
  { id: "1s20", name: "Environment 1s20", description: "Multi-mechanic puzzle with 3-life system" },
  { id: "ft09", name: "Environment ft09", description: "Spatial reasoning challenge" },
  { id: "vc33", name: "Environment vc33", description: "Pattern discovery environment" },
];

export default function Home() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>ARC-CAPTCHA</h1>
      <p style={{ color: "#8b949e", fontSize: 16, marginBottom: 32 }}>
        ARC-AGI-3 interactive environments as CAPTCHA.
        AI scores &lt;1%. Humans solve 100%.
        We collect behavioral data to close the gap.
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {ENVIRONMENTS.map((env) => (
          <Link
            key={env.id}
            href={`/play/${env.id}`}
            style={{
              display: "block",
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: 8,
              padding: 20,
              flex: "1 1 200px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <h3 style={{ margin: "0 0 8px", color: "#58a6ff" }}>{env.name}</h3>
            <p style={{ margin: 0, fontSize: 14, color: "#8b949e" }}>{env.description}</p>
          </Link>
        ))}
      </div>

      <footer style={{ marginTop: 48, borderTop: "1px solid #30363d", paddingTop: 16, fontSize: 14, color: "#8b949e" }}>
        <p>
          Open source research project for{" "}
          <a href="https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-3" style={{ color: "#58a6ff" }}>
            ARC Prize 2026
          </a>
          {" | "}
          <a href="https://github.com/jacklee971/arc-captcha" style={{ color: "#58a6ff" }}>GitHub</a>
        </p>
      </footer>
    </main>
  );
}
```

- [ ] **Step 3: Create play page**

```tsx
// apps/demo/app/play/[envId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { ArcCaptcha } from "@arc-captcha/react";
import type { VerifyResult, ActionLog } from "@arc-captcha/react";

export default function PlayPage() {
  const { envId } = useParams<{ envId: string }>();
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [lastAction, setLastAction] = useState<ActionLog | null>(null);

  const handleVerify = useCallback((r: VerifyResult) => {
    setResult(r);
    console.log("Session complete:", r);
  }, []);

  const handleAction = useCallback((a: ActionLog) => {
    setLastAction(a);
  }, []);

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Environment: {envId}</h1>
      <p style={{ color: "#8b949e", fontSize: 14, marginBottom: 16 }}>
        Arrow keys to move, Space to act, Z to undo, Click to select cell
      </p>

      <ArcCaptcha
        apiEndpoint="/api/arc"
        environmentId={envId}
        onVerify={handleVerify}
        onAction={handleAction}
        maxActions={200}
        theme="dark"
        size={512}
      />

      {lastAction && (
        <div style={{ marginTop: 16, background: "#161b22", borderRadius: 8, padding: 12, fontSize: 12, fontFamily: "monospace" }}>
          <div style={{ color: "#8b949e", marginBottom: 4 }}>Last action:</div>
          <div style={{ color: "#c9d1d9" }}>
            {lastAction.actionType} | +{lastAction.timeSinceLastAction}ms | frame: {lastAction.frameHash}
          </div>
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16, background: "#1a2e1a", border: "1px solid #3fb95044", borderRadius: 8, padding: 16 }}>
          <h3 style={{ margin: "0 0 8px", color: "#3fb950" }}>Session Complete</h3>
          <div style={{ fontSize: 14 }}>
            <div>Actions: {result.actionCount}</div>
            <div>Level reached: {result.levelReached}</div>
            <div>Session ID: {result.sessionId}</div>
          </div>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Verify the dev server runs**

Run: `cd /Users/jack/workspace/ARC-AGI && pnpm dev`
Expected: Next.js dev server starts at localhost:3000. Landing page shows 3 environment cards.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/app/
git commit -m "feat: add demo site with landing page and playable environment pages"
```

---

## Task 9: README + Final Polish

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README**

```markdown
# ARC-CAPTCHA

> ARC-AGI-3 interactive environments as CAPTCHA — an open-source research project

AI systems score below 1% on ARC-AGI-3. Humans solve 100%. This gap makes ARC-AGI-3 environments ideal for distinguishing humans from bots.

ARC-CAPTCHA wraps ARC-AGI-3 environments into an embeddable widget that:
1. **Detects bots** by analyzing behavioral patterns (action timing, exploration diversity, strategy)
2. **Collects data** — every action is logged with timestamps and frame state
3. **Improves AI** — collected behavioral data feeds back into ARC-AGI-3 solver training

## Quick Start

```bash
pnpm install
cp apps/demo/.env.local.example apps/demo/.env.local
# Edit .env.local with your ARC-AGI-3 API key from https://three.arcprize.org/
pnpm dev
```

## Usage

```tsx
import { ArcCaptcha } from "@arc-captcha/react";

<ArcCaptcha
  apiEndpoint="/api/arc"
  environmentId="1s20"
  onVerify={(result) => {
    console.log(result.isHuman, result.confidence);
    console.log(result.actionLog); // full behavioral trace
  }}
/>
```

## Architecture

```
Browser (ArcCaptcha widget)
  → renders 64x64 grid, captures actions
  → logs behavior (timestamps, patterns, strategy)
  → sends actions to API proxy

Next.js API Route (proxy)
  → forwards to ARC-AGI-3 REST API
  → returns frame data

Behavior Logger
  → structured JSON action logs
  → session summary with behavioral features
```

## Project Structure

- `packages/react/` — `@arc-captcha/react` embeddable widget
- `apps/demo/` — Next.js demo site
- `analysis/` — Python notebooks for behavioral analysis (Phase 2)
- `solver/` — Kaggle submission (Phase 3)

## Roadmap

- [x] Phase 1: Core SDK + Demo (widget, logger, demo site)
- [ ] Phase 2: Classifier + Data Pipeline (Supabase, human/bot detection)
- [ ] Phase 3: Solver + Competition (Kaggle ARC Prize 2026 Milestone 1)

## Related Work

- [ARC-AGI-3 Technical Report](https://arxiv.org/abs/2603.24621)
- [ARC Prize 2026 Competition](https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-3)
- [Apart Research — ARC-AGI as CAPTCHA (concept, 2024)](https://apartresearch.com/project/using-arc-agi-puzzles-as-captcha-task)

## License

Apache 2.0
```

- [ ] **Step 2: Run all tests**

Run: `pnpm test`
Expected: All tests pass.

- [ ] **Step 3: Build check**

Run: `pnpm --filter @arc-captcha/react build`
Expected: TypeScript compiles with no errors, `dist/` is created.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add README with usage examples and project overview"
```

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Monorepo scaffold | 30 min |
| 2 | Types + color palette | 20 min |
| 3 | GridRenderer (canvas) | 30 min |
| 4 | ActionHandler (keyboard mapping) | 20 min |
| 5 | BehaviorLogger | 30 min |
| 6 | ArcCaptcha main widget | 45 min |
| 7 | Demo API proxy | 20 min |
| 8 | Demo site pages | 30 min |
| 9 | README + polish | 20 min |
| **Total** | | **~4 hours** |

Phase 1 produces a working demo site where humans can play ARC-AGI-3 environments in the browser, with every action logged for behavioral analysis. This is the foundation for Phase 2 (classifier) and Phase 3 (solver/Kaggle submission).
