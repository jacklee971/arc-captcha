import type { ActionLog } from "./types";

export const CLASSIFIER_VERSION = "rule-v1";

/** Behavioral features extracted from action logs */
export interface ClassifierFeatures {
  actionIntervalVariance: number;
  explorationDiversity: number;
  undoRatio: number;
  timeToFirstAction: number;
  actionEntropy: number;
}

/** Classification result */
export interface ClassificationResult {
  isHuman: boolean;
  confidence: number;
  features: ClassifierFeatures;
  classifierVersion: string;
}

/** Weights for combining features into a human score (0-1) */
const WEIGHTS = {
  actionIntervalVariance: 0.25,
  explorationDiversity: 0.15,
  undoRatio: 0.15,
  timeToFirstAction: 0.2,
  actionEntropy: 0.25,
};

/**
 * Compute the variance of time intervals between actions.
 * Bots tend to have low variance (regular timing).
 * Returns a score 0-1 where higher = more human-like.
 */
export function computeIntervalVariance(logs: readonly ActionLog[]): number {
  if (logs.length < 2) return 0;

  const intervals = logs
    .slice(1)
    .map((log) => log.timeSinceLastAction)
    .filter((ms) => ms > 0);

  if (intervals.length === 0) return 0;

  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance =
    intervals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / intervals.length;

  // Normalize: variance > 10000 is very human-like
  // Using sigmoid-like mapping
  const normalized = 1 - 1 / (1 + variance / 5000);
  return Math.min(1, Math.max(0, normalized));
}

/**
 * Compute exploration diversity: unique cells interacted with / total actions.
 * Bots often interact with fewer unique cells.
 */
export function computeExplorationDiversity(
  logs: readonly ActionLog[]
): number {
  if (logs.length === 0) return 0;

  const uniqueCells = new Set<string>();
  for (const log of logs) {
    if (log.coordinates) {
      uniqueCells.add(`${log.coordinates[0]},${log.coordinates[1]}`);
    }
  }

  // If no coordinate actions, use frame hash diversity as proxy
  if (uniqueCells.size === 0) {
    const uniqueFrames = new Set(logs.map((l) => l.frameHash));
    return Math.min(1, uniqueFrames.size / Math.max(1, logs.length));
  }

  return Math.min(1, uniqueCells.size / logs.length);
}

/**
 * Compute undo ratio: undo actions / total actions.
 * Humans tend to undo more as they explore and correct.
 */
export function computeUndoRatio(logs: readonly ActionLog[]): number {
  if (logs.length === 0) return 0;

  const undoCount = logs.filter((l) => l.actionType === "undo").length;
  const ratio = undoCount / logs.length;

  // Normalize: 5-20% undo ratio is typical for humans
  // Score peaks around 10% and falls off
  if (ratio === 0) return 0;
  if (ratio > 0.5) return 0.3; // Too many undos is suspicious
  return Math.min(1, ratio / 0.1);
}

/**
 * Compute time to first action in milliseconds.
 * Humans typically observe the puzzle before acting (>500ms).
 * Bots start immediately.
 */
export function computeTimeToFirstAction(
  logs: readonly ActionLog[]
): number {
  if (logs.length === 0) return 0;

  const firstInterval = logs[0].timeSinceLastAction;

  // First action has timeSinceLastAction = 0 by design (no previous action).
  // Use the second action's interval as a proxy for deliberation time,
  // or the first if it has a nonzero value.
  const deliberationMs =
    firstInterval > 0 ? firstInterval : logs[1]?.timeSinceLastAction ?? 0;

  // Normalize: 200-3000ms is human range
  if (deliberationMs < 50) return 0; // Instant = bot
  if (deliberationMs > 10000) return 0.5; // Very slow might be AFK
  return Math.min(1, deliberationMs / 1500);
}

/**
 * Compute Shannon entropy of action type distribution.
 * Bots tend to use fewer action types (low entropy).
 * Humans use a varied mix of actions (higher entropy).
 */
export function computeActionEntropy(logs: readonly ActionLog[]): number {
  if (logs.length === 0) return 0;

  const counts: Record<string, number> = {};
  for (const log of logs) {
    counts[log.actionType] = (counts[log.actionType] ?? 0) + 1;
  }

  const total = logs.length;
  const types = Object.values(counts);

  // Shannon entropy
  let entropy = 0;
  for (const count of types) {
    const p = count / total;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  // Max entropy for 4 action types = log2(4) = 2
  const maxEntropy = Math.log2(4);
  return Math.min(1, entropy / maxEntropy);
}

/**
 * Extract all behavioral features from action logs.
 */
export function extractFeatures(logs: readonly ActionLog[]): ClassifierFeatures {
  return {
    actionIntervalVariance: computeIntervalVariance(logs),
    explorationDiversity: computeExplorationDiversity(logs),
    undoRatio: computeUndoRatio(logs),
    timeToFirstAction: computeTimeToFirstAction(logs),
    actionEntropy: computeActionEntropy(logs),
  };
}

/**
 * Rule-based human/bot classifier v1.
 * Combines behavioral features with weighted scoring.
 */
export function classify(logs: readonly ActionLog[]): ClassificationResult {
  if (logs.length === 0) {
    return {
      isHuman: false,
      confidence: 1,
      features: {
        actionIntervalVariance: 0,
        explorationDiversity: 0,
        undoRatio: 0,
        timeToFirstAction: 0,
        actionEntropy: 0,
      },
      classifierVersion: CLASSIFIER_VERSION,
    };
  }

  const features = extractFeatures(logs);

  const score =
    features.actionIntervalVariance * WEIGHTS.actionIntervalVariance +
    features.explorationDiversity * WEIGHTS.explorationDiversity +
    features.undoRatio * WEIGHTS.undoRatio +
    features.timeToFirstAction * WEIGHTS.timeToFirstAction +
    features.actionEntropy * WEIGHTS.actionEntropy;

  // Threshold: score > 0.4 = likely human
  const isHuman = score > 0.4;

  // Confidence: distance from threshold, scaled to 0-1
  const confidence = Math.min(1, Math.abs(score - 0.4) / 0.4);

  return {
    isHuman,
    confidence,
    features,
    classifierVersion: CLASSIFIER_VERSION,
  };
}
