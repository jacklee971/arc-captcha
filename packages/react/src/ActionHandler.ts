import { GameAction } from "./types";

/** 키보드 키를 GameAction으로 매핑하는 테이블 */
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

/** 키보드 키를 해당 GameAction으로 변환하며, 매핑되지 않은 키는 null 반환 */
export function keyToAction(key: string): GameAction | null {
  return KEY_MAP[key] ?? null;
}

/** 단순 액션 여부 반환 (ACTION6은 좌표가 필요한 복잡한 액션) */
export function isSimpleAction(action: GameAction): boolean {
  return action !== GameAction.ACTION6;
}

interface ActionPayload {
  game_id: string;
  guid: string;
  x?: number;
  y?: number;
}

/** API 요청에 사용할 액션 페이로드 생성 (ACTION6은 좌표 포함) */
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
