import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { EventWithService } from '@/lib/supabase/types';
import {
  sortEventsChronologically,
  filterEventsByType,
  getUniqueEventTypes,
  parseTimelineParams,
} from '@/lib/utils/timeline-helpers';
import { TimelineControls } from './TimelineControls';
import { TimelineVertical } from './TimelineVertical';
import { TimelineHorizontal } from './TimelineHorizontal';

interface TimelineProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function Timeline({ searchParams }: TimelineProps) {
  const supabase = await createClient();

  // Fetch events with service data
  const { data: events, error } = await supabase
    .from('enshittification_events')
    .select(`
      *,
      service:services(*)
    `)
    .order('event_date', { ascending: false });

  if (error) {
    console.error('Failed to fetch events:', error);
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Failed to load timeline data</p>
      </div>
    );
  }

  // Cast to proper type
  const typedEvents = (events || []) as EventWithService[];

  // Parse search params
  const urlParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      urlParams.set(key, value);
    }
  });
  const { view, layout, filter } = parseTimelineParams(urlParams);

  // Sort and filter events
  const sortedEvents = sortEventsChronologically(typedEvents, 'desc');
  const filteredEvents = filterEventsByType(sortedEvents, filter);
  const availableEventTypes = getUniqueEventTypes(typedEvents);

  return (
    <section className="py-8 px-4" aria-label="Enshittification Timeline">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Timeline
          </h1>
          <p className="text-gray-600">
            Chronological view of enshittification events
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6">
          <Suspense fallback={<div className="h-14 bg-gray-50 rounded-lg animate-pulse" />}>
            <TimelineControls availableEventTypes={availableEventTypes} />
          </Suspense>
        </div>

        {/* Event count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredEvents.length} of {typedEvents.length} events
        </p>

        {/* Timeline view */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {layout === 'vertical' ? (
            <TimelineVertical events={filteredEvents} viewMode={view} />
          ) : (
            <TimelineHorizontal events={filteredEvents} viewMode={view} />
          )}
        </div>
      </div>
    </section>
  );
}
