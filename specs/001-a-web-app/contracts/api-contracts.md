# API Contracts: Enshittification Clock Web App

**Feature**: Enshittification Clock Web App
**Date**: 2025-10-13
**Type**: REST API + Supabase Queries

## Overview

This document defines the API contracts for the Enshittification Clock application. The application uses a hybrid approach:
- **Server Components**: Direct Supabase queries for initial page loads (SSR)
- **Client Components**: Supabase client queries for dynamic filtering
- **API Routes**: Optional REST endpoints for specific use cases

All APIs return JSON and follow REST conventions.

---

## Data Access Patterns

### Pattern 1: Server Component (SSR) - Direct Supabase Query
Used for initial page loads with full SEO support.

```typescript
// app/page.tsx (Server Component)
import { createServerClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = createServerClient();
  const { data: events } = await supabase
    .from('enshittification_events')
    .select('*, service:services(*)')
    .order('event_date', { ascending: false })
    .limit(20);

  return <Timeline events={events} />;
}
```

### Pattern 2: Client Component - Supabase Client Query
Used for interactive filtering and dynamic updates.

```typescript
// components/Timeline/Timeline.tsx (Client Component)
'use client';
import { createBrowserClient } from '@/lib/supabase/client';

export function Timeline() {
  const [events, setEvents] = useState([]);
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('enshittification_events')
        .select('*, service:services(*)')
        .order('event_date', { ascending: false });
      setEvents(data);
    };
    fetchEvents();
  }, []);
}
```

---

## API Endpoints (Optional REST Routes)

### 1. Get All Events

**Endpoint**: `GET /api/events`

**Description**: Retrieve all enshittification events with optional filtering

**Query Parameters**:
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `service` | string | No | Filter by service slug | `?service=twitter` |
| `start_date` | string (ISO 8601) | No | Filter events after date | `?start_date=2023-01-01` |
| `end_date` | string (ISO 8601) | No | Filter events before date | `?end_date=2023-12-31` |
| `severity` | string | No | Filter by severity level | `?severity=major` |
| `limit` | number | No | Max results (default: 50) | `?limit=20` |
| `offset` | number | No | Pagination offset (default: 0) | `?offset=20` |

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "service_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Free API tier removed",
      "description": "Twitter removed free API access...",
      "event_date": "2023-02-01",
      "severity": "major",
      "source_url": "https://techcrunch.com/twitter-api-changes",
      "created_at": "2025-10-13T12:00:00Z",
      "updated_at": "2025-10-13T12:00:00Z",
      "service": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Twitter",
        "slug": "twitter",
        "logo_url": "/icons/services/twitter.svg",
        "category": "Social Media"
      }
    }
  ],
  "count": 1,
  "limit": 50,
  "offset": 0
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Invalid severity value. Must be one of: minor, moderate, significant, major, critical"
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Failed to fetch events"
}
```

---

### 2. Get Events by Service

**Endpoint**: `GET /api/services/[slug]/events`

**Description**: Retrieve all events for a specific service

**Path Parameters**:
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `slug` | string | Service slug identifier | `twitter` |

**Success Response** (200 OK):
```json
{
  "service": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Twitter",
    "slug": "twitter",
    "description": "Social media platform for microblogging and real-time updates",
    "logo_url": "/icons/services/twitter.svg",
    "category": "Social Media",
    "created_at": "2025-10-13T12:00:00Z",
    "updated_at": "2025-10-13T12:00:00Z"
  },
  "events": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Free API tier removed",
      "description": "Twitter removed free API access...",
      "event_date": "2023-02-01",
      "severity": "major",
      "source_url": "https://techcrunch.com/twitter-api-changes",
      "created_at": "2025-10-13T12:00:00Z",
      "updated_at": "2025-10-13T12:00:00Z"
    }
  ],
  "event_count": 1
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "Service not found"
}
```

---

### 3. Get All Services

**Endpoint**: `GET /api/services`

**Description**: Retrieve all tracked services with event counts

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Twitter",
      "slug": "twitter",
      "description": "Social media platform for microblogging and real-time updates",
      "logo_url": "/icons/services/twitter.svg",
      "category": "Social Media",
      "event_count": 5,
      "created_at": "2025-10-13T12:00:00Z",
      "updated_at": "2025-10-13T12:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Reddit",
      "slug": "reddit",
      "description": "Community-driven discussion platform",
      "logo_url": "/icons/services/reddit.svg",
      "category": "Social Media",
      "event_count": 3,
      "created_at": "2025-10-13T12:00:00Z",
      "updated_at": "2025-10-13T12:00:00Z"
    }
  ],
  "count": 2
}
```

---

### 4. Get Clock State

**Endpoint**: `GET /api/clock`

**Description**: Calculate and return current clock state based on all events

**Success Response** (200 OK):
```json
{
  "level": 67,
  "position": "Severe enshittification",
  "color": "red",
  "last_updated": "2025-10-13T14:30:00Z",
  "event_count": 45,
  "service_count": 12,
  "breakdown": {
    "by_severity": {
      "minor": 5,
      "moderate": 10,
      "significant": 15,
      "major": 10,
      "critical": 5
    },
    "by_category": {
      "Social Media": 20,
      "Streaming": 12,
      "Tech Platform": 13
    }
  }
}
```

---

## Supabase Query Contracts

### Query 1: Get All Events (with Service)

```typescript
const { data, error } = await supabase
  .from('enshittification_events')
  .select(`
    *,
    service:services (
      id,
      name,
      slug,
      logo_url,
      category
    )
  `)
  .order('event_date', { ascending: false });
```

**Returns**: `EventWithService[]`

---

### Query 2: Get Events by Service Slug

```typescript
const { data, error } = await supabase
  .from('enshittification_events')
  .select(`
    *,
    service:services!inner (
      id,
      name,
      slug,
      logo_url,
      category
    )
  `)
  .eq('service.slug', serviceSlug)
  .order('event_date', { ascending: false});
```

**Returns**: `EventWithService[]`

---

### Query 3: Get Events with Filters

```typescript
let query = supabase
  .from('enshittification_events')
  .select(`
    *,
    service:services (
      id,
      name,
      slug,
      logo_url,
      category
    )
  `);

if (serviceSlug) {
  query = query.eq('service.slug', serviceSlug);
}

if (startDate) {
  query = query.gte('event_date', startDate);
}

if (endDate) {
  query = query.lte('event_date', endDate);
}

if (severity) {
  query = query.eq('severity', severity);
}

const { data, error } = await query.order('event_date', { ascending: false });
```

**Returns**: `EventWithService[]`

---

### Query 4: Get Service by Slug

```typescript
const { data, error } = await supabase
  .from('services')
  .select('*')
  .eq('slug', slug)
  .single();
```

**Returns**: `Service`

---

### Query 5: Get All Services with Event Counts

```typescript
const { data, error } = await supabase
  .from('services')
  .select(`
    *,
    events:enshittification_events(count)
  `)
  .order('name');
```

**Returns**: `Service[]` with `events` count

---

## Error Handling

All API endpoints follow consistent error response structure:

```typescript
interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}
```

**HTTP Status Codes**:
- `200 OK`: Successful request
- `400 Bad Request`: Invalid parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

---

## Rate Limiting

**Note**: Rate limiting is handled by Vercel and Supabase free tier limits:
- Vercel: No specific rate limit (fair use policy)
- Supabase: 500 requests per second per project (free tier)

For production, consider implementing:
- Client-side debouncing for filter inputs
- Caching with Next.js revalidation
- Server-side rate limiting for API routes

---

## Caching Strategy

### Next.js Revalidation

```typescript
// app/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  // Data fetching...
}
```

### Supabase Real-time (Optional for v2)

```typescript
const channel = supabase
  .channel('events-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'enshittification_events' },
    (payload) => {
      // Handle real-time updates
    }
  )
  .subscribe();
```

---

## Security

### Row Level Security (RLS)

All tables have RLS enabled with public read-only access:

```sql
-- Public can only SELECT
CREATE POLICY "Public read access" ON services FOR SELECT USING (true);
CREATE POLICY "Public read access" ON enshittification_events FOR SELECT USING (true);
```

### API Route Protection (Future)

For admin operations (adding events via UI in future versions):

```typescript
// app/api/admin/events/route.ts
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createServerClient();

  // Check if user is authenticated and authorized
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401
    });
  }

  // Admin logic...
}
```

---

## Testing Contracts

### Contract Test Example

```typescript
// tests/contract/events-api.test.ts
import { createClient } from '@supabase/supabase-js';

describe('Events API Contract', () => {
  it('should return events with service data', async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('enshittification_events')
      .select('*, service:services(*)')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('service');
    expect(data[0].service).toHaveProperty('name');
  });
});
```

---

## API Documentation

For interactive API documentation, consider adding Swagger/OpenAPI spec in future versions:

**OpenAPI Spec Location**: `/public/api-docs/openapi.yaml` (future)
**Swagger UI**: Accessible at `/api-docs` (future)

---

## Summary

**Primary Data Access**: Supabase direct queries (Server Components + Client Components)
**Optional REST APIs**: For standardized access patterns and external clients
**Security**: RLS ensures read-only public access
**Performance**: Next.js revalidation + Supabase connection pooling
**Testing**: Contract tests verify query structure and response shape
