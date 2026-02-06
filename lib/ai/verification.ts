// lib/ai/verification.ts
// Cross-verification algorithm for multi-provider research

import type {
  ResearchedEvent,
  ResearchedService,
  ProviderResearchResult,
  VerifiedEvent,
  CrossVerifiedResearchResponse,
  VerificationConfidence,
} from './types';

// Known platform aliases for better matching
const PLATFORM_ALIASES: Record<string, string[]> = {
  facebook: ['fb', 'facebook'],
  instagram: ['ig', 'instagram', 'insta'],
  twitter: ['x', 'twitter'],
  youtube: ['yt', 'youtube'],
  tiktok: ['tiktok', 'tt'],
  snapchat: ['snap', 'snapchat'],
  linkedin: ['li', 'linkedin'],
  reddit: ['reddit'],
  whatsapp: ['whatsapp', 'wa'],
  netflix: ['netflix'],
  spotify: ['spotify'],
  amazon: ['amazon', 'amz'],
  google: ['google'],
  apple: ['apple'],
  microsoft: ['microsoft', 'ms'],
  meta: ['meta'],
};

// Related platforms to filter out (platform -> related platforms to exclude)
const RELATED_PLATFORMS: Record<string, string[]> = {
  facebook: ['instagram', 'whatsapp', 'meta', 'oculus', 'threads'],
  instagram: ['facebook', 'whatsapp', 'meta', 'threads'],
  whatsapp: ['facebook', 'instagram', 'meta'],
  meta: ['facebook', 'instagram', 'whatsapp', 'oculus', 'threads'],
  youtube: ['google'],
  google: ['youtube', 'android', 'chrome'],
};

// Check if text mentions the target platform
export function mentionsPlatform(text: string, platform: string): boolean {
  const normalizedText = text.toLowerCase();
  const normalizedPlatform = platform.toLowerCase();

  // Check direct platform name
  if (normalizedText.includes(normalizedPlatform)) {
    return true;
  }

  // Check aliases
  const aliases = PLATFORM_ALIASES[normalizedPlatform] || [normalizedPlatform];
  return aliases.some((alias) => normalizedText.includes(alias));
}

// Check if event primarily mentions a different related platform
export function mentionsRelatedPlatform(text: string, targetPlatform: string): boolean {
  const normalizedPlatform = targetPlatform.toLowerCase();
  const relatedPlatforms = RELATED_PLATFORMS[normalizedPlatform] || [];

  const normalizedText = text.toLowerCase();

  for (const related of relatedPlatforms) {
    const aliases = PLATFORM_ALIASES[related] || [related];
    for (const alias of aliases) {
      // Check if the related platform is mentioned but target is not
      if (normalizedText.includes(alias) && !mentionsPlatform(text, targetPlatform)) {
        return true;
      }
    }
  }

  return false;
}

// Filter events to only those specifically about the target platform
export function filterEventsForPlatform(
  events: ResearchedEvent[],
  platform: string
): ResearchedEvent[] {
  return events.filter((event) => {
    const combinedText = `${event.title} ${event.description}`;

    // Must mention the target platform
    if (!mentionsPlatform(combinedText, platform)) {
      return false;
    }

    // Should not primarily be about a related but different platform
    if (mentionsRelatedPlatform(combinedText, platform)) {
      return false;
    }

    return true;
  });
}

// Calculate word overlap between two strings
function calculateWordOverlap(text1: string, text2: string): number {
  const words1 = new Set(
    text1
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
  const words2 = new Set(
    text2
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );

  if (words1.size === 0 || words2.size === 0) {
    return 0;
  }

  let overlap = 0;
  for (const word of words1) {
    if (words2.has(word)) {
      overlap++;
    }
  }

  const smallerSize = Math.min(words1.size, words2.size);
  return overlap / smallerSize;
}

// Check if two dates are in the same month
function isSameMonth(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

// Check if two events match (likely the same event)
function eventsMatch(event1: ResearchedEvent, event2: ResearchedEvent): boolean {
  // Must be in the same month
  if (!isSameMonth(event1.event_date, event2.event_date)) {
    return false;
  }

  // Must have same event type or at least one is "Other"
  if (event1.event_type !== event2.event_type &&
      event1.event_type !== 'Other' &&
      event2.event_type !== 'Other') {
    return false;
  }

  // Must have at least 40% title word overlap
  const titleOverlap = calculateWordOverlap(event1.title, event2.title);
  if (titleOverlap >= 0.4) {
    return true;
  }

  // Or significant description overlap with similar severity
  const descOverlap = calculateWordOverlap(event1.description, event2.description);
  const severityMatch = event1.severity === event2.severity;
  if (descOverlap >= 0.5 && severityMatch) {
    return true;
  }

  return false;
}

interface EventGroup {
  events: Array<{ event: ResearchedEvent; providerName: string }>;
  representativeEvent: ResearchedEvent;
}

// Group similar events from different providers
function groupEvents(
  results: ProviderResearchResult[]
): EventGroup[] {
  const groups: EventGroup[] = [];
  const successfulResults = results.filter((r) => r.success && r.data);

  for (const result of successfulResults) {
    if (!result.data) continue;

    for (const event of result.data.events) {
      // Try to find matching group
      let foundGroup = false;
      for (const group of groups) {
        if (eventsMatch(group.representativeEvent, event)) {
          group.events.push({ event, providerName: result.providerName });
          foundGroup = true;
          break;
        }
      }

      // Create new group if no match
      if (!foundGroup) {
        groups.push({
          events: [{ event, providerName: result.providerName }],
          representativeEvent: event,
        });
      }
    }
  }

  return groups;
}

// Determine verification confidence based on provider agreement
function determineConfidence(
  group: EventGroup,
  totalProviders: number
): VerificationConfidence {
  const agreementCount = group.events.length;

  // If only one provider queried, treat as likely
  if (totalProviders === 1) {
    return 'likely';
  }

  // All providers agree or 3+ providers agree
  if (agreementCount >= totalProviders || agreementCount >= 3) {
    return 'verified';
  }

  // 2 providers agree
  if (agreementCount >= 2) {
    return 'likely';
  }

  // Only 1 provider found it (when multiple queried)
  return 'unverified';
}

// Merge service information from multiple providers
function mergeServiceInfo(results: ProviderResearchResult[]): ResearchedService {
  const successfulResults = results.filter((r) => r.success && r.data?.service);

  if (successfulResults.length === 0) {
    return {
      name: 'Unknown',
      description: '',
      category: 'other',
    };
  }

  // Use service info from highest priority (first) successful provider
  return successfulResults[0].data!.service;
}

// Cross-verify and merge results from multiple providers
export function crossVerifyResults(
  results: ProviderResearchResult[],
  targetPlatform: string
): CrossVerifiedResearchResponse {
  const successfulResults = results.filter((r) => r.success && r.data);
  const totalProviders = successfulResults.length;

  // Apply platform filtering to each result
  for (const result of successfulResults) {
    if (result.data) {
      result.data.events = filterEventsForPlatform(result.data.events, targetPlatform);
    }
  }

  // Group similar events
  const groups = groupEvents(results);

  // Convert groups to verified events
  const verifiedEvents: VerifiedEvent[] = groups.map((group) => {
    const confidence = determineConfidence(group, totalProviders);
    const agreedBy = [...new Set(group.events.map((e) => e.providerName))];
    const consensusScore =
      totalProviders > 0 ? Math.round((agreedBy.length / totalProviders) * 100) : 100;

    // Use representative event but merge in best severity/type from group
    const severities = group.events.map((e) => e.event.severity);
    const mostCommonSeverity = getMostCommon(severities) || group.representativeEvent.severity;

    return {
      ...group.representativeEvent,
      severity: mostCommonSeverity,
      verification: {
        confidence,
        agreedBy,
        consensusScore,
      },
    };
  });

  // Sort by date
  verifiedEvents.sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );

  // Filter out unverified events when we have multiple providers
  const filteredEvents =
    totalProviders > 1
      ? verifiedEvents.filter((e) => e.verification.confidence !== 'unverified')
      : verifiedEvents;

  // Calculate overall consensus score
  const verifiedCount = filteredEvents.filter(
    (e) => e.verification.confidence === 'verified'
  ).length;
  const overallConsensus =
    filteredEvents.length > 0
      ? Math.round(
          filteredEvents.reduce((sum, e) => sum + e.verification.consensusScore, 0) /
            filteredEvents.length
        )
      : 0;

  return {
    service: mergeServiceInfo(results),
    events: filteredEvents,
    metadata: {
      providersQueried: results.map((r) => r.providerName),
      providersSucceeded: successfulResults.map((r) => r.providerName),
      consensusScore: overallConsensus,
      verifiedEventCount: verifiedCount,
      totalEventCount: filteredEvents.length,
    },
  };
}

// Helper to get most common item in array
function getMostCommon<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;

  const counts = new Map<T, number>();
  let maxCount = 0;
  let mostCommon = arr[0];

  for (const item of arr) {
    const count = (counts.get(item) || 0) + 1;
    counts.set(item, count);
    if (count > maxCount) {
      maxCount = count;
      mostCommon = item;
    }
  }

  return mostCommon;
}
