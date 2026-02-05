import type { EventWithService, EventSeverity } from '@/lib/supabase/types';
import { SEVERITY_COLORS } from '@/lib/supabase/types';
import { formatEventDateFull } from '@/lib/utils/timeline-helpers';

interface TimelineEventCardProps {
  event: EventWithService;
  showPlatform?: boolean;
}

export function TimelineEventCard({ event, showPlatform = false }: TimelineEventCardProps) {
  const badgeClasses = SEVERITY_COLORS[event.severity as EventSeverity] || SEVERITY_COLORS.moderate;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header with date and badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <time className="text-sm text-gray-500" dateTime={event.event_date}>
          {formatEventDateFull(event.event_date)}
        </time>
        {event.event_type && (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badgeClasses}`}>
            {event.event_type}
          </span>
        )}
      </div>

      {/* Platform name (shown in unified view) */}
      {showPlatform && (
        <p className="text-sm font-semibold text-gray-900 mb-1">
          {event.service.name}
        </p>
      )}

      {/* Title */}
      <h4 className="text-base font-medium text-gray-900 mb-2">
        {event.title}
      </h4>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {event.description}
      </p>

      {/* Footer with severity indicator and source link */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendIcon className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500 capitalize">{event.severity}</span>
        </div>
        {event.source_url && (
          <a
            href={event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            Source
          </a>
        )}
      </div>
    </div>
  );
}

function TrendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}
