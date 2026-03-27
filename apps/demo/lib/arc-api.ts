const ARC_API_BASE = process.env.ARC_API_URL ?? "https://three.arcprize.org/api";
const ARC_API_KEY = process.env.ARC_API_KEY ?? "";

export async function proxyArcAction(
  action: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const url = `${ARC_API_BASE}/cmd/${action}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": ARC_API_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`ARC API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
