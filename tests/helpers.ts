import type { EnshittificationEvent, EventSeverity, Service } from '@/lib/supabase/types';

/**
 * Create a mock service for testing
 */
export function createMockService(overrides?: Partial<Service>): Service {
  return {
    id: 'test-service-id',
    name: 'Test Service',
    slug: 'test-service',
    description: 'A test service',
    logo_url: '/test-logo.svg',
    category: 'Test Category',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock event for testing
 */
export function createMockEvent(
  overrides?: Partial<EnshittificationEvent>
): EnshittificationEvent {
  return {
    id: 'test-event-id',
    service_id: 'test-service-id',
    title: 'Test Event',
    description: 'A test event description',
    event_date: '2023-01-01',
    severity: 'moderate' as EventSeverity,
    source_url: 'https://example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create multiple mock events
 */
export function createMockEvents(count: number): EnshittificationEvent[] {
  return Array.from({ length: count }, (_, i) =>
    createMockEvent({
      id: `event-${i}`,
      title: `Event ${i}`,
      event_date: new Date(2023, 0, i + 1).toISOString().split('T')[0],
    })
  );
}

/**
 * Wait for a specific time (useful for testing async operations)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
