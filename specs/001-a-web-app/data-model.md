# Data Model: Enshittification Clock Web App

**Feature**: Enshittification Clock Web App
**Date**: 2025-10-13
**Database**: Supabase (PostgreSQL)

## Overview

This document defines the data model for the Enshittification Clock application. The model consists of two primary entities: Services and Enshittification Events, with a one-to-many relationship.

## Entity Relationship Diagram

```
┌─────────────────────┐
│     services        │
├─────────────────────┤
│ id (PK)             │◄──────┐
│ name                │       │
│ slug (UNIQUE)       │       │
│ description         │       │
│ logo_url            │       │
│ category            │       │  One-to-Many
│ created_at          │       │
│ updated_at          │       │
└─────────────────────┘       │
                              │
                              │
┌─────────────────────────────┼───┐
│  enshittification_events    │   │
├─────────────────────────────┼───┤
│ id (PK)                     │   │
│ service_id (FK) ────────────┘   │
│ title                           │
│ description                     │
│ event_date                      │
│ severity                        │
│ source_url                      │
│ created_at                      │
│ updated_at                      │
└─────────────────────────────────┘
```

## Entities

### 1. Service

Represents a major app or platform being tracked (e.g., Twitter, Reddit, Netflix).

**Table Name**: `services`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| `name` | TEXT | NOT NULL | Display name (e.g., "Twitter", "Reddit") |
| `slug` | TEXT | UNIQUE, NOT NULL | URL-safe identifier (e.g., "twitter", "reddit") |
| `description` | TEXT | NULLABLE | Brief description of the service |
| `logo_url` | TEXT | NULLABLE | URL to service logo/icon |
| `category` | TEXT | NULLABLE | Service category (e.g., "Social Media", "Streaming", "Tech Platform") |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- Primary key index on `id` (automatic)
- Unique index on `slug` (for lookups by URL parameter)

**Validation Rules**:
- `name`: Must not be empty, max 100 characters
- `slug`: Must be lowercase alphanumeric with hyphens only, max 50 characters
- `logo_url`: Must be valid URL if provided
- `category`: Max 50 characters

**Example Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Twitter",
  "slug": "twitter",
  "description": "Social media platform for microblogging and real-time updates",
  "logo_url": "/icons/services/twitter.svg",
  "category": "Social Media",
  "created_at": "2025-10-13T12:00:00Z",
  "updated_at": "2025-10-13T12:00:00Z"
}
```

---

### 2. Enshittification Event

Represents a specific change or milestone that degraded a platform.

**Table Name**: `enshittification_events`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| `service_id` | UUID | FOREIGN KEY → services(id), NOT NULL | Reference to service |
| `title` | TEXT | NOT NULL | Short event title (e.g., "API access restricted") |
| `description` | TEXT | NOT NULL | Detailed description of what changed |
| `event_date` | DATE | NOT NULL | Date when event occurred |
| `severity` | event_severity | NOT NULL | Impact level (enum: minor, moderate, significant, major, critical) |
| `source_url` | TEXT | NULLABLE | Link to source/reference |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Enum Type**: `event_severity`
```sql
CREATE TYPE event_severity AS ENUM (
  'minor',       -- Score: 1 (minor annoyance)
  'moderate',    -- Score: 2 (noticeable decline)
  'significant', -- Score: 3 (meaningful degradation)
  'major',       -- Score: 4 (serious problem)
  'critical'     -- Score: 5 (severe enshittification)
);
```

**Indexes**:
- Primary key index on `id` (automatic)
- Foreign key index on `service_id` (automatic)
- Index on `event_date DESC` (for chronological queries)
- Index on `severity` (for filtering by impact)

**Validation Rules**:
- `title`: Must not be empty, max 200 characters
- `description`: Must not be empty, max 2000 characters
- `event_date`: Must not be future date
- `severity`: Must be one of enum values
- `source_url`: Must be valid URL if provided

**Example Data**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "service_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Free API tier removed",
  "description": "Twitter removed free API access, forcing developers and researchers to paid plans starting at $100/month, effectively killing many third-party tools and academic research projects.",
  "event_date": "2023-02-01",
  "severity": "major",
  "source_url": "https://techcrunch.com/twitter-api-changes",
  "created_at": "2025-10-13T12:00:00Z",
  "updated_at": "2025-10-13T12:00:00Z"
}
```

---

### 3. Clock State (Calculated, Not Stored)

Represents the overall enshittification level calculated from all events. This is not a database table but a calculated value derived from events.

**Calculated Fields**:
- `level`: Number (0-100) - Current enshittification level
- `position`: String - Clock position description (e.g., "Significant degradation")
- `color`: String - Visual indicator color (green, yellow, orange, red, dark-red)
- `last_updated`: Timestamp - When calculation was last performed
- `event_count`: Number - Total events contributing to score
- `service_count`: Number - Total services tracked

**Calculation Formula** (from research.md):
```typescript
interface ClockState {
  level: number; // 0-100
  position: string;
  color: string;
  lastUpdated: Date;
  eventCount: number;
  serviceCount: number;
}

function calculateClockState(events: Event[]): ClockState {
  const now = new Date();
  let totalScore = 0;

  events.forEach(event => {
    const severityScore = getSeverityScore(event.severity); // 1-5
    const ageYears = getYearsAgo(event.event_date, now);
    const decayFactor = getDecayFactor(ageYears);
    totalScore += severityScore * decayFactor;
  });

  // Normalize to 0-100 scale (adjust constant based on expected event volume)
  const level = Math.min(100, (totalScore / 2) * 10);

  return {
    level,
    position: getPositionLabel(level),
    color: getColorForLevel(level),
    lastUpdated: now,
    eventCount: events.length,
    serviceCount: new Set(events.map(e => e.service_id)).size
  };
}

function getSeverityScore(severity: EventSeverity): number {
  const scores = { minor: 1, moderate: 2, significant: 3, major: 4, critical: 5 };
  return scores[severity];
}

function getDecayFactor(ageYears: number): number {
  if (ageYears < 1) return 1.0;
  if (ageYears < 2) return 0.8;
  if (ageYears < 3) return 0.6;
  return 0.4;
}

function getPositionLabel(level: number): string {
  if (level <= 20) return "Early warning";
  if (level <= 40) return "Noticeable decline";
  if (level <= 60) return "Significant degradation";
  if (level <= 80) return "Severe enshittification";
  return "Critical / Terminal";
}

function getColorForLevel(level: number): string {
  if (level <= 20) return "green";
  if (level <= 40) return "yellow";
  if (level <= 60) return "orange";
  if (level <= 80) return "red";
  return "dark-red";
}
```

---

## Database Schema (SQL)

Complete Supabase migration for creating the schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create event severity enum
CREATE TYPE event_severity AS ENUM ('minor', 'moderate', 'significant', 'major', 'critical');

-- Create services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$' AND char_length(slug) <= 50),
  description TEXT,
  logo_url TEXT,
  category TEXT CHECK (char_length(category) <= 50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enshittification_events table
CREATE TABLE enshittification_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  description TEXT NOT NULL CHECK (char_length(description) <= 2000),
  event_date DATE NOT NULL CHECK (event_date <= CURRENT_DATE),
  severity event_severity NOT NULL,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_events_service_id ON enshittification_events(service_id);
CREATE INDEX idx_events_date ON enshittification_events(event_date DESC);
CREATE INDEX idx_events_severity ON enshittification_events(severity);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_category ON services(category);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE enshittification_events ENABLE ROW LEVEL SECURITY;

-- Create read-only public access policies
CREATE POLICY "Public read access to services"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Public read access to events"
  ON enshittification_events FOR SELECT
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON enshittification_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## TypeScript Types

Generated from database schema for type safety:

```typescript
// lib/supabase/types.ts

export type EventSeverity = 'minor' | 'moderate' | 'significant' | 'major' | 'critical';

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
```

---

## Seed Data Structure

JSON file structure for seeding the database (`lib/data/seed-events.json`):

```json
{
  "services": [
    {
      "name": "Twitter",
      "slug": "twitter",
      "description": "Social media platform for microblogging and real-time updates",
      "category": "Social Media",
      "logo_url": "/icons/services/twitter.svg"
    },
    {
      "name": "Reddit",
      "slug": "reddit",
      "description": "Community-driven discussion platform",
      "category": "Social Media",
      "logo_url": "/icons/services/reddit.svg"
    }
  ],
  "events": [
    {
      "service_slug": "twitter",
      "title": "Free API tier removed",
      "description": "Twitter removed free API access, forcing developers and researchers to paid plans starting at $100/month.",
      "event_date": "2023-02-01",
      "severity": "major",
      "source_url": "https://techcrunch.com/twitter-api-changes"
    },
    {
      "service_slug": "reddit",
      "title": "Third-party app API pricing made prohibitively expensive",
      "description": "Reddit announced API pricing that would cost popular third-party apps like Apollo over $20 million annually, effectively killing them.",
      "event_date": "2023-06-01",
      "severity": "critical",
      "source_url": "https://reddit.com/r/apolloapp"
    }
  ]
}
```

---

## Query Patterns

Common query patterns for the application:

### 1. Get all events with service data (chronological)
```sql
SELECT e.*, s.name as service_name, s.slug as service_slug, s.logo_url
FROM enshittification_events e
JOIN services s ON e.service_id = s.id
ORDER BY e.event_date DESC;
```

### 2. Get events for specific service
```sql
SELECT e.*
FROM enshittification_events e
JOIN services s ON e.service_id = s.id
WHERE s.slug = $1
ORDER BY e.event_date DESC;
```

### 3. Get events by date range
```sql
SELECT e.*, s.name as service_name
FROM enshittification_events e
JOIN services s ON e.service_id = s.id
WHERE e.event_date BETWEEN $1 AND $2
ORDER BY e.event_date DESC;
```

### 4. Get all services with event count
```sql
SELECT s.*, COUNT(e.id) as event_count
FROM services s
LEFT JOIN enshittification_events e ON s.id = e.service_id
GROUP BY s.id
ORDER BY event_count DESC;
```

---

## Migration Strategy

### Initial Setup
1. Run migration SQL to create schema
2. Seed database from `seed-events.json`
3. Verify with sample queries

### Adding Events (Ongoing)
1. Update `seed-events.json` with new event
2. Run seed script (idempotent upsert)
3. Deploy to production (Vercel auto-deploys trigger Supabase update)

### Schema Changes (Future)
1. Create new migration file with timestamp
2. Test locally with Supabase CLI
3. Apply to production via migration tool
4. Update TypeScript types

---

## Constraints and Business Rules

1. **Service Slug Uniqueness**: Each service must have unique slug for URL routing
2. **Event Date Validation**: Events cannot be future-dated
3. **Cascade Deletion**: Deleting a service deletes all its events (ON DELETE CASCADE)
4. **Read-Only Public Access**: Row Level Security ensures public users can only read, not write
5. **Severity Consistency**: Severity enum ensures only valid values
6. **Timestamp Audit Trail**: All records have created_at and updated_at for tracking changes
