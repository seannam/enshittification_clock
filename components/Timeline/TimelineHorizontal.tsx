import type { EventWithService } from '@/lib/supabase/types';
import type { ViewMode } from '@/lib/utils/timeline-helpers';
import { groupEventsByPlatform, getPlatformInfo } from '@/lib/utils/timeline-helpers';
import { TimelineEventCard } from './TimelineEventCard';
import { TimelineMarkerHorizontal } from './TimelineMarker';

interface TimelineHorizontalProps {
  events: EventWithService[];
  viewMode: ViewMode;
}

export function TimelineHorizontal({ events, viewMode }: TimelineHorizontalProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No events to display
      </div>
    );
  }

  if (viewMode === 'by-platform') {
    return <HorizontalByPlatform events={events} />;
  }

  return <HorizontalUnified events={events} />;
}

function HorizontalUnified({ events }: { events: EventWithService[] }) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="inline-flex flex-col min-w-full">
        {/* Timeline line at top */}
        <div className="flex items-center px-4 py-2">
          {events.map((event, index) => (
            <div key={event.id} className="flex items-center">
              <TimelineMarkerHorizontal
                severity={event.severity}
                isLast={index === events.length - 1}
              />
            </div>
          ))}
        </div>

        {/* Event cards below */}
        <div className="flex gap-4 px-4 pt-2">
          {events.map((event) => (
            <div key={event.id} className="flex-shrink-0 w-72">
              <TimelineEventCard event={event} showPlatform={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HorizontalByPlatform({ events }: { events: EventWithService[] }) {
  const grouped = groupEventsByPlatform(events);
  const platforms = Array.from(grouped.entries());

  return (
    <div className="space-y-8">
      {platforms.map(([slug, platformEvents]) => {
        const platformInfo = getPlatformInfo(platformEvents);
        if (!platformInfo) return null;

        return (
          <div key={slug} className="border-b border-gray-200 pb-6 last:border-b-0">
            {/* Platform header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-600">
                  {platformInfo.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{platformInfo.name}</h3>
                <p className="text-sm text-gray-500">
                  {platformInfo.eventCount} event{platformInfo.eventCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Horizontal scroll for platform events */}
            <div className="overflow-x-auto pb-2">
              <div className="inline-flex flex-col min-w-full">
                {/* Timeline line */}
                <div className="flex items-center px-4 py-2">
                  {platformEvents.map((event, index) => (
                    <div key={event.id} className="flex items-center">
                      <TimelineMarkerHorizontal
                        severity={event.severity}
                        isLast={index === platformEvents.length - 1}
                      />
                    </div>
                  ))}
                </div>

                {/* Event cards */}
                <div className="flex gap-4 px-4 pt-2">
                  {platformEvents.map((event) => (
                    <div key={event.id} className="flex-shrink-0 w-72">
                      <TimelineEventCard event={event} showPlatform={false} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
