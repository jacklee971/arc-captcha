import { NextRequest, NextResponse } from "next/server";
import { proxyArcAction } from "@/lib/arc-api";

const ALLOWED_ACTIONS = [
  "RESET", "ACTION1", "ACTION2", "ACTION3",
  "ACTION4", "ACTION5", "ACTION6", "ACTION7",
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  if (!ALLOWED_ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const result = await proxyArcAction(action, body);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
