CREATE TABLE IF NOT EXISTS radio_transcripts (
  id          bigserial   PRIMARY KEY,
  channel     text        NOT NULL,
  transcript  text        NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT NOW(),
  duration_s  numeric,
  confidence  numeric
);

ALTER TABLE radio_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read radio_transcripts"
  ON radio_transcripts FOR SELECT TO authenticated USING (true);

CREATE POLICY "service role insert radio_transcripts"
  ON radio_transcripts FOR INSERT TO service_role WITH CHECK (true);

CREATE INDEX IF NOT EXISTS radio_transcripts_recorded_at_idx ON radio_transcripts (recorded_at DESC);
