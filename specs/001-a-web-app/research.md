# Research: Enshittification Clock Web App

**Feature**: Enshittification Clock Web App
**Date**: 2025-10-13
**Purpose**: Resolve technical unknowns and document technology decisions

## Overview

This document captures research findings and technical decisions for the Enshittification Clock web application. The primary research areas are visualization library selection, clock calculation methodology, and Next.js + Supabase best practices.

## Research Questions

### 1. Visualization Library for Custom Clock

**Question**: Which visualization library best balances simplicity with custom clock requirements?

**Options Evaluated**:

1. **Recharts**
   - Pros: Simple API, React-native, good for standard charts, small bundle size (~100KB)
   - Cons: Limited for custom shapes, not ideal for analog clock visualization
   - Verdict: ❌ Not suitable - designed for bar/line/pie charts, not custom clock faces

2. **D3.js**
   - Pros: Extremely flexible, powerful, industry standard for custom visualizations
   - Cons: Large bundle size (~250KB), steep learning curve, imperative API conflicts with React's declarative model
   - Verdict: ⚠️ Overkill - Too complex for a single clock visualization

3. **SVG + CSS (Native)**
   - Pros: No dependencies, full control, lightweight, performant, declarative
   - Cons: Requires manual implementation
   - Verdict: ✅ **RECOMMENDED** - Aligns with Principle IV (Simplicity Over Complexity)

4. **Framer Motion**
   - Pros: Excellent animations, React-native, good for interactive visualizations
   - Cons: Adds ~100KB, primarily an animation library
   - Verdict: ⚠️ Consider if animations needed later

**Decision**: **Native SVG + CSS with TypeScript**

**Rationale**:
- Aligns with Constitution Principle IV (Simplicity Over Complexity): No dependency needed for what can be done with platform primitives
- Clock is a relatively simple visualization (circular path, rotating hand/indicator)
- Full control over styling and responsiveness
- Zero bundle size cost
- SVG is accessible (screen readers, semantic markup)
- React can declaratively render SVG based on clock state
- CSS animations for smooth transitions if needed

**Implementation Approach**:
- Create `ClockFace.tsx` component rendering SVG circle with hour markers
- Calculate rotation angle based on enshittification level (0-100% → 0-360°)
- Use CSS transforms for smooth visual updates
- Tailwind CSS for colors and responsive sizing

**Alternatives Considered**:
- D3.js: Rejected due to bundle size and complexity for single use case
- Recharts: Rejected due to chart-centric API not suitable for analog clock
- Chart.js: Similar limitations to Recharts

---

### 2. Clock Calculation Methodology

**Question**: How should the clock position/level be calculated from event data?

**Decision**: **Weighted severity score with time decay**

**Rationale**:
Each event has a severity level (1-5), and the clock position reflects the cumulative "damage" across all services. Recent events have more weight.

**Formula**:
```
Clock Level (0-100) =
  (Sum of all event severity scores × time decay factor) / normalization constant

Time Decay Factor = 1.0 for events < 1 year old
                   0.8 for events 1-2 years old
                   0.6 for events 2-3 years old
                   0.4 for events 3+ years old

Normalization constant = adjusted based on typical event count to keep level in 0-100 range
```

**Clock Visualization Mapping**:
- 0-20: Early warning (green, 1-4 o'clock position)
- 21-40: Noticeable decline (yellow, 4-7 o'clock)
- 41-60: Significant degradation (orange, 7-9 o'clock)
- 61-80: Severe enshittification (red, 9-11 o'clock)
- 81-100: Critical/terminal (dark red, 11-12 o'clock → "midnight")

**Alternatives Considered**:
- Simple event count: Rejected - doesn't account for severity
- Average severity: Rejected - doesn't scale with number of services
- Per-service then aggregate: Considered for v2 if service-specific clocks added

---

### 3. Next.js 14 App Router Best Practices

**Research Focus**: Server Components, data fetching, and route organization

**Key Findings**:

**Server Components (RSC)**:
- Use Server Components by default for data fetching (faster initial load)
- Client Components (`'use client'`) only for interactivity (filters, animations)
- Timeline can be Server Component, filters are Client Component

**Data Fetching Patterns**:
- Server-side: Direct Supabase queries in Server Components (`lib/supabase/server.ts`)
- Client-side: Supabase client (`lib/supabase/client.ts`) for dynamic filtering
- Use `revalidate` for ISR (Incremental Static Regeneration) on event pages

**Route Organization**:
```
app/
├── page.tsx              # Home page (Server Component) - clock + timeline
├── layout.tsx            # Root layout with <html>, metadata
├── services/
│   └── [slug]/
│       └── page.tsx      # Service detail (Server Component)
└── api/
    └── events/
        └── route.ts      # Optional: API route if client needs structured data
```

**Decision**: Use Server Components for initial render, Client Components for interactive filters

**Rationale**:
- Server Components reduce client JS bundle size
- Timeline events loaded server-side for better SEO and performance
- Filters use client-side state and update URL params for shareability

---

### 4. Supabase Schema Design Best Practices

**Research Focus**: PostgreSQL schema for events and services

**Key Findings**:

**Database Schema Recommendations**:
1. Use UUIDs for primary keys (better for distributed systems)
2. Add `created_at` and `updated_at` timestamps (audit trail)
3. Use enums for severity levels (type safety)
4. Add indexes on frequently queried columns (service_id, event_date)
5. Use Row Level Security (RLS) for read-only public access

**Schema Preview**:
```sql
-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Severity enum
CREATE TYPE event_severity AS ENUM ('minor', 'moderate', 'significant', 'major', 'critical');

-- Events table
CREATE TABLE enshittification_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  severity event_severity NOT NULL,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_events_service_id ON enshittification_events(service_id);
CREATE INDEX idx_events_date ON enshittification_events(event_date DESC);
CREATE INDEX idx_events_severity ON enshittification_events(severity);

-- RLS policies (read-only public access)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE enshittification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON services FOR SELECT USING (true);
CREATE POLICY "Public read access" ON enshittification_events FOR SELECT USING (true);
```

---

### 5. URL State Management for Shareable Filters

**Question**: How to implement URL parameter-based filtering?

**Decision**: **Use Next.js `useSearchParams` + `useRouter` for client-side filter state**

**Implementation Approach**:
```typescript
// lib/utils/url-state.ts
import { useRouter, useSearchParams } from 'next/navigation';

export function useFilterState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const serviceFilter = searchParams.get('service');
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');

  const setFilters = (filters: { service?: string, start?: string, end?: string }) => {
    const params = new URLSearchParams(searchParams);
    if (filters.service) params.set('service', filters.service);
    if (filters.start) params.set('start', filters.start);
    if (filters.end) params.set('end', filters.end);
    router.push(`/?${params.toString()}`);
  };

  return { serviceFilter, startDate, endDate, setFilters };
}
```

**Rationale**:
- Leverages Next.js built-in hooks
- URL updates trigger re-render
- URLs are shareable and bookmarkable
- Browser back/forward works correctly

---

### 6. File-Based Event Seeding Workflow

**Question**: How to manage event data through file edits?

**Decision**: **JSON seed file + Supabase migration script**

**Workflow**:
1. Maintain `lib/data/seed-events.json` with event data
2. JSON schema validation (optional: use Zod for type safety)
3. Supabase migration script reads JSON and inserts into database
4. CI/CD: Run migration on deployment if seed data changed

**seed-events.json Structure**:
```json
{
  "services": [
    {
      "name": "Twitter",
      "slug": "twitter",
      "description": "Social media platform",
      "category": "Social Media"
    }
  ],
  "events": [
    {
      "service_slug": "twitter",
      "title": "API access restricted",
      "description": "Free API tier removed, forcing developers to paid plans",
      "event_date": "2023-02-01",
      "severity": "major",
      "source_url": "https://example.com/source"
    }
  ]
}
```

**Migration Script** (`supabase/seed.sql`):
- Reads JSON file
- Upserts services (insert or update)
- Inserts events with foreign key references
- Idempotent (can run multiple times safely)

---

## Technology Stack Summary

**Frontend**:
- Next.js 14+ (App Router)
- React 18+
- TypeScript 5.x
- Tailwind CSS 3.x
- Native SVG for clock visualization

**Backend/Database**:
- Supabase (PostgreSQL + Auth)
- Server Components for data fetching
- API routes for client-side data needs

**Testing**:
- Vitest (unit tests)
- React Testing Library (component tests)
- Playwright (E2E tests)

**Deployment**:
- Vercel (hosting + edge network)
- Vercel Analytics (monitoring)
- GitHub Actions (CI/CD)

**Dependencies Justified**:
- Next.js: Industry standard, Vercel-optimized, excellent DX
- Supabase: Reduces backend complexity, managed PostgreSQL
- Tailwind: Rapid styling, small bundle with purging
- date-fns: Lightweight date library (alternative to Moment.js)
- No visualization library: Native SVG sufficient

---

## Open Questions / Future Considerations

### For v1:
- ✅ All critical questions resolved

### For v2 (Future):
- Consider per-service clocks in addition to global clock
- Consider event submission form for community contributions (requires auth + moderation)
- Consider GraphQL if REST endpoints become too numerous
- Consider adding event categories/tags for more granular filtering

---

## References

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [SVG Documentation (MDN)](https://developer.mozilla.org/en-US/docs/Web/SVG)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- Constitution Principle IV: Simplicity Over Complexity (plan.md:75-83)
