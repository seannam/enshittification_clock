-- Create event severity enum (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_severity') THEN
    CREATE TYPE event_severity AS ENUM ('minor', 'moderate', 'significant', 'major', 'critical');
  END IF;
END
$$;

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$' AND char_length(slug) <= 50),
  description TEXT,
  logo_url TEXT,
  category TEXT CHECK (char_length(category) <= 50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enshittification_events table
CREATE TABLE IF NOT EXISTS enshittification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  description TEXT NOT NULL CHECK (char_length(description) <= 2000),
  event_date DATE NOT NULL CHECK (event_date <= CURRENT_DATE),
  severity event_severity NOT NULL,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_events_service_id ON enshittification_events(service_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON enshittification_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_severity ON enshittification_events(severity);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- Enable Row Level Security (idempotent - safe to run multiple times)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE enshittification_events ENABLE ROW LEVEL SECURITY;

-- Create read-only public access policies (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access to services') THEN
    CREATE POLICY "Public read access to services"
      ON services FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access to events') THEN
    CREATE POLICY "Public read access to events"
      ON enshittification_events FOR SELECT
      USING (true);
  END IF;
END
$$;

-- Create updated_at trigger function (CREATE OR REPLACE is already idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updated_at (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_services_updated_at') THEN
    CREATE TRIGGER update_services_updated_at
      BEFORE UPDATE ON services
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_events_updated_at') THEN
    CREATE TRIGGER update_events_updated_at
      BEFORE UPDATE ON enshittification_events
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;
