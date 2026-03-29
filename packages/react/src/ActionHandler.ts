import { GameAction } from "./types";

/** Mapping table from keyboard keys to GameAction */
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

/** Convert a keyboard key to the corresponding GameAction, returns null for unmapped keys */
export function keyToAction(key: string): GameAction | null {
  return KEY_MAP[key] ?? null;
}

/** Returns whether the action is simple (ACTION6 is a complex action requiring coordinates) */
export function isSimpleAction(action: GameAction): boolean {
  return action !== GameAction.ACTION6;
}

interface ActionPayload {
  game_id: string;
  guid: string;
  x?: number;
  y?: number;
}

/** Create an action payload for API requests (ACTION6 includes coordinates) */
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
