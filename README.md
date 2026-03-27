# ARC-CAPTCHA

> ARC-AGI-3 interactive environments as CAPTCHA — an open-source research project

AI systems score below 1% on ARC-AGI-3. Humans solve 100%. This gap makes ARC-AGI-3 environments ideal for distinguishing humans from bots.

ARC-CAPTCHA wraps ARC-AGI-3 environments into an embeddable widget that:
1. **Detects bots** by analyzing behavioral patterns (action timing, exploration diversity, strategy)
2. **Collects data** — every action is logged with timestamps and frame state
3. **Improves AI** — collected behavioral data feeds back into ARC-AGI-3 solver training

## Quick Start

```bash
pnpm install
cp apps/demo/.env.local.example apps/demo/.env.local
# Edit .env.local with your ARC-AGI-3 API key from https://three.arcprize.org/
pnpm dev
```

## Usage

```tsx
import { ArcCaptcha } from "@arc-captcha/react";

<ArcCaptcha
  apiEndpoint="/api/arc"
  environmentId="1s20"
  onVerify={(result) => {
    console.log(result.isHuman, result.confidence);
    console.log(result.actionLog); // full behavioral trace
  }}
/>
```

## Architecture

```
Browser (ArcCaptcha widget)
  -> renders 64x64 grid, captures actions
  -> logs behavior (timestamps, patterns, strategy)
  -> sends actions to API proxy

Next.js API Route (proxy)
  -> forwards to ARC-AGI-3 REST API
  -> returns frame data

Behavior Logger
  -> structured JSON action logs
  -> session summary with behavioral features
```

## Project Structure

- `packages/react/` — `@arc-captcha/react` embeddable widget
- `apps/demo/` — Next.js demo site
- `analysis/` — Python notebooks for behavioral analysis (Phase 2)
- `solver/` — Kaggle submission (Phase 3)

## Roadmap

- [x] Phase 1: Core SDK + Demo (widget, logger, demo site)
- [ ] Phase 2: Classifier + Data Pipeline (Supabase, human/bot detection)
- [ ] Phase 3: Solver + Competition (Kaggle ARC Prize 2026 Milestone 1)

## Related Work

- [ARC-AGI-3 Technical Report](https://arxiv.org/abs/2603.24621)
- [ARC Prize 2026 Competition](https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-3)
- [Apart Research — ARC-AGI as CAPTCHA (concept, 2024)](https://apartresearch.com/project/using-arc-agi-puzzles-as-captcha-task)

## License

Apache 2.0
