import { describe, it, expect } from "vitest";
import {
  classify,
  extractFeatures,
  computeIntervalVariance,
  computeExplorationDiversity,
  computeUndoRatio,
  computeTimeToFirstAction,
  computeActionEntropy,
  CLASSIFIER_VERSION,
} from "../src/Classifier";
import { GameAction } from "../src/types";
import type { ActionLog } from "../src/types";

// Helper: create an action log entry
function makeLog(overrides: Partial<ActionLog> = {}): ActionLog {
  return {
    timestamp: Date.now(),
    actionType: "key",
    actionId: GameAction.ACTION1,
    frameHash: "0-0-0-0-0",
    timeSinceLastAction: 500,
    level: 0,
    ...overrides,
  };
}

// Helper: create a sequence of logs simulating a bot (regular intervals)
function makeBotLogs(count: number): ActionLog[] {
  return Array.from({ length: count }, (_, i) =>
    makeLog({
      timestamp: 1000 + i * 100,
      timeSinceLastAction: i === 0 ? 0 : 100, // exactly 100ms intervals
      actionType: "key",
      actionId: GameAction.ACTION1,
      frameHash: "0-0-0-0-0", // always the same frame
    })
  );
}

// Helper: create a sequence of logs simulating a human (varied intervals, undos, diverse actions)
function makeHumanLogs(): ActionLog[] {
  return [
    makeLog({ timeSinceLastAction: 0, actionType: "key", actionId: GameAction.ACTION1, frameHash: "1-2-3-4-5" }),
    makeLog({ timeSinceLastAction: 1200, actionType: "key", actionId: GameAction.ACTION3, frameHash: "2-3-4-5-6" }),
    makeLog({ timeSinceLastAction: 300, actionType: "select", actionId: GameAction.ACTION6, coordinates: [10, 20], frameHash: "3-4-5-6-7" }),
    makeLog({ timeSinceLastAction: 2500, actionType: "undo", actionId: GameAction.ACTION7, frameHash: "2-3-4-5-6" }),
    makeLog({ timeSinceLastAction: 800, actionType: "key", actionId: GameAction.ACTION2, frameHash: "4-5-6-7-8" }),
    makeLog({ timeSinceLastAction: 150, actionType: "select", actionId: GameAction.ACTION6, coordinates: [30, 40], frameHash: "5-6-7-8-9" }),
    makeLog({ timeSinceLastAction: 3000, actionType: "key", actionId: GameAction.ACTION4, frameHash: "6-7-8-9-0" }),
    makeLog({ timeSinceLastAction: 400, actionType: "undo", actionId: GameAction.ACTION7, frameHash: "5-6-7-8-9" }),
    makeLog({ timeSinceLastAction: 1800, actionType: "reset", actionId: GameAction.RESET, frameHash: "0-0-0-0-0" }),
    makeLog({ timeSinceLastAction: 700, actionType: "key", actionId: GameAction.ACTION5, frameHash: "7-8-9-0-1" }),
  ];
}

describe("Classifier", () => {
  describe("computeIntervalVariance", () => {
    it("returns 0 for empty logs", () => {
      expect(computeIntervalVariance([])).toBe(0);
    });

    it("returns 0 for single log", () => {
      expect(computeIntervalVariance([makeLog()])).toBe(0);
    });

    it("returns low score for regular intervals (bot-like)", () => {
      const botLogs = makeBotLogs(20);
      const score = computeIntervalVariance(botLogs);
      expect(score).toBeLessThan(0.1);
    });

    it("returns high score for varied intervals (human-like)", () => {
      const humanLogs = makeHumanLogs();
      const score = computeIntervalVariance(humanLogs);
      expect(score).toBeGreaterThan(0.3);
    });
  });

  describe("computeExplorationDiversity", () => {
    it("returns 0 for empty logs", () => {
      expect(computeExplorationDiversity([])).toBe(0);
    });

    it("returns low score for repeated same frame (bot-like)", () => {
      const botLogs = makeBotLogs(20);
      const score = computeExplorationDiversity(botLogs);
      expect(score).toBeLessThan(0.2);
    });

    it("uses coordinate diversity when available", () => {
      const logs = [
        makeLog({ coordinates: [1, 1], actionType: "select" }),
        makeLog({ coordinates: [2, 2], actionType: "select" }),
        makeLog({ coordinates: [3, 3], actionType: "select" }),
      ];
      const score = computeExplorationDiversity(logs);
      expect(score).toBe(1); // 3 unique / 3 total
    });
  });

  describe("computeUndoRatio", () => {
    it("returns 0 for empty logs", () => {
      expect(computeUndoRatio([])).toBe(0);
    });

    it("returns 0 when no undos", () => {
      const logs = makeBotLogs(10);
      expect(computeUndoRatio(logs)).toBe(0);
    });

    it("returns positive score when undos present", () => {
      const humanLogs = makeHumanLogs();
      const score = computeUndoRatio(humanLogs);
      expect(score).toBeGreaterThan(0);
    });

    it("caps score for excessive undos", () => {
      const logs = Array.from({ length: 10 }, () =>
        makeLog({ actionType: "undo" })
      );
      const score = computeUndoRatio(logs);
      // 100% undo ratio (>50%) returns 0.3
      expect(score).toBe(0.3);
    });
  });

  describe("computeTimeToFirstAction", () => {
    it("returns 0 for empty logs", () => {
      expect(computeTimeToFirstAction([])).toBe(0);
    });

    it("returns 0 for instant first action (bot-like)", () => {
      const logs = [
        makeLog({ timeSinceLastAction: 0 }),
        makeLog({ timeSinceLastAction: 10 }),
      ];
      const score = computeTimeToFirstAction(logs);
      expect(score).toBeLessThan(0.1);
    });

    it("returns high score for deliberate first action (human-like)", () => {
      const logs = [
        makeLog({ timeSinceLastAction: 0 }),
        makeLog({ timeSinceLastAction: 1500 }),
      ];
      const score = computeTimeToFirstAction(logs);
      expect(score).toBe(1);
    });
  });

  describe("computeActionEntropy", () => {
    it("returns 0 for empty logs", () => {
      expect(computeActionEntropy([])).toBe(0);
    });

    it("returns 0 for single action type (bot-like)", () => {
      const botLogs = makeBotLogs(20);
      const score = computeActionEntropy(botLogs);
      expect(score).toBe(0);
    });

    it("returns high score for diverse action types (human-like)", () => {
      const humanLogs = makeHumanLogs();
      const score = computeActionEntropy(humanLogs);
      expect(score).toBeGreaterThan(0.5);
    });
  });

  describe("extractFeatures", () => {
    it("returns all feature fields", () => {
      const features = extractFeatures(makeHumanLogs());
      expect(features).toHaveProperty("actionIntervalVariance");
      expect(features).toHaveProperty("explorationDiversity");
      expect(features).toHaveProperty("undoRatio");
      expect(features).toHaveProperty("timeToFirstAction");
      expect(features).toHaveProperty("actionEntropy");
    });

    it("all features are between 0 and 1", () => {
      const features = extractFeatures(makeHumanLogs());
      for (const value of Object.values(features)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("classify", () => {
    it("returns bot classification for empty logs", () => {
      const result = classify([]);
      expect(result.isHuman).toBe(false);
      expect(result.confidence).toBe(1);
      expect(result.classifierVersion).toBe(CLASSIFIER_VERSION);
    });

    it("classifies bot-like behavior as bot", () => {
      const result = classify(makeBotLogs(30));
      expect(result.isHuman).toBe(false);
    });

    it("classifies human-like behavior as human", () => {
      const result = classify(makeHumanLogs());
      expect(result.isHuman).toBe(true);
    });

    it("returns confidence between 0 and 1", () => {
      const botResult = classify(makeBotLogs(20));
      expect(botResult.confidence).toBeGreaterThanOrEqual(0);
      expect(botResult.confidence).toBeLessThanOrEqual(1);

      const humanResult = classify(makeHumanLogs());
      expect(humanResult.confidence).toBeGreaterThanOrEqual(0);
      expect(humanResult.confidence).toBeLessThanOrEqual(1);
    });

    it("includes classifier version", () => {
      const result = classify(makeHumanLogs());
      expect(result.classifierVersion).toBe("rule-v1");
    });

    it("includes extracted features", () => {
      const result = classify(makeHumanLogs());
      expect(result.features).toBeDefined();
      expect(typeof result.features.actionIntervalVariance).toBe("number");
    });
  });
});
