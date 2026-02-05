import type { EventSeverity } from '@/lib/supabase/types';

interface TimelineMarkerProps {
  severity: EventSeverity;
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

export function TimelineMarker({ severity }: TimelineMarkerProps) {
  const markerColor = markerColors[severity] || markerColors.moderate;
  const ringColor = ringColors[severity] || ringColors.moderate;

  return (
    <div
      className={`w-3 h-3 rounded-full ${markerColor} ring-4 ${ringColor} relative z-10 flex-shrink-0`}
      aria-hidden="true"
    />
  );
}

export function TimelineMarkerHorizontal({ severity }: TimelineMarkerProps) {
  const markerColor = markerColors[severity] || markerColors.moderate;
  const ringColor = ringColors[severity] || ringColors.moderate;

  return (
    <div
      className={`w-3 h-3 rounded-full ${markerColor} ring-4 ${ringColor} relative z-10 flex-shrink-0`}
      aria-hidden="true"
    />
  );
}
