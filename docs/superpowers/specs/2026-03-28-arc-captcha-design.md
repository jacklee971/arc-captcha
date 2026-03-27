# ARC-CAPTCHA Design Spec

**Date:** 2026-03-28
**Author:** jack
**Status:** Draft
**Target:** Kaggle ARC Prize 2026 Milestone 1 (2026-06-30)

## Overview

ARC-CAPTCHA is an open-source SDK that wraps ARC-AGI-3 interactive environments into an embeddable CAPTCHA widget. It collects structured behavioral data from human and bot interactions, uses that data to build a human/bot classifier, and feeds the behavioral patterns back into an ARC-AGI-3 solver for the Kaggle ARC Prize 2026 competition.

### Core Thesis

Current AI systems score below 1% on ARC-AGI-3 while humans solve 100%. This gap makes ARC-AGI-3 environments ideal for distinguishing humans from bots. By deploying these environments as CAPTCHAs, we create a feedback loop: platforms get bot detection, and we collect behavioral data that improves our ARC solver.

### Goals

1. **Open-source research project** — novel paradigm of adversarial CAPTCHA driving ARC-AGI solver improvement
2. **Kaggle ARC Prize 2026 participation** — submit by Milestone 1 (2026-06-30)
3. **LinkedIn/Twitter viral potential** — visual demos, clear narrative, open GitHub repo

### Non-Goals

- Production-grade CAPTCHA service (this is a research project/proof of concept)
- Replacing reCAPTCHA or hCaptcha in production systems
- Solving all 25 public ARC-AGI-3 environments in MVP

## Architecture

```
External Sites (embed our SDK)
    ├── Site A: <ArcCaptcha />
    ├── Site B: <ArcCaptcha />
    └── Demo Site: <ArcCaptcha />
              │
              ▼ action logs
    ┌─────────────────────────────────┐
    │   arc-captcha (open source)     │
    │                                 │
    │  ┌──────────┐ ┌──────────────┐  │
    │  │ React    │ │ Behavior     │  │
    │  │ Widget   │ │ Logger       │  │
    │  │          │ │              │  │
    │  │ 64x64    │ │ timestamps   │  │
    │  │ grid     │ │ action types │  │
    │  │ renderer │ │ coordinates  │  │
    │  │ + actions│ │ frame states │  │
    │  └──────────┘ └──────────────┘  │
    │        ┌──────────────┐         │
    │        │ Classifier   │         │
    │        │ human vs bot │         │
    │        │ confidence   │         │
    │        └──────────────┘         │
    └─────────────────────────────────┘
              │
              ▼ store data
    ┌─────────────────────────────────┐
    │  Supabase (free tier)           │
    │  - action_logs                  │
    │  - sessions                     │
    │  - classifications              │
    └─────────────────────────────────┘
              │
              ▼ analyze
    ┌─────────────────────────────────┐
    │  Analysis Pipeline              │
    │  - GitHub Actions (free)        │
    │  - Jupyter notebooks (local)    │
    │  - Pattern clustering           │
    │  - Solver training data gen     │
    └─────────────────────────────────┘
              │
              ▼ submit
    ┌─────────────────────────────────┐
    │  Kaggle ARC Prize 2026          │
    │  - Milestone 1: 2026-06-30     │
    │  - Milestone 2: 2026-09-30     │
    └─────────────────────────────────┘
```

## Tech Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| Widget UI | React + TypeScript (npm package) | Free |
| Game Logic | ARC-AGI-3 official Python API via server proxy (Supabase Edge Function or local) — browser only renders frames, does not run game engine | Free |
| Demo Site | Next.js on Vercel | Free |
| Data Store | Supabase Free Tier (500MB) | Free |
| Analysis | Python + Jupyter (local) + GitHub Actions | Free |
| Competition | Kaggle Notebook | Free |

**Total cost: $0**

## Components

### 1. ArcCaptcha Widget (`@arc-captcha/react`)

Embeddable React component that renders a mini ARC-AGI-3 challenge.

**Observation Space:**
- 64x64 grid where each cell is one of 16 colors
- Renders as a canvas or CSS grid element
- Displays one frame at a time

**Action Space (subset per environment):**
- 5 key actions (up/down/left/right/action)
- Undo action
- Cell select (click on grid coordinates)

**API:**
```tsx
interface ArcCaptchaProps {
  environmentId: string;       // which ARC environment to load
  onVerify: (result: VerifyResult) => void;
  onAction?: (action: ActionLog) => void;  // optional per-action callback
  maxActions?: number;         // cutoff (default: 50, per ARC-AGI-3 5x human rule)
  theme?: 'light' | 'dark';
}

interface VerifyResult {
  isHuman: boolean;
  confidence: number;          // 0-1
  sessionId: string;
  actionCount: number;
  levelReached: number;
  actionLog: ActionLog[];      // full behavioral trace
}

interface ActionLog {
  timestamp: number;
  actionType: 'key' | 'select' | 'undo';
  key?: string;                // for key actions
  coordinates?: [number, number]; // for select actions
  frameHash: string;           // hash of current frame state
  timeSinceLastAction: number; // milliseconds
}
```

### 2. Behavior Logger

Records every interaction with the widget in structured format.

**Captured signals:**
- Action timestamps and intervals
- Action type sequences
- Exploration patterns (how much of the grid is interacted with)
- Strategy changes (undo frequency, direction changes)
- Time-to-first-action (initial observation period)
- Level completion time and action count

**Storage format:** JSON lines, one entry per action. Batched and sent to Supabase at session end.

### 3. Human/Bot Classifier

**v1 (MVP — rule-based):**
- Action interval variance (bots are more regular)
- Exploration diversity score (bots tend to repeat patterns)
- Undo usage patterns (humans undo more strategically)
- Time-to-first-action (humans observe before acting)
- Action sequence entropy (bots have lower entropy)

**v2 (post-MVP — ML-based):**
- Train on collected labeled data (human sessions from demo site vs automated bot sessions)
- Lightweight model that runs client-side or on Supabase Edge Functions

### 4. Data Pipeline

**Collection:**
- Widget → Supabase (action logs, session metadata, classification results)
- Tables: `sessions`, `action_logs`, `classifications`, `environments`

**Analysis:**
- Jupyter notebooks for exploratory analysis
- Pattern clustering (K-means on behavioral feature vectors)
- Strategy extraction (common human solving patterns)

**Solver Training:**
- Extract successful human strategies as heuristics
- Build behavioral feature vectors for imitation learning
- Generate training data for Kaggle submission

### 5. Demo Site

Next.js app deployed on Vercel. Showcases:
- Playable ARC-AGI-3 environments (3-5 public ones)
- Real-time behavior logging visualization
- Human/bot classification result
- Project explanation and GitHub link

## Database Schema (Supabase)

```sql
-- sessions table
sessions (
  id uuid PRIMARY KEY,
  environment_id text NOT NULL,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  total_actions integer,
  levels_completed integer,
  classification text,        -- 'human' | 'bot' | 'unknown'
  confidence float,
  user_agent text,
  source text                 -- 'demo' | 'widget' | 'test'
)

-- action_logs table
action_logs (
  id uuid PRIMARY KEY,
  session_id uuid REFERENCES sessions(id),
  seq integer NOT NULL,       -- action sequence number
  timestamp_ms bigint NOT NULL,
  action_type text NOT NULL,  -- 'key' | 'select' | 'undo'
  key_value text,
  coord_x integer,
  coord_y integer,
  frame_hash text,
  time_since_last_ms integer,
  level integer
)

-- classifications table
classifications (
  id uuid PRIMARY KEY,
  session_id uuid REFERENCES sessions(id),
  classifier_version text,
  is_human boolean,
  confidence float,
  features jsonb,             -- feature vector used for classification
  created_at timestamptz
)
```

## MVP Phases

### Phase 1: Core SDK + Demo (4 weeks)

**Deliverables:**
- `@arc-captcha/react` widget with 64x64 grid renderer
- Action space implementation (5 keys + undo + cell select)
- Behavior logger with structured JSON output
- Demo site with 3-5 playable public ARC-AGI-3 environments
- Deployed on Vercel

**Definition of done:**
- A human can play an ARC-AGI-3 environment in the browser
- Every action is logged with timestamps and frame state
- Demo site is publicly accessible

### Phase 2: Classifier + Data Pipeline (4 weeks)

**Deliverables:**
- Supabase integration for persistent data storage
- Rule-based human/bot classifier v1
- Analysis Jupyter notebooks with visualization
- Simulated bot sessions for baseline comparison

**Definition of done:**
- Action logs are stored in Supabase
- Classifier returns human/bot + confidence for any session
- At least 50 human sessions and 50 simulated bot sessions collected
- Analysis notebooks show clear behavioral differences

### Phase 3: Solver + Competition (4 weeks → 6/30)

**Deliverables:**
- Behavioral data analysis → strategy extraction
- ARC-AGI-3 solver using extracted human strategies
- Kaggle Notebook submission for Milestone 1
- Blog post / LinkedIn article
- GitHub repo with README, docs, and examples

**Definition of done:**
- Kaggle submission accepted and scored
- Blog post published
- GitHub repo has clear README with demo link

## Project Structure

```
arc-captcha/
├── packages/
│   └── react/               # @arc-captcha/react npm package
│       ├── src/
│       │   ├── ArcCaptcha.tsx
│       │   ├── GridRenderer.tsx
│       │   ├── ActionHandler.tsx
│       │   ├── BehaviorLogger.ts
│       │   └── Classifier.ts
│       ├── package.json
│       └── tsconfig.json
├── apps/
│   └── demo/                # Next.js demo site
│       ├── app/
│       │   ├── page.tsx     # landing page
│       │   ├── play/        # playable environments
│       │   └── api/         # API routes for Supabase
│       └── package.json
├── analysis/                # Python analysis
│   ├── notebooks/
│   │   ├── exploration.ipynb
│   │   └── classifier.ipynb
│   └── requirements.txt
├── solver/                  # Kaggle solver
│   ├── notebooks/
│   │   └── submission.ipynb
│   └── requirements.txt
├── docs/
│   └── superpowers/
│       └── specs/
├── package.json             # monorepo root (pnpm workspace)
├── pnpm-workspace.yaml
├── README.md
└── LICENSE                  # Apache 2.0
```

## Differentiation from Prior Work

| Aspect | Apart Research (2024) | Our Project |
|--------|----------------------|-------------|
| Scope | Conceptual proposal only | Working implementation + data pipeline |
| Data loop | Not proposed | Adversarial feedback loop (CAPTCHA data → solver training) |
| Competition | Not connected | Kaggle ARC Prize 2026 entry |
| Open source | No code | Full open source SDK |
| Classifier | Not implemented | Rule-based v1 + ML v2 roadmap |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| ARC-AGI-3 engine hard to run in browser | High | Use official API for game state, only render in browser |
| Not enough human play data by 6/30 | Medium | Seed with own playthroughs + share demo on Reddit/Twitter |
| Solver doesn't improve from behavioral data | Medium | Baseline submission with standard approach, behavioral data is bonus |
| Supabase free tier limit hit | Low | 500MB is ~millions of action logs; switch to SQLite export if needed |

## License

- Code: Apache 2.0 (compatible with ARC-AGI-3 data license)
- Competition submission: CC-BY 4.0 (per Kaggle rules)
