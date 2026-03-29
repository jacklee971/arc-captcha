import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

interface ActionLogPayload {
  timestamp: number;
  actionType: string;
  actionId: number;
  key?: string;
  coordinates?: [number, number];
  frameHash: string;
  timeSinceLastAction: number;
  level: number;
}

interface SessionPayload {
  sessionId: string;
  environmentId: string;
  actionCount: number;
  levelReached: number;
  isHuman: boolean;
  confidence: number;
  classifierVersion?: string;
  features?: Record<string, number>;
  actionLog: ActionLogPayload[];
  userAgent?: string;
  source?: string;
}

function validatePayload(body: unknown): SessionPayload | null {
  if (typeof body !== "object" || body === null) return null;

  const b = body as Record<string, unknown>;
  if (typeof b.sessionId !== "string") return null;
  if (typeof b.environmentId !== "string") return null;
  if (typeof b.actionCount !== "number") return null;
  if (typeof b.levelReached !== "number") return null;
  if (typeof b.isHuman !== "boolean") return null;
  if (typeof b.confidence !== "number") return null;
  if (!Array.isArray(b.actionLog)) return null;
  if (b.actionLog.length > 500) return null;

  return b as unknown as SessionPayload;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const payload = validatePayload(body);

  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Invalid session payload" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();

  // If Supabase is not configured, return success with a note
  if (!supabase) {
    return NextResponse.json({
      success: true,
      data: {
        sessionId: payload.sessionId,
        stored: false,
        message: "Supabase not configured — session data not persisted",
      },
    });
  }

  try {
    // 1. Insert session
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        id: payload.sessionId,
        environment_id: payload.environmentId,
        ended_at: new Date().toISOString(),
        total_actions: payload.actionCount,
        levels_completed: payload.levelReached,
        classification: payload.isHuman ? "human" : "bot",
        confidence: payload.confidence,
        user_agent: payload.userAgent ?? request.headers.get("user-agent"),
        source: payload.source ?? "web",
      })
      .select("id")
      .single();

    if (sessionError) {
      throw new Error(`Session insert failed: ${sessionError.message}`);
    }

    const sessionId = sessionData.id;

    // 2. Insert action logs in batch
    if (payload.actionLog.length > 0) {
      const actionRows = payload.actionLog.map((log, index) => ({
        session_id: sessionId,
        seq: index + 1,
        timestamp_ms: log.timestamp,
        action_type: log.actionType,
        key_value: log.key ?? null,
        coord_x: log.coordinates?.[0] ?? null,
        coord_y: log.coordinates?.[1] ?? null,
        frame_hash: log.frameHash,
        time_since_last_ms: log.timeSinceLastAction,
        level: log.level,
      }));

      const { error: logsError } = await supabase
        .from("action_logs")
        .insert(actionRows);

      if (logsError) {
        throw new Error(`Action logs insert failed: ${logsError.message}`);
      }
    }

    // 3. Insert classification
    const { error: classError } = await supabase
      .from("classifications")
      .insert({
        session_id: sessionId,
        classifier_version: payload.classifierVersion ?? "rule-v1",
        is_human: payload.isHuman,
        confidence: payload.confidence,
        features: payload.features ?? null,
      });

    if (classError) {
      throw new Error(`Classification insert failed: ${classError.message}`);
    }

    return NextResponse.json({
      success: true,
      data: { sessionId, stored: true },
    });
  } catch (err) {
    console.error("Session storage failed:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
