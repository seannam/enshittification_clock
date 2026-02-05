import type { EventSeverity } from '@/lib/supabase/types';

interface TimelineMarkerProps {
  severity: EventSeverity;
  isLast?: boolean;
}

const markerColors: Record<EventSeverity, string> = {
  minor: 'bg-clock-green',
  moderate: 'bg-clock-yellow',
  significant: 'bg-clock-orange',
  major: 'bg-clock-red',
  critical: 'bg-clock-darkred',
};

const ringColors: Record<EventSeverity, string> = {
  minor: 'ring-clock-green/20',
  moderate: 'ring-clock-yellow/20',
  significant: 'ring-clock-orange/20',
  major: 'ring-clock-red/20',
  critical: 'ring-clock-darkred/20',
};

export function TimelineMarker({ severity, isLast = false }: TimelineMarkerProps) {
  const markerColor = markerColors[severity] || markerColors.moderate;
  const ringColor = ringColors[severity] || ringColors.moderate;

  return (
    <div className="flex flex-col items-center">
      {/* Marker dot */}
      <div
        className={`w-3 h-3 rounded-full ${markerColor} ring-4 ${ringColor} relative z-10`}
        aria-hidden="true"
      />
      {/* Connecting line */}
      {!isLast && (
        <div
          className="w-0.5 flex-1 min-h-[60px] bg-gray-200"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export function TimelineMarkerHorizontal({ severity, isLast = false }: TimelineMarkerProps) {
  const markerColor = markerColors[severity] || markerColors.moderate;
  const ringColor = ringColors[severity] || ringColors.moderate;

  return (
    <div className="flex items-center">
      {/* Marker dot */}
      <div
        className={`w-3 h-3 rounded-full ${markerColor} ring-4 ${ringColor} relative z-10`}
        aria-hidden="true"
      />
      {/* Connecting line */}
      {!isLast && (
        <div
          className="h-0.5 flex-1 min-w-[40px] bg-gray-200"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
