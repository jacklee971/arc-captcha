-- ARC-CAPTCHA Phase 2: Database Schema
-- Run this in your Supabase SQL editor to create the required tables.

-- sessions: tracks each CAPTCHA play session
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment_id text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  total_actions integer,
  levels_completed integer,
  classification text,
  confidence float,
  user_agent text,
  source text
);

-- action_logs: individual actions within a session
CREATE TABLE action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  seq integer NOT NULL,
  timestamp_ms bigint NOT NULL,
  action_type text NOT NULL,
  key_value text,
  coord_x integer,
  coord_y integer,
  frame_hash text,
  time_since_last_ms integer,
  level integer
);

-- classifications: classifier results per session
CREATE TABLE classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  classifier_version text,
  is_human boolean,
  confidence float,
  features jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_action_logs_session_id ON action_logs(session_id);
CREATE INDEX idx_classifications_session_id ON classifications(session_id);
CREATE INDEX idx_sessions_environment_id ON sessions(environment_id);
CREATE INDEX idx_sessions_classification ON sessions(classification);
