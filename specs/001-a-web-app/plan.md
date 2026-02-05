# Implementation Plan: Enshittification Clock Web App

**Branch**: `001-a-web-app` | **Date**: 2025-10-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-a-web-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a web application that displays an "enshittification clock" visualization representing the overall state of platform degradation across the tech industry, accompanied by an interactive timeline of enshittification events for major services. Users can browse events chronologically, filter by service, view service-specific histories, and share filtered views via URL parameters. The application will be built with Next.js and TypeScript, deployed on Vercel, using Supabase for database and authentication, with event data initially seeded from version-controlled JSON files.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 14+ (App Router)
**Primary Dependencies**:
  - Next.js 14+ (React framework with App Router)
  - React 18+
  - Supabase JS Client (database and auth)
  - Tailwind CSS (styling)
  - date-fns or Day.js (date manipulation)
  - date-fns (date manipulation and formatting)
  - Native SVG (clock visualization - no library needed, see research.md)

**Storage**: Supabase (PostgreSQL) for production data; JSON seed files in repository for initial event data
**Testing**: Vitest (unit tests), React Testing Library (component tests), Playwright (E2E tests)
**Target Platform**: Web browsers (modern evergreen browsers: Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**:
  - Initial page load < 3 seconds (LCP)
  - Interactive within 2 seconds (TTI)
  - Client-side filtering < 100ms
  - Support 50+ events without pagination initially
  - Vercel Edge Network delivery for global performance

**Constraints**:
  - Must work on mobile devices (responsive down to 320px)
  - Must support URL-based filter sharing
  - File-based event seeding workflow (no admin UI in v1)
  - Read-only for general users (no user-generated content)
  - Supabase free tier limits (500MB database, 50K monthly active users)

**Scale/Scope**:
  - Initial launch: 10-15 major services
  - 50-100 enshittification events
  - Expected traffic: < 10K monthly visitors initially
  - Single-page application with client-side routing

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality First ✅
- **Status**: PASS
- **Compliance**: TypeScript provides type safety; ESLint + Prettier enforce consistent style; Next.js best practices encourage component modularity

### II. Testing Standards (NON-NEGOTIABLE) ✅
- **Status**: PASS
- **Compliance Plan**:
  - Unit tests: Vitest for utility functions (clock calculation, date formatting)
  - Component tests: React Testing Library for UI components
  - Integration tests: Test user journeys (view clock → browse timeline → filter)
  - E2E tests: Playwright for critical paths (P1-P2 user stories)
  - Contract tests: Test Supabase query interfaces
  - Target coverage: 90%+ for business logic, 100% for clock calculation

### III. User Experience Consistency ✅
- **Status**: PASS
- **Compliance Plan**:
  - Consistent component library using Tailwind CSS
  - Loading states for data fetching (React Suspense + skeleton screens)
  - Error boundaries for graceful error handling
  - Accessible HTML with semantic markup and ARIA labels
  - Consistent URL patterns for filter sharing
  - Mobile-first responsive design

### IV. Simplicity Over Complexity ✅
- **Status**: PASS
- **Rationale**:
  - Next.js App Router: Modern, opinionated framework reduces decision fatigue
  - File-based routing: Simple, predictable
  - Supabase: Reduces backend complexity (managed DB + auth)
  - File-based event seeding: Simpler than building admin UI for v1
  - Tailwind CSS: Utility-first reduces custom CSS complexity
  - No state management library initially (React state + URL state sufficient)

### V. Observable & Maintainable ✅
- **Status**: PASS
- **Compliance Plan**:
  - Vercel Analytics for performance monitoring
  - Error logging with Vercel error tracking or Sentry
  - Structured logging for API routes
  - README with quickstart guide
  - TypeScript for self-documenting interfaces
  - Supabase dashboard for database monitoring

### Additional Considerations

**Dependency Justification**:
- Next.js: Industry-standard React framework, excellent Vercel integration, built-in optimizations
- Supabase: Managed PostgreSQL + auth, reduces backend complexity, generous free tier
- Tailwind CSS: Utility-first CSS, fast development, small bundle with purging
- date-fns: Lightweight date library for formatting and manipulation
- Native SVG: For clock visualization (no library needed - aligns with Principle IV: Simplicity)

**No Violations**: All complexity is justified by user requirements and infrastructure needs.

## Project Structure

### Documentation (this feature)

```
specs/001-a-web-app/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-contracts.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
# Next.js App Router structure
app/
├── (routes)/
│   ├── page.tsx                  # Main page with clock + timeline
│   ├── services/
│   │   └── [slug]/
│   │       └── page.tsx          # Service detail page
│   └── layout.tsx                # Root layout
├── api/
│   ├── events/
│   │   └── route.ts              # API route for events
│   └── clock/
│       └── route.ts              # API route for clock state
└── globals.css                    # Global styles (Tailwind)

components/
├── Clock/
│   ├── Clock.tsx                 # Main clock visualization
│   ├── ClockFace.tsx             # Clock visual component
│   └── ClockLegend.tsx           # Explanation of clock levels
├── Timeline/
│   ├── Timeline.tsx              # Timeline container
│   ├── TimelineEvent.tsx         # Individual event card
│   ├── TimelineFilters.tsx       # Filter controls
│   └── TimelineSort.tsx          # Sort controls
├── Service/
│   ├── ServiceCard.tsx           # Service summary card
│   └── ServiceHeader.tsx         # Service detail header
└── shared/
    ├── ErrorBoundary.tsx         # Error handling
    ├── LoadingSpinner.tsx        # Loading states
    └── EmptyState.tsx            # Empty data states

lib/
├── supabase/
│   ├── client.ts                 # Supabase browser client
│   ├── server.ts                 # Supabase server client (SSR)
│   └── types.ts                  # Database types
├── utils/
│   ├── clock-calculator.ts       # Clock level calculation logic
│   ├── date-utils.ts             # Date formatting utilities
│   └── url-state.ts              # URL parameter helpers
└── data/
    └── seed-events.json          # Initial event data

supabase/
├── migrations/
│   └── 001_initial_schema.sql    # Database schema
└── seed.sql                       # Seed data from JSON

tests/
├── unit/
│   ├── clock-calculator.test.ts
│   └── date-utils.test.ts
├── integration/
│   ├── timeline.test.tsx
│   └── service-details.test.tsx
└── e2e/
    ├── view-clock.spec.ts
    └── filter-timeline.spec.ts

public/
└── icons/
    └── services/                  # Service logos/icons

.env.local                         # Environment variables (not committed)
.env.example                       # Environment template
next.config.js                     # Next.js configuration
tailwind.config.js                 # Tailwind configuration
tsconfig.json                      # TypeScript configuration
vitest.config.ts                   # Vitest configuration
playwright.config.ts               # Playwright configuration
```

**Structure Decision**: Next.js App Router structure chosen for:
- Modern React Server Components support
- Built-in API routes for data fetching
- File-based routing matches user story navigation
- Excellent TypeScript integration
- Optimized for Vercel deployment

The `app/` directory contains routes and layouts, `components/` contains reusable UI components organized by feature, `lib/` contains business logic and utilities (separation of concerns), and `tests/` mirrors the structure with unit/integration/e2e separation.

## Complexity Tracking

*No violations - section intentionally empty as Constitution Check passed without requiring complexity justification.*
