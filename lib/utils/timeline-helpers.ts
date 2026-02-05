// lib/utils/timeline-helpers.ts
// Utility functions for timeline view

import type { EventWithService, EventType } from '../supabase/types';

/**
 * Group events by platform (service)
 */
export function groupEventsByPlatform(
  events: EventWithService[]
): Map<string, EventWithService[]> {
  const grouped = new Map<string, EventWithService[]>();

  for (const event of events) {
    const key = event.service.slug;
    const existing = grouped.get(key) || [];
    grouped.set(key, [...existing, event]);
  }

  // Sort events within each group by date (newest first)
  for (const [key, groupEvents] of grouped) {
    grouped.set(key, sortEventsChronologically(groupEvents, 'desc'));
  }

  return grouped;
}

/**
 * Filter events by event type
 */
export function filterEventsByType(
  events: EventWithService[],
  eventType: EventType | 'all'
): EventWithService[] {
  if (eventType === 'all') {
    return events;
  }
  return events.filter((event) => event.event_type === eventType);
}

/**
 * Format event date for display
 */
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Format event date for full display
 */
export function formatEventDateFull(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Sort events chronologically
 */
export function sortEventsChronologically(
  events: EventWithService[],
  order: 'asc' | 'desc' = 'desc'
): EventWithService[] {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.event_date).getTime();
    const dateB = new Date(b.event_date).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Get unique event types from events
 */
export function getUniqueEventTypes(events: EventWithService[]): EventType[] {
  const types = new Set<EventType>();
  for (const event of events) {
    if (event.event_type) {
      types.add(event.event_type);
    }
  }
  return Array.from(types).sort();
}

/**
 * Get platform display info
 */
export function getPlatformInfo(events: EventWithService[]): {
  name: string;
  slug: string;
  eventCount: number;
} | null {
  if (events.length === 0) return null;
  return {
    name: events[0].service.name,
    slug: events[0].service.slug,
    eventCount: events.length,
  };
}

/**
 * Timeline view mode options
 */
export type ViewMode = 'unified' | 'by-platform';

/**
 * Timeline layout options
 */
export type LayoutMode = 'vertical' | 'horizontal';

/**
 * Timeline filter type (event_type or 'all')
 */
export type FilterType = EventType | 'all';

/**
 * Parse URL search params for timeline state
 */
export function parseTimelineParams(searchParams: URLSearchParams): {
  view: ViewMode;
  layout: LayoutMode;
  filter: FilterType;
} {
  const view = searchParams.get('view') as ViewMode;
  const layout = searchParams.get('layout') as LayoutMode;
  const filter = searchParams.get('filter') as FilterType;

  return {
    view: view === 'by-platform' ? 'by-platform' : 'unified',
    layout: layout === 'horizontal' ? 'horizontal' : 'vertical',
    filter: isValidFilterType(filter) ? filter : 'all',
  };
}

/**
 * Build URL search params from timeline state
 */
export function buildTimelineParams(
  view: ViewMode,
  layout: LayoutMode,
  filter: FilterType
): string {
  const params = new URLSearchParams();
  params.set('view', view);
  params.set('layout', layout);
  params.set('filter', filter);
  return params.toString();
}

/**
 * Check if a value is a valid filter type
 */
function isValidFilterType(value: string | null): value is FilterType {
  if (!value) return false;
  if (value === 'all') return true;
  const validTypes: EventType[] = [
    'Paywall',
    'Privacy',
    'API',
    'Ads',
    'UX',
    'Algorithm',
    'Monetization',
    'Terms',
    'Other',
  ];
  return validTypes.includes(value as EventType);
}
