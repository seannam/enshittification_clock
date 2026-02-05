-- Add event_type field to enshittification_events table (idempotent)
-- Common event types: Paywall, Privacy, API, Ads, UX, Algorithm, Monetization, Terms

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enshittification_events' AND column_name = 'event_type'
  ) THEN
    ALTER TABLE enshittification_events ADD COLUMN event_type VARCHAR(50);
  END IF;
END
$$;

-- Create index for filtering by event_type (idempotent)
CREATE INDEX IF NOT EXISTS idx_events_type ON enshittification_events(event_type);
