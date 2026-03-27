/** ARC-AGI-3 game action IDs matching the official API */
export enum GameAction {
  RESET = 0,
  ACTION1 = 1,
  ACTION2 = 2,
  ACTION3 = 3,
  ACTION4 = 4,
  ACTION5 = 5,
  ACTION6 = 6,
  ACTION7 = 7,
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
  apiEndpoint: string;
  environmentId: string;
  onVerify: (result: VerifyResult) => void;
  onAction?: (action: ActionLog) => void;
  maxActions?: number;
  theme?: "light" | "dark";
  size?: number;
}
