const ARC_API_BASE = process.env.ARC_API_URL ?? "http://127.0.0.1:8001/api";
const ARC_API_KEY = process.env.ARC_API_KEY ?? "";

let cardIdPromise: Promise<string> | null = null;

function getOrCreateCardId(): Promise<string> {
  if (!cardIdPromise) {
    cardIdPromise = (async () => {
      const response = await fetch(`${ARC_API_BASE}/scorecard/open`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": ARC_API_KEY,
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        throw new Error(`Failed to open scorecard: ${response.status}`);
      }
      const data = await response.json() as { card_id: string };
      if (!data.card_id) throw new Error("Scorecard response missing card_id");
      return data.card_id;
    })().catch((err) => {
      cardIdPromise = null;
      throw err;
    });
  }
  return cardIdPromise;
}

export async function proxyArcAction(
  action: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const cardId = await getOrCreateCardId();
  const url = `${ARC_API_BASE}/cmd/${action}`;
  const payload = { ...body, card_id: cardId };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": ARC_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ARC API error: ${response.status} ${errorText}`);
  }

  return response.json();
}
