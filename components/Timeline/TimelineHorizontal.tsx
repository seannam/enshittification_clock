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

// Card width: 288px (w-72), Gap: 16px (gap-4)
// Line width = (n-1) * (cardWidth + gap) = (n-1) * 304px
const CARD_WIDTH = 288;
const GAP_WIDTH = 16;

function HorizontalUnified({ events }: { events: EventWithService[] }) {
  const lineWidth = (events.length - 1) * (CARD_WIDTH + GAP_WIDTH);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="px-4">
        <div className="relative flex gap-4">
          {/* Line spans from first dot center to last dot center */}
          {events.length > 1 && (
            <div
              className="absolute left-[144px] top-[13px] h-0.5 bg-gray-200"
              style={{ width: lineWidth }}
              aria-hidden="true"
            />
          )}
          {events.map((event) => (
            <div key={event.id} className="flex flex-col flex-shrink-0 w-72">
              {/* Centered marker with top padding to prevent ring clipping */}
              <div className="flex justify-center mb-2 pt-2">
                <TimelineMarkerHorizontal severity={event.severity} />
              </div>
              {/* Event card */}
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
              <div className="px-4">
                <div className="relative flex gap-4">
                  {/* Line spans from first dot center to last dot center */}
                  {platformEvents.length > 1 && (
                    <div
                      className="absolute left-[144px] top-[13px] h-0.5 bg-gray-200"
                      style={{ width: (platformEvents.length - 1) * (CARD_WIDTH + GAP_WIDTH) }}
                      aria-hidden="true"
                    />
                  )}
                  {platformEvents.map((event) => (
                    <div key={event.id} className="flex flex-col flex-shrink-0 w-72">
                      {/* Centered marker with top padding to prevent ring clipping */}
                      <div className="flex justify-center mb-2 pt-2">
                        <TimelineMarkerHorizontal severity={event.severity} />
                      </div>
                      {/* Event card */}
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
