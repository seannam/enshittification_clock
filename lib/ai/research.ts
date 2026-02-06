// lib/ai/research.ts
// AI integration for researching enshittification events with multi-provider support

import Anthropic from '@anthropic-ai/sdk';
import type {
  ResearchResponse,
  ResearchResult,
  AIProviderConfig,
  ProviderResearchResult,
  CrossVerifiedResearchResult,
} from './types';
import type { EventSeverity, EventType } from '../supabase/types';
import { loadProviderConfigs } from './config';
import { createProvider } from './providers';
import { crossVerifyResults, filterEventsForPlatform } from './verification';

const VALID_SEVERITIES: EventSeverity[] = ['minor', 'moderate', 'significant', 'major', 'critical'];
const VALID_EVENT_TYPES: EventType[] = ['Paywall', 'Privacy', 'API', 'Ads', 'UX', 'Algorithm', 'Monetization', 'Terms', 'Other'];

const RESEARCH_PROMPT = `You are a researcher documenting "enshittification" events for technology platforms and services.

CRITICAL INSTRUCTIONS:
- You are researching ONLY the platform "{platform}"
- DO NOT include events from parent companies, subsidiaries, or related platforms
- For example: If researching "Facebook", do NOT include Instagram, WhatsApp, or Meta corporate events
- If researching "Instagram", do NOT include Facebook or WhatsApp events
- Each event MUST be specifically about {platform} itself

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
4. Be specifically about {platform} - NOT about related or parent company platforms

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

VALIDATION: Before including any event, verify it mentions "{platform}" by name.
REMINDER: Only include events specifically about {platform}. Exclude events about related platforms.

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

// Query a single provider and return result
async function queryProvider(
  config: AIProviderConfig,
  platformName: string
): Promise<ProviderResearchResult> {
  const startTime = Date.now();
  const provider = createProvider(config);
  const prompt = RESEARCH_PROMPT.replace(/\{platform\}/g, platformName);

  try {
    const responseText = await provider.query(prompt);

    // Parse JSON response
    let parsed: ResearchResponse;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      return {
        providerId: config.id,
        providerName: config.name,
        success: false,
        error: {
          type: 'parse_error',
          message: 'Failed to parse JSON response',
        },
        durationMs: Date.now() - startTime,
      };
    }

    // Validate response structure
    const validationError = validateResearchResponse(parsed);
    if (validationError) {
      return {
        providerId: config.id,
        providerName: config.name,
        success: false,
        error: {
          type: 'validation_error',
          message: validationError,
        },
        durationMs: Date.now() - startTime,
      };
    }

    // Filter and validate events
    parsed.events = parsed.events
      .filter((event) => event.confidence !== 'low')
      .map((event) => ({
        ...event,
        severity: VALID_SEVERITIES.includes(event.severity) ? event.severity : 'moderate',
        event_type: VALID_EVENT_TYPES.includes(event.event_type) ? event.event_type : 'Other',
      }));

    // Apply platform filtering
    parsed.events = filterEventsForPlatform(parsed.events, platformName);

    return {
      providerId: config.id,
      providerName: config.name,
      success: true,
      data: parsed,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      providerId: config.id,
      providerName: config.name,
      success: false,
      error: {
        type: 'api_error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      durationMs: Date.now() - startTime,
    };
  }
}

// Research platform using multiple providers with cross-verification
export async function researchPlatformMultiProvider(
  platformName: string
): Promise<CrossVerifiedResearchResult> {
  // Load enabled providers from database (with env var fallback)
  const providers = await loadProviderConfigs();

  if (providers.length === 0) {
    return {
      success: false,
      error: {
        type: 'api_error',
        message: 'No AI providers configured. Add providers in admin settings or set ANTHROPIC_API_KEY.',
      },
    };
  }

  // Query all providers in parallel
  const results = await Promise.all(
    providers.map((config) => queryProvider(config, platformName))
  );

  // Check if at least one provider succeeded
  const successfulResults = results.filter((r) => r.success);
  if (successfulResults.length === 0) {
    // Return the first error
    const firstError = results[0]?.error || {
      type: 'api_error' as const,
      message: 'All providers failed',
    };
    return {
      success: false,
      error: firstError,
    };
  }

  // Cross-verify results from all providers
  const verifiedResponse = crossVerifyResults(results, platformName);

  // Check if we have any events after verification
  if (verifiedResponse.events.length === 0) {
    return {
      success: false,
      error: {
        type: 'validation_error',
        message: 'No valid events found after cross-verification',
      },
    };
  }

  return {
    success: true,
    data: verifiedResponse,
  };
}
