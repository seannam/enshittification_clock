'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { researchPlatformMultiProvider } from '@/lib/ai/research';
import type { ResearchResponse, CrossVerifiedResearchResponse, VerifiedEvent } from '@/lib/ai/types';
import { encryptApiKey, loadProviderById } from '@/lib/ai/config';
import { testProviderConnection } from '@/lib/ai/providers';

export interface SaveResult {
  success: boolean;
  message: string;
  serviceId?: string;
  eventCount?: number;
}

function verifyAdminKey(key: string): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    console.error('ADMIN_API_KEY environment variable is not set');
    return false;
  }
  return key === adminKey;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export async function researchAndSavePlatform(
  platformName: string,
  adminKey: string
): Promise<SaveResult> {
  // Verify admin key
  if (!verifyAdminKey(adminKey)) {
    return {
      success: false,
      message: 'Unauthorized: Invalid admin key',
    };
  }

  // Validate platform name
  const trimmedName = platformName.trim();
  if (!trimmedName || trimmedName.length < 2) {
    return {
      success: false,
      message: 'Platform name must be at least 2 characters',
    };
  }

  // Research the platform using multi-provider with cross-verification
  const researchResult = await researchPlatformMultiProvider(trimmedName);

  if (!researchResult.success) {
    const error = researchResult.error;
    if (error.type === 'rate_limit') {
      return {
        success: false,
        message: `Rate limit exceeded. Please try again in ${error.retryAfter || 60} seconds.`,
      };
    }
    return {
      success: false,
      message: `Research failed: ${error.message}`,
    };
  }

  // Convert cross-verified response to standard format for saving
  const standardData = convertToStandardFormat(researchResult.data);

  // Save to database
  const saveResult = await saveToDatabase(standardData);

  // Add verification stats to success message
  if (saveResult.success) {
    const { metadata } = researchResult.data;
    saveResult.message = `Successfully added ${saveResult.eventCount} events for ${standardData.service.name} ` +
      `(${metadata.verifiedEventCount} verified, ${metadata.providersSucceeded.length}/${metadata.providersQueried.length} providers, ` +
      `${metadata.consensusScore}% consensus)`;
  }

  return saveResult;
}

// Convert cross-verified response to standard format for database saving
function convertToStandardFormat(data: CrossVerifiedResearchResponse): ResearchResponse {
  return {
    service: data.service,
    events: data.events.map((event: VerifiedEvent) => ({
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      severity: event.severity,
      event_type: event.event_type,
      source_url: event.source_url,
      confidence: event.verification.confidence === 'verified' ? 'high' :
                  event.verification.confidence === 'likely' ? 'medium' : 'low',
    })),
  };
}

async function saveToDatabase(data: ResearchResponse): Promise<SaveResult> {
  const supabase = createAdminClient();
  const slug = generateSlug(data.service.name);

  // Upsert service (create or update by slug)
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .upsert(
      {
        name: data.service.name.slice(0, 100),
        slug,
        description: data.service.description.slice(0, 500),
        category: data.service.category.slice(0, 50),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'slug',
      }
    )
    .select('id')
    .single();

  if (serviceError) {
    console.error('Service upsert error:', serviceError);
    return {
      success: false,
      message: `Database error: ${serviceError.message}`,
    };
  }

  // Delete existing events for this service to avoid duplicates
  const { error: deleteError } = await supabase
    .from('enshittification_events')
    .delete()
    .eq('service_id', service.id);

  if (deleteError) {
    console.error('Events delete error:', deleteError);
    return {
      success: false,
      message: `Database error: ${deleteError.message}`,
    };
  }

  // Insert new events
  const eventsToInsert = data.events.map((event) => ({
    service_id: service.id,
    title: event.title.slice(0, 200),
    description: event.description.slice(0, 2000),
    event_date: event.event_date,
    severity: event.severity,
    event_type: event.event_type,
    source_url: event.source_url,
  }));

  const { error: eventsError } = await supabase
    .from('enshittification_events')
    .insert(eventsToInsert);

  if (eventsError) {
    console.error('Events insert error:', eventsError);
    return {
      success: false,
      message: `Database error: ${eventsError.message}`,
    };
  }

  return {
    success: true,
    message: `Successfully added ${data.events.length} events for ${data.service.name}`,
    serviceId: service.id,
    eventCount: data.events.length,
  };
}

export async function getRecentPlatforms(adminKey: string): Promise<{
  success: boolean;
  platforms?: Array<{ name: string; slug: string; eventCount: number; updatedAt: string }>;
  message?: string;
}> {
  if (!verifyAdminKey(adminKey)) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  const supabase = createAdminClient();

  const { data: services, error } = await supabase
    .from('services')
    .select(
      `
      name,
      slug,
      updated_at,
      enshittification_events(count)
    `
    )
    .order('updated_at', { ascending: false })
    .limit(10);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  const platforms = services.map((service) => ({
    name: service.name,
    slug: service.slug,
    eventCount: (service.enshittification_events as unknown as Array<{ count: number }>)[0]?.count || 0,
    updatedAt: service.updated_at,
  }));

  return {
    success: true,
    platforms,
  };
}

// AI Provider CRUD Operations

export interface AIProviderInput {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  enabled?: boolean;
  priority?: number;
  maxTokens?: number;
  temperature?: number;
}

export interface AIProviderDisplay {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  enabled: boolean;
  priority: number;
  maxTokens: number;
  temperature: number;
  createdAt: string;
  updatedAt: string;
}

export async function getAIProviders(adminKey: string): Promise<{
  success: boolean;
  providers?: AIProviderDisplay[];
  message?: string;
}> {
  if (!verifyAdminKey(adminKey)) {
    return { success: false, message: 'Unauthorized' };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('ai_providers')
    .select('*')
    .order('priority', { ascending: true });

  if (error) {
    return { success: false, message: error.message };
  }

  const providers: AIProviderDisplay[] = (data || []).map((p) => ({
    id: p.id,
    name: p.name,
    baseUrl: p.base_url,
    model: p.model,
    enabled: p.enabled,
    priority: p.priority,
    maxTokens: p.max_tokens,
    temperature: p.temperature,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));

  return { success: true, providers };
}

export async function createAIProvider(
  adminKey: string,
  input: AIProviderInput
): Promise<{ success: boolean; providerId?: string; message?: string }> {
  if (!verifyAdminKey(adminKey)) {
    return { success: false, message: 'Unauthorized' };
  }

  if (!input.name || !input.baseUrl || !input.apiKey || !input.model) {
    return { success: false, message: 'Name, base URL, API key, and model are required' };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('ai_providers')
    .insert({
      name: input.name,
      base_url: input.baseUrl,
      api_key_encrypted: encryptApiKey(input.apiKey),
      model: input.model,
      enabled: input.enabled ?? true,
      priority: input.priority ?? 1,
      max_tokens: input.maxTokens ?? 4096,
      temperature: input.temperature ?? 0.7,
    })
    .select('id')
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, providerId: data.id, message: 'Provider created successfully' };
}

export async function updateAIProvider(
  adminKey: string,
  providerId: string,
  input: Partial<AIProviderInput>
): Promise<{ success: boolean; message?: string }> {
  if (!verifyAdminKey(adminKey)) {
    return { success: false, message: 'Unauthorized' };
  }

  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.baseUrl !== undefined) updates.base_url = input.baseUrl;
  if (input.apiKey !== undefined) updates.api_key_encrypted = encryptApiKey(input.apiKey);
  if (input.model !== undefined) updates.model = input.model;
  if (input.enabled !== undefined) updates.enabled = input.enabled;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.maxTokens !== undefined) updates.max_tokens = input.maxTokens;
  if (input.temperature !== undefined) updates.temperature = input.temperature;

  const { error } = await supabase
    .from('ai_providers')
    .update(updates)
    .eq('id', providerId);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Provider updated successfully' };
}

export async function deleteAIProvider(
  adminKey: string,
  providerId: string
): Promise<{ success: boolean; message?: string }> {
  if (!verifyAdminKey(adminKey)) {
    return { success: false, message: 'Unauthorized' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('ai_providers')
    .delete()
    .eq('id', providerId);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Provider deleted successfully' };
}

export async function testAIProvider(
  adminKey: string,
  providerId: string
): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  if (!verifyAdminKey(adminKey)) {
    return { success: false, message: 'Unauthorized' };
  }

  const config = await loadProviderById(providerId);
  if (!config) {
    return { success: false, message: 'Provider not found' };
  }

  const result = await testProviderConnection(config);
  return result;
}

export async function toggleAIProvider(
  adminKey: string,
  providerId: string,
  enabled: boolean
): Promise<{ success: boolean; message?: string }> {
  return updateAIProvider(adminKey, providerId, { enabled });
}
