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
