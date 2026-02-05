-- Add event_type field to enshittification_events table
-- Common event types: Paywall, Privacy, API, Ads, UX, Algorithm, Monetization, Terms

ALTER TABLE enshittification_events
ADD COLUMN event_type VARCHAR(50);

-- Create index for filtering by event_type
CREATE INDEX idx_events_type ON enshittification_events(event_type);
