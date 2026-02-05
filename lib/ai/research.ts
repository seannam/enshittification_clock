// lib/ai/research.ts
// Claude API integration for researching enshittification events

import Anthropic from '@anthropic-ai/sdk';
import type { ResearchResponse, ResearchResult } from './types';
import type { EventSeverity, EventType } from '../supabase/types';

const VALID_SEVERITIES: EventSeverity[] = ['minor', 'moderate', 'significant', 'major', 'critical'];
const VALID_EVENT_TYPES: EventType[] = ['Paywall', 'Privacy', 'API', 'Ads', 'UX', 'Algorithm', 'Monetization', 'Terms', 'Other'];

const RESEARCH_PROMPT = `You are a researcher documenting "enshittification" events for technology platforms and services.

Enshittification refers to the gradual degradation of a platform's value proposition over time, typically through:
- Increased ads and monetization at the expense of user experience
- Removal of features or making them paid-only
- API restrictions that harm third-party developers
- Privacy invasions or data exploitation
- Anti-competitive practices
- Reduced content quality or creator compensation

For the platform "{platform}", research and return REAL, VERIFIABLE events that represent enshittification. Each event must:
1. Be a real event that actually happened (no speculation)
2. Have a specific date (at least month and year)
3. Have a source URL from reputable news sites, official announcements, or documented sources

Return your response as a JSON object with this exact structure:
{
  "service": {
    "name": "Official Platform Name",
    "description": "Brief description of what the platform does (1-2 sentences)",
    "category": "social_media|streaming|gaming|productivity|ecommerce|other"
  },
  "events": [
    {
      "title": "Brief event title (max 100 chars)",
      "description": "Detailed description of what happened and why it's enshittification (max 500 chars)",
      "event_date": "YYYY-MM-DD",
      "severity": "minor|moderate|significant|major|critical",
      "event_type": "Paywall|Privacy|API|Ads|UX|Algorithm|Monetization|Terms|Other",
      "source_url": "https://... (news article or official announcement)",
      "confidence": "high|medium|low"
    }
  ]
}

Severity guidelines:
- minor: Small inconveniences, minor UI changes
- moderate: Noticeable degradation, some features restricted
- significant: Major feature removal, substantial price increases
- major: Breaking changes affecting many users, severe restrictions
- critical: Platform-defining negative changes, mass user exodus triggers

Event type guidelines:
- Paywall: Features moved behind paywalls, subscription required
- Privacy: Data collection, tracking, privacy policy changes
- API: API restrictions, rate limits, third-party app limitations
- Ads: Increased advertising, intrusive ads, ad-related changes
- UX: User experience degradation, confusing UI, dark patterns
- Algorithm: Feed algorithm changes, engagement manipulation
- Monetization: Price increases, creator payment cuts
- Terms: Terms of service changes, content policy changes
- Other: Anything that doesn't fit the above categories

Only include events you are confident about. Prefer fewer high-quality events over many uncertain ones.
Return 3-10 events, prioritizing the most significant ones.
Events should be ordered from oldest to newest.

IMPORTANT: Return ONLY the JSON object, no markdown formatting or explanation.`;

export async function researchPlatform(platformName: string): Promise<ResearchResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: {
        type: 'api_error',
        message: 'ANTHROPIC_API_KEY environment variable is not set',
      },
    };
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: RESEARCH_PROMPT.replace('{platform}', platformName),
        },
      ],
    });

    // Extract text content from response
    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return {
        success: false,
        error: {
          type: 'parse_error',
          message: 'No text content in response',
        },
      };
    }

    // Parse JSON response
    let parsed: ResearchResponse;
    try {
      parsed = JSON.parse(textContent.text);
    } catch {
      return {
        success: false,
        error: {
          type: 'parse_error',
          message: 'Failed to parse JSON response from Claude',
        },
      };
    }

    // Validate response structure
    const validationError = validateResearchResponse(parsed);
    if (validationError) {
      return {
        success: false,
        error: {
          type: 'validation_error',
          message: validationError,
        },
      };
    }

    // Filter to only high/medium confidence events with valid severities and event types
    parsed.events = parsed.events
      .filter((event) => event.confidence !== 'low')
      .map((event) => ({
        ...event,
        severity: VALID_SEVERITIES.includes(event.severity) ? event.severity : 'moderate',
        event_type: VALID_EVENT_TYPES.includes(event.event_type) ? event.event_type : 'Other',
      }));

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return {
        success: false,
        error: {
          type: 'rate_limit',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: 60,
        },
      };
    }

    if (error instanceof Anthropic.APIError) {
      return {
        success: false,
        error: {
          type: 'api_error',
          message: error.message,
        },
      };
    }

    return {
      success: false,
      error: {
        type: 'api_error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    };
  }
}

function validateResearchResponse(response: unknown): string | null {
  if (!response || typeof response !== 'object') {
    return 'Response is not an object';
  }

  const r = response as Record<string, unknown>;

  // Validate service
  if (!r.service || typeof r.service !== 'object') {
    return 'Missing or invalid service object';
  }

  const service = r.service as Record<string, unknown>;
  if (typeof service.name !== 'string' || !service.name.trim()) {
    return 'Service name is required';
  }
  if (typeof service.description !== 'string') {
    return 'Service description is required';
  }
  if (typeof service.category !== 'string') {
    return 'Service category is required';
  }

  // Validate events
  if (!Array.isArray(r.events)) {
    return 'Events must be an array';
  }

  if (r.events.length === 0) {
    return 'At least one event is required';
  }

  for (let i = 0; i < r.events.length; i++) {
    const event = r.events[i] as Record<string, unknown>;
    const eventError = validateEvent(event, i);
    if (eventError) {
      return eventError;
    }
  }

  return null;
}

function validateEvent(event: Record<string, unknown>, index: number): string | null {
  if (!event || typeof event !== 'object') {
    return `Event ${index} is not an object`;
  }

  if (typeof event.title !== 'string' || !event.title.trim()) {
    return `Event ${index} is missing title`;
  }

  if (typeof event.description !== 'string' || !event.description.trim()) {
    return `Event ${index} is missing description`;
  }

  if (typeof event.event_date !== 'string' || !isValidDate(event.event_date)) {
    return `Event ${index} has invalid date format (expected YYYY-MM-DD)`;
  }

  if (typeof event.severity !== 'string') {
    return `Event ${index} is missing severity`;
  }

  return null;
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date <= new Date();
}
