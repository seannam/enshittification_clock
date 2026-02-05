import type { EventWithService } from '@/lib/supabase/types';
import type { ViewMode } from '@/lib/utils/timeline-helpers';
import { groupEventsByPlatform, getPlatformInfo } from '@/lib/utils/timeline-helpers';
import { TimelineEventCard } from './TimelineEventCard';
import { TimelineMarker } from './TimelineMarker';
import { PlatformGroup } from './PlatformGroup';

interface TimelineVerticalProps {
  events: EventWithService[];
  viewMode: ViewMode;
}

export function TimelineVertical({ events, viewMode }: TimelineVerticalProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No events to display
      </div>
    );
  }

  if (viewMode === 'by-platform') {
    return <TimelineByPlatform events={events} />;
  }

  return <TimelineUnified events={events} />;
}

function TimelineUnified({ events }: { events: EventWithService[] }) {
  return (
    <div className="relative">
      {/* Line from first dot center to last dot center */}
      {events.length > 1 && (
        <div
          className="absolute left-[11px] top-[6px] bottom-[6px] w-0.5 bg-gray-200"
          aria-hidden="true"
        />
      )}

      <div className="space-y-0">
        {events.map((event, index) => (
          <div key={event.id} className="flex gap-4 items-center relative">
            {/* Marker centered with card */}
            <div className="flex-shrink-0 w-6 flex justify-center">
              <TimelineMarker severity={event.severity} />
            </div>

            {/* Event card */}
            <div className={`flex-1 ${index < events.length - 1 ? 'pb-6' : ''}`}>
              <TimelineEventCard event={event} showPlatform={true} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineByPlatform({ events }: { events: EventWithService[] }) {
  const grouped = groupEventsByPlatform(events);
  const platforms = Array.from(grouped.entries());

  return (
    <div className="space-y-8">
      {platforms.map(([slug, platformEvents]) => {
        const platformInfo = getPlatformInfo(platformEvents);
        if (!platformInfo) return null;

        return (
          <PlatformGroup
            key={slug}
            platformName={platformInfo.name}
            eventCount={platformInfo.eventCount}
          >
            <div className="relative">
              {/* Line from first dot center to last dot center */}
              {platformEvents.length > 1 && (
                <div
                  className="absolute left-[11px] top-[6px] bottom-[6px] w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}

              <div className="space-y-0">
                {platformEvents.map((event, index) => (
                  <div key={event.id} className="flex gap-4 items-center relative">
                    {/* Marker centered with card */}
                    <div className="flex-shrink-0 w-6 flex justify-center">
                      <TimelineMarker severity={event.severity} />
                    </div>

                    {/* Event card */}
                    <div className={`flex-1 ${index < platformEvents.length - 1 ? 'pb-6' : ''}`}>
                      <TimelineEventCard event={event} showPlatform={false} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PlatformGroup>
        );
      })}
    </div>
  );
}
