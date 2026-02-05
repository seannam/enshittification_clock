// lib/ai/types.ts
// Types for AI research responses

import type { EventSeverity, EventType } from '../supabase/types';

export interface ResearchedEvent {
  title: string;
  description: string;
  event_date: string; // YYYY-MM-DD format
  severity: EventSeverity;
  event_type: EventType;
  source_url: string | null;
  confidence: 'high' | 'medium' | 'low';
}

export interface ResearchedService {
  name: string;
  description: string;
  category: string;
}

export interface ResearchResponse {
  service: ResearchedService;
  events: ResearchedEvent[];
}

export interface ResearchError {
  type: 'api_error' | 'parse_error' | 'validation_error' | 'rate_limit';
  message: string;
  retryAfter?: number; // seconds
}

export type ResearchResult =
  | { success: true; data: ResearchResponse }
  | { success: false; error: ResearchError };
