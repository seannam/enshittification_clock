-- AI Providers table for multi-provider research with cross-verification

-- Create ai_providers table
CREATE TABLE IF NOT EXISTS ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  base_url VARCHAR(500) NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  model VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  max_tokens INTEGER DEFAULT 4096,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for enabled providers sorted by priority
CREATE INDEX IF NOT EXISTS idx_ai_providers_enabled ON ai_providers(enabled, priority) WHERE enabled = true;

-- Enable Row Level Security
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;

-- No public read policy - admin only through service role key

-- Add trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ai_providers_updated_at') THEN
    CREATE TRIGGER update_ai_providers_updated_at
      BEFORE UPDATE ON ai_providers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;
