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
