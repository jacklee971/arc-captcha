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

    if (input.actionId >= GameAction.ACTION1 && input.actionId <= GameAction.ACTION5) {
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
