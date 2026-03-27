import { useState, useEffect, useCallback, useRef } from "react";
import type { ArcCaptchaProps, FrameData, Frame } from "./types";
import { GameAction } from "./types";
import { GridRenderer } from "./GridRenderer";
import { keyToAction, createActionPayload } from "./ActionHandler";
import { BehaviorLogger } from "./BehaviorLogger";

/** Sample corner/center pixels from a frame to generate a quick hash */
function hashFrame(frame: Frame): string {
  const samples = [
    frame[0]?.[0] ?? 0,
    frame[0]?.[63] ?? 0,
    frame[63]?.[0] ?? 0,
    frame[63]?.[63] ?? 0,
    frame[32]?.[32] ?? 0,
  ];
  return samples.join("-");
}

/** Generate a UUID with a fallback for environments that don't support crypto.randomUUID */
function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

/** Send a game action to the API and return the updated frame data */
async function sendAction(
  apiEndpoint: string,
  action: GameAction,
  gameId: string,
  guid: string,
  x?: number,
  y?: number
): Promise<FrameData> {
  const actionName = action === GameAction.RESET ? "RESET" : `ACTION${action}`;
  const payload = createActionPayload(action, gameId, guid, x, y);
  const response = await fetch(`${apiEndpoint}/${actionName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json() as Promise<FrameData>;
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
  const loggerRef = useRef<BehaviorLogger>(new BehaviorLogger(generateSessionId()));

  // Initialize the game environment on mount
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const data = await sendAction(apiEndpoint, GameAction.RESET, environmentId, "");
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
    return () => {
      cancelled = true;
    };
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

        if (
          data.state === "WIN" ||
          data.state === "GAME_OVER" ||
          newCount >= maxActions
        ) {
          const summary = loggerRef.current.getSummary();
          onVerify({
            isHuman: false,
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

  // Keyboard controls
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
      <div
        style={{
          width: size,
          height: size,
          background: bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
        }}
      >
        <span style={{ color: textColor }}>Loading environment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ width: size, padding: 16, background: bgColor, borderRadius: 8 }}
      >
        <span style={{ color: "#ff6b6b" }}>Error: {error}</span>
      </div>
    );
  }

  const currentFrame = frameData?.frame[frameData.frame.length - 1];
  if (!currentFrame) return null;

  return (
    <div
      style={{
        background: bgColor,
        borderRadius: 8,
        padding: 8,
        display: "inline-block",
      }}
    >
      <GridRenderer frame={currentFrame} size={size} onCellClick={handleCellClick} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
          fontSize: 12,
          color: textColor,
        }}
      >
        <span>
          Level: {frameData?.levels_completed ?? 0}/{frameData?.win_levels ?? "?"}
        </span>
        <span>
          Actions: {actionCount}/{maxActions}
        </span>
        <span>
          {frameData?.state === "WIN"
            ? "WIN!"
            : frameData?.state === "GAME_OVER"
              ? "GAME OVER"
              : ""}
        </span>
      </div>
    </div>
  );
}
