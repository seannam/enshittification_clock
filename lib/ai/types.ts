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

// AI Provider types
export interface AIProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string; // Decrypted at runtime
  model: string;
  enabled: boolean;
  priority: number;
  maxTokens: number;
  temperature: number;
}

// Result from a single provider query
export interface ProviderResearchResult {
  providerId: string;
  providerName: string;
  success: boolean;
  data?: ResearchResponse;
  error?: ResearchError;
  durationMs: number;
}

// Verification confidence levels
export type VerificationConfidence = 'verified' | 'likely' | 'unverified' | 'disputed';

// Event with verification metadata
export interface VerifiedEvent extends ResearchedEvent {
  verification: {
    confidence: VerificationConfidence;
    agreedBy: string[]; // Provider names that agree
    conflictsWith?: string[]; // Provider names with conflicting info
    consensusScore: number; // 0-100, percentage of providers agreeing
  };
}

// Cross-verified research response
export interface CrossVerifiedResearchResponse {
  service: ResearchedService;
  events: VerifiedEvent[];
  metadata: {
    providersQueried: string[];
    providersSucceeded: string[];
    consensusScore: number; // Overall consensus 0-100
    verifiedEventCount: number;
    totalEventCount: number;
  };
}

export type CrossVerifiedResearchResult =
  | { success: true; data: CrossVerifiedResearchResponse }
  | { success: false; error: ResearchError };
