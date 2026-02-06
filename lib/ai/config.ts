// lib/ai/config.ts
// Load AI provider configurations from database with env var fallback

import { createAdminClient } from '@/lib/supabase/admin';
import type { AIProviderConfig } from './types';
import type { AIProviderRecord } from '@/lib/supabase/types';

// Simple XOR-based encryption for API keys at rest
// This provides basic obfuscation - not a substitute for proper secrets management
const ENCRYPTION_KEY = process.env.AI_PROVIDER_ENCRYPTION_KEY || 'default-encryption-key';

export function encryptApiKey(apiKey: string): string {
  const keyBytes = Buffer.from(ENCRYPTION_KEY);
  const inputBytes = Buffer.from(apiKey);
  const outputBytes = Buffer.alloc(inputBytes.length);

  for (let i = 0; i < inputBytes.length; i++) {
    outputBytes[i] = inputBytes[i] ^ keyBytes[i % keyBytes.length];
  }

  return outputBytes.toString('base64');
}

export function decryptApiKey(encrypted: string): string {
  const keyBytes = Buffer.from(ENCRYPTION_KEY);
  const inputBytes = Buffer.from(encrypted, 'base64');
  const outputBytes = Buffer.alloc(inputBytes.length);

  for (let i = 0; i < inputBytes.length; i++) {
    outputBytes[i] = inputBytes[i] ^ keyBytes[i % keyBytes.length];
  }

  return outputBytes.toString();
}

function recordToConfig(record: AIProviderRecord): AIProviderConfig {
  return {
    id: record.id,
    name: record.name,
    baseUrl: record.base_url,
    apiKey: decryptApiKey(record.api_key_encrypted),
    model: record.model,
    enabled: record.enabled,
    priority: record.priority,
    maxTokens: record.max_tokens,
    temperature: record.temperature,
  };
}

// Load enabled providers from database, sorted by priority
export async function loadProviderConfigs(): Promise<AIProviderConfig[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('enabled', true)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error loading AI providers from database:', error);
      return getFallbackProvider();
    }

    if (data && data.length > 0) {
      return data.map(recordToConfig);
    }

    // No providers in database, use fallback
    return getFallbackProvider();
  } catch (error) {
    console.error('Failed to load AI providers:', error);
    return getFallbackProvider();
  }
}

// Fallback to ANTHROPIC_API_KEY env var if no providers configured
function getFallbackProvider(): AIProviderConfig[] {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!anthropicKey) {
    return [];
  }

  return [
    {
      id: 'env-anthropic',
      name: 'Anthropic (env)',
      baseUrl: 'https://api.anthropic.com',
      apiKey: anthropicKey,
      model: 'claude-sonnet-4-20250514',
      enabled: true,
      priority: 1,
      maxTokens: 4096,
      temperature: 0.7,
    },
  ];
}

// Load a single provider by ID
export async function loadProviderById(id: string): Promise<AIProviderConfig | null> {
  if (id === 'env-anthropic') {
    const fallback = getFallbackProvider();
    return fallback[0] || null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('ai_providers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return recordToConfig(data);
}
