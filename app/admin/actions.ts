'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { researchPlatform } from '@/lib/ai/research';
import type { ResearchResponse } from '@/lib/ai/types';

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

  // Research the platform using Claude
  const researchResult = await researchPlatform(trimmedName);

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

  // Save to database
  const saveResult = await saveToDatabase(researchResult.data);
  return saveResult;
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
