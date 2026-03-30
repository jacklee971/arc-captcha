# ARC-CAPTCHA

> ARC-AGI-3 interactive environments as CAPTCHA — an open-source research project

AI systems score below 1% on ARC-AGI-3. Humans solve 100%. This gap makes ARC-AGI-3 environments ideal for distinguishing humans from bots.

ARC-CAPTCHA wraps ARC-AGI-3 environments into an embeddable widget that:
1. **Detects bots** by analyzing behavioral patterns (action timing, exploration diversity, strategy)
2. **Collects strategy traces** — not answers, but *how* users play: timing, exploration sequences, undo patterns, strategy shifts
3. **Studies rule induction** — the collected behavioral data helps research how humans discover rules in novel environments

## What We Collect (and What We Don't)

This project does **not** collect puzzle solutions or train on solved environments. ARC-AGI-3 relies on novelty — memorizing answers would defeat the benchmark.

What we collect are **behavioral strategy traces**: the timing between actions, which areas users explore first, how they change strategies after failure, undo patterns, and exploration diversity. This data reveals *how* humans perform rule induction in real time, not *what* the correct answer is.

This distinction matters. The classifier determines human vs. bot based on play behavior, not correctness. A human who fails to solve a puzzle still generates valuable strategy data.

## Integrate into Your App

### 1. Install

```bash
npm install arc-captcha-react
```

### 2. Set Up the API Proxy

The widget needs a backend to run ARC-AGI-3 game environments. Two options:

**Option A: Self-hosted (recommended for development)**

```bash
# Get an API key from https://three.arcprize.org/
pip install arc-agi

ARC_API_KEY=your_key python3 -c "
import arc_agi
arc = arc_agi.Arcade()
arc.listen_and_serve(host='0.0.0.0', port=8001)
"
```

Then create a proxy route in your backend (Next.js example):

```ts
// app/api/arc/[action]/route.ts
import { NextRequest, NextResponse } from "next/server";

const ARC_API = process.env.ARC_API_URL ?? "http://127.0.0.1:8001/api";

let cardIdPromise: Promise<string> | null = null;

function getCardId(): Promise<string> {
  if (!cardIdPromise) {
    cardIdPromise = (async () => {
      const res = await fetch(`${ARC_API}/scorecard/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = (await res.json()) as { card_id: string };
      if (!data.card_id) throw new Error("Missing card_id");
      return data.card_id;
    })().catch((err) => {
      cardIdPromise = null;
      throw err;
    });
  }
  return cardIdPromise;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  const body = await req.json();
  const card = await getCardId();
  const res = await fetch(`${ARC_API}/cmd/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, card_id: card }),
  });
  return NextResponse.json(await res.json());
}
```

**Option B: Docker (for deployment)**

```bash
docker build -t arc-captcha-server ./server
docker run -p 8001:8001 -e ARC_API_KEY=your_key arc-captcha-server
```

Deploy to Railway, Fly.io, or any container platform. See `server/` directory.

### 3. Add the Widget

```tsx
import { ArcCaptcha } from "arc-captcha-react";
import type { VerifyResult } from "arc-captcha-react";

function LoginForm() {
  const handleVerify = (result: VerifyResult) => {
    // Send result to your server for verification
    fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: result.sessionId,
        isHuman: result.isHuman,
        confidence: result.confidence,
      }),
    });
  };

  return (
    <form>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />

      <ArcCaptcha
        apiEndpoint="/api/arc"
        environmentId="ls20-9607627b"
        onVerify={handleVerify}
        theme="dark"
        size={400}
      />

      <button type="submit">Log In</button>
    </form>
  );
}
```

### Available Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiEndpoint` | `string` | required | URL to your API proxy |
| `environmentId` | `string` | required | ARC-AGI-3 game ID |
| `onVerify` | `(result: VerifyResult) => void` | required | Called when session completes |
| `onAction` | `(action: ActionLog) => void` | — | Called on each user action |
| `maxActions` | `number` | `200` | Max actions before cutoff |
| `theme` | `"light" \| "dark"` | `"dark"` | Visual theme |
| `size` | `number` | `512` | Grid pixel size |

### Available Game Environments

Get the list from the API:
```bash
curl http://localhost:8001/api/games
```

### VerifyResult Object

```ts
{
  isHuman: boolean;       // classifier result
  confidence: number;     // 0-1 confidence score
  sessionId: string;      // unique session ID
  actionCount: number;    // total actions taken
  levelReached: number;   // highest level completed
  actionLog: ActionLog[]; // behavioral strategy traces (not solutions)
}
```

## Run the Demo Locally

```bash
git clone https://github.com/jacklee971/arc-captcha.git
cd arc-captcha
pnpm install

# Terminal 1: Game server
ARC_API_KEY=your_key python3 -c "
import arc_agi; arc = arc_agi.Arcade()
arc.listen_and_serve(host='127.0.0.1', port=8001)
"

# Terminal 2: Demo site
cp apps/demo/.env.local.example apps/demo/.env.local
# Edit .env.local with your keys
pnpm dev
```

## Architecture

```
Your App                          ARC-CAPTCHA
┌─────────────┐                  ┌──────────────────────┐
│ Login Form  │                  │ arc-captcha-react     │
│             │                  │                       │
│ ┌─────────┐ │    actions       │ ┌───────────────────┐ │
│ │ArcCaptch│─┼──────────────────┼▸│  GridRenderer      │ │
│ │  Widget  │ │                  │ │  64x64 canvas      │ │
│ └─────────┘ │    VerifyResult  │ ├───────────────────┤ │
│             │◂─────────────────┼─│  BehaviorLogger    │ │
└─────────────┘                  │ │  (strategy traces) │ │
                                 │ ├───────────────────┤ │
Your API Proxy                   │ │  Classifier        │ │
┌─────────────┐                  │ │  human/bot score   │ │
│/api/arc/*   │    HTTP          │ └───────────────────┘ │
│             │◂────────────┐    └──────────────────────┘
│ scorecard   │             │
│ management  │    ┌────────┴───────┐
└─────────────┘    │ ARC-AGI-3      │
                   │ Game Server    │
                   │ (Python/Docker)│
                   └────────────────┘
```

## Project Structure

- `packages/react/` — `arc-captcha-react` embeddable widget (React + TypeScript)
- `apps/demo/` — Next.js demo site
- `server/` — Dockerized Python game server for deployment
- `analysis/` — Python notebooks for behavioral analysis
- `supabase/` — Database schema for data persistence

## How the Classifier Works

The rule-based classifier analyzes 5 behavioral features from strategy traces:

| Feature | Human Signal | Bot Signal |
|---------|-------------|------------|
| Action interval variance | High (irregular timing) | Low (regular timing) |
| Exploration diversity | High (explores many cells) | Low (repeats patterns) |
| Undo ratio | Moderate (strategic undo) | Very low or very high |
| Time to first action | Long (observes first) | Short (acts immediately) |
| Action entropy | High (varied actions) | Low (repetitive actions) |

The classifier determines human vs. bot based on **how someone plays**, not whether they solved the puzzle correctly. A human who fails still looks human. A bot that succeeds still looks like a bot.

## Roadmap

- [x] Phase 1: Core SDK + Demo (widget, logger, demo site)
- [x] Phase 2: Classifier + Data Pipeline (Supabase, human/bot detection)
- [ ] Phase 3: Solver + Competition (Kaggle ARC Prize 2026)

## Related Work

- [ARC-AGI-3 Technical Report](https://arxiv.org/abs/2603.24621)
- [ARC Prize 2026 Competition](https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-3)
- [Apart Research — ARC-AGI as CAPTCHA (concept, 2024)](https://apartresearch.com/project/using-arc-agi-puzzles-as-captcha-task)

## License

Apache 2.0
