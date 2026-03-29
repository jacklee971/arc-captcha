"use client";

import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { ArcCaptcha } from "@arc-captcha/react";
import type { VerifyResult, ActionLog } from "@arc-captcha/react";

async function saveSession(
  environmentId: string,
  result: VerifyResult
): Promise<void> {
  try {
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: result.sessionId,
        environmentId,
        actionCount: result.actionCount,
        levelReached: result.levelReached,
        isHuman: result.isHuman,
        confidence: result.confidence,
        actionLog: result.actionLog,
        source: "web",
      }),
    });

    if (!response.ok) {
      const body = await response.json();
      console.error("Failed to save session:", body.error);
    }
  } catch (err) {
    console.error("Failed to save session:", err);
  }
}

export default function PlayPage() {
  const { envId } = useParams<{ envId: string }>();
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [lastAction, setLastAction] = useState<ActionLog | null>(null);

  const handleVerify = useCallback(
    (r: VerifyResult) => {
      setResult(r);
      saveSession(envId, r);
    },
    [envId]
  );

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
        <div
          style={{
            marginTop: 16,
            background: "#161b22",
            borderRadius: 8,
            padding: 12,
            fontSize: 12,
            fontFamily: "monospace",
          }}
        >
          <div style={{ color: "#8b949e", marginBottom: 4 }}>Last action:</div>
          <div style={{ color: "#c9d1d9" }}>
            {lastAction.actionType} | +{lastAction.timeSinceLastAction}ms |
            frame: {lastAction.frameHash}
          </div>
        </div>
      )}
      {result && (
        <div
          style={{
            marginTop: 16,
            background: result.isHuman ? "#1a2e1a" : "#2e1a1a",
            border: `1px solid ${result.isHuman ? "#3fb95044" : "#f8514944"}`,
            borderRadius: 8,
            padding: 16,
          }}
        >
          <h3
            style={{
              margin: "0 0 8px",
              color: result.isHuman ? "#3fb950" : "#f85149",
            }}
          >
            Session Complete — {result.isHuman ? "Human" : "Bot"} (
            {(result.confidence * 100).toFixed(0)}% confidence)
          </h3>
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
