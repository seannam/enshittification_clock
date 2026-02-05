import type { EnshittificationEvent, EventSeverity, ClockState } from '../supabase/types';
import { SEVERITY_SCORES } from '../supabase/types';

/**
 * Get the numeric score for an event severity
 */
export function getSeverityScore(severity: EventSeverity): number {
  return SEVERITY_SCORES[severity];
}

/**
 * Calculate time decay factor based on event age in years
 * - Recent events (< 1 year) have full weight (1.0)
 * - Older events have reduced weight
 */
export function getDecayFactor(ageYears: number): number {
  if (ageYears < 1) return 1.0;
  if (ageYears < 2) return 0.8;
  if (ageYears < 3) return 0.6;
  return 0.4;
}

/**
 * Get years between two dates
 */
function getYearsBetween(dateString: string, now: Date): number {
  const eventDate = new Date(dateString);
  const diffMs = now.getTime() - eventDate.getTime();
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, diffYears);
}

/**
 * Get position label for a clock level
 */
export function getPositionLabel(level: number): string {
  if (level <= 20) return 'Early warning';
  if (level <= 40) return 'Noticeable decline';
  if (level <= 60) return 'Significant degradation';
  if (level <= 80) return 'Severe enshittification';
  return 'Critical / Terminal';
}

/**
 * Get color for a clock level
 */
export function getColorForLevel(level: number): string {
  if (level <= 20) return 'green';
  if (level <= 40) return 'yellow';
  if (level <= 60) return 'orange';
  if (level <= 80) return 'red';
  return 'darkred';
}

/**
 * Calculate the overall clock state from all events
 * This is the core algorithm that determines the "enshittification level"
 */
export function calculateClockState(events: EnshittificationEvent[]): ClockState {
  const now = new Date();

  if (events.length === 0) {
    return {
      level: 0,
      position: getPositionLabel(0),
      color: getColorForLevel(0),
      lastUpdated: now,
      eventCount: 0,
      serviceCount: 0,
    };
  }

  // Calculate total weighted score
  let totalScore = 0;
  events.forEach((event) => {
    const severityScore = getSeverityScore(event.severity);
    const ageYears = getYearsBetween(event.event_date, now);
    const decayFactor = getDecayFactor(ageYears);
    totalScore += severityScore * decayFactor;
  });

  // Normalize to 0-100 scale
  // Adjust normalization constant based on typical event counts
  // With ~50 events of mixed severity, we want to hit the 60-80 range
  const normalizationConstant = 2;
  const level = Math.min(100, Math.round((totalScore / normalizationConstant) * 10));

  // Count unique services
  const uniqueServices = new Set(events.map((e) => e.service_id));

  return {
    level,
    position: getPositionLabel(level),
    color: getColorForLevel(level),
    lastUpdated: now,
    eventCount: events.length,
    serviceCount: uniqueServices.size,
  };
}
