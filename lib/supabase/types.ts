// lib/supabase/types.ts

export type EventSeverity = 'minor' | 'moderate' | 'significant' | 'major' | 'critical';

export type EventType = 'Paywall' | 'Privacy' | 'API' | 'Ads' | 'UX' | 'Algorithm' | 'Monetization' | 'Terms' | 'Other';

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnshittificationEvent {
  id: string;
  service_id: string;
  title: string;
  description: string;
  event_date: string; // ISO date string
  severity: EventSeverity;
  event_type?: EventType | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

// Joined type for queries that include service data
export interface EventWithService extends EnshittificationEvent {
  service: Service;
}

// Clock state (calculated, not from DB)
export interface ClockState {
  level: number; // 0-100
  position: string;
  color: string;
  lastUpdated: Date;
  eventCount: number;
  serviceCount: number;
}

// Severity score mapping
export const SEVERITY_SCORES: Record<EventSeverity, number> = {
  minor: 1,
  moderate: 2,
  significant: 3,
  major: 4,
  critical: 5,
};

// Severity colors for badges (Tailwind classes)
export const SEVERITY_COLORS: Record<EventSeverity, string> = {
  minor: 'bg-clock-green text-white',
  moderate: 'bg-clock-yellow text-gray-900',
  significant: 'bg-clock-orange text-white',
  major: 'bg-clock-red text-white',
  critical: 'bg-clock-darkred text-white',
};
