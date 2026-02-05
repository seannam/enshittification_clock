# Tasks: Enshittification Clock Web App

**Input**: Design documents from `/specs/001-a-web-app/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api-contracts.md, research.md, quickstart.md

**Tests**: Tests are REQUIRED per Constitution Principle II (Testing Standards - NON-NEGOTIABLE). Target: 90%+ coverage for business logic, 100% for clock calculation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions
- **Next.js App Router**: `app/`, `components/`, `lib/`, `tests/` at repository root
- Paths use Next.js 14+ App Router structure
- See plan.md:122-196 for complete project structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Initialize Next.js 14 project with TypeScript and App Router configuration in repository root
- [ ] T002 [P] Install and configure dependencies: React 18, Supabase client, Tailwind CSS, date-fns, Vitest, Playwright
- [ ] T003 [P] Configure ESLint and Prettier for code quality in .eslintrc.json and .prettierrc
- [ ] T004 [P] Create environment template .env.example with Supabase placeholder variables
- [ ] T005 [P] Configure Tailwind CSS in tailwind.config.js with custom colors for clock levels
- [ ] T006 [P] Set up TypeScript configuration in tsconfig.json with strict mode
- [ ] T007 [P] Configure Vitest in vitest.config.ts for unit and component tests
- [ ] T008 [P] Configure Playwright in playwright.config.ts for E2E tests
- [ ] T009 Create root layout in app/layout.tsx with HTML structure, metadata, and Tailwind imports
- [ ] T010 Create global styles in app/globals.css with Tailwind directives and custom CSS variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Infrastructure

- [ ] T011 Create Supabase migration script in supabase/migrations/001_initial_schema.sql (see data-model.md:229-300)
- [ ] T012 Create seed data JSON file in lib/data/seed-events.json with initial services and events (see data-model.md:365-404)
- [ ] T013 Create seed SQL script in supabase/seed.sql to read JSON and populate database
- [ ] T014 [P] Create Supabase browser client in lib/supabase/client.ts for client-side queries
- [ ] T015 [P] Create Supabase server client in lib/supabase/server.ts for Server Components
- [ ] T016 [P] Create TypeScript types in lib/supabase/types.ts from database schema (see data-model.md:304-359)

### Shared Components & Utilities

- [ ] T017 [P] Create ErrorBoundary component in components/shared/ErrorBoundary.tsx for error handling
- [ ] T018 [P] Create LoadingSpinner component in components/shared/LoadingSpinner.tsx for loading states
- [ ] T019 [P] Create EmptyState component in components/shared/EmptyState.tsx for empty data

### Testing Infrastructure

- [ ] T020 [P] Set up test utilities in tests/setup.ts for Vitest and React Testing Library
- [ ] T021 [P] Create test helpers in tests/helpers.ts for common test patterns

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Enshittification Clock (Priority: P1) 🎯 MVP

**Goal**: Display a prominent clock visualization showing the overall enshittification level calculated from all events

**Independent Test**: Open the app and verify a clock is displayed with meaningful visual representation. No other features need to work.

### Tests for User Story 1 ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T022 [P] [US1] Unit test for clock calculation logic in tests/unit/clock-calculator.test.ts
  - Test getSeverityScore function (all 5 severity levels)
  - Test getDecayFactor function (< 1yr, 1-2yr, 2-3yr, 3+yr)
  - Test calculateClockState function (0 events, few events, many events)
  - Test getPositionLabel function (all 5 level ranges)
  - Test getColorForLevel function (all 5 color ranges)
  - **Target**: 100% coverage (critical path requirement)

- [ ] T023 [P] [US1] Component test for ClockFace in tests/unit/ClockFace.test.tsx
  - Test renders SVG with correct level
  - Test displays correct color for each level range
  - Test accessible with ARIA labels

- [ ] T024 [P] [US1] Component test for ClockLegend in tests/unit/ClockLegend.test.tsx
  - Test renders level descriptions
  - Test shows current position label

- [ ] T025 [US1] Integration test for Clock component in tests/integration/clock.test.tsx
  - Test Clock fetches events and calculates state
  - Test Clock displays correct level based on mock data
  - Test Clock shows legend explaining meaning

- [ ] T026 [US1] E2E test for viewing clock in tests/e2e/view-clock.spec.ts
  - Test user opens app and sees clock within 3 seconds
  - Test clock shows clear visual indicators
  - Test clock includes explanatory text

### Implementation for User Story 1

- [ ] T027 [US1] Create clock calculation utility in lib/utils/clock-calculator.ts (see data-model.md:170-221)
  - Implement getSeverityScore function
  - Implement getDecayFactor function with time decay logic
  - Implement getPositionLabel function (5 levels)
  - Implement getColorForLevel function (5 colors)
  - Implement calculateClockState function with aggregation logic
  - Export SEVERITY_SCORES constant

- [ ] T028 [P] [US1] Create ClockFace component in components/Clock/ClockFace.tsx
  - Render SVG circle (viewBox 0 0 200 200)
  - Render 12 hour markers
  - Render clock hand/indicator based on level (0-100 → 0-360°)
  - Apply color based on level (Tailwind classes)
  - Add ARIA labels for accessibility
  - Make responsive (scales with parent container)

- [ ] T029 [P] [US1] Create ClockLegend component in components/Clock/ClockLegend.tsx
  - Display current position label (e.g., "Severe enshittification")
  - Show color-coded legend of 5 levels
  - Include brief explanation of what clock represents

- [ ] T030 [US1] Create Clock container component in components/Clock/Clock.tsx
  - Fetch all events using Supabase client
  - Call calculateClockState with fetched events
  - Render ClockFace with calculated level and color
  - Render ClockLegend with current position
  - Handle loading state (Suspense + LoadingSpinner)
  - Handle error state (ErrorBoundary)

- [ ] T031 [US1] Create home page in app/page.tsx with Clock component (Server Component)
  - Fetch events server-side using Supabase server client
  - Pass data to Clock component
  - Set page metadata (title, description for SEO)
  - Configure revalidation (ISR) for performance

- [ ] T032 [US1] Add Vercel Analytics to app/layout.tsx for monitoring

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Browse Timeline of Services (Priority: P2)

**Goal**: Display a chronological timeline of enshittification events across all services with clear visual distinction between services

**Independent Test**: Verify users can see a list of events with service names, dates, and descriptions. Clock doesn't need to be connected.

### Tests for User Story 2 ⚠️

- [ ] T033 [P] [US2] Component test for TimelineEvent in tests/unit/TimelineEvent.test.tsx
  - Test renders event title, date, description
  - Test displays service name and logo
  - Test shows severity indicator
  - Test includes source link if provided

- [ ] T034 [P] [US2] Component test for TimelineSort in tests/unit/TimelineSort.test.tsx
  - Test renders sort controls (newest first, oldest first)
  - Test calls sort callback on selection

- [ ] T035 [US2] Integration test for Timeline in tests/integration/timeline.test.tsx
  - Test Timeline fetches and displays events
  - Test events are ordered chronologically
  - Test services are visually distinguished
  - Test timeline shows at least 20 events without lag

- [ ] T036 [US2] E2E test for browsing timeline in tests/e2e/browse-timeline.spec.ts
  - Test user navigates to timeline section
  - Test user sees chronological list of events
  - Test user can distinguish different services
  - Test user can scroll through events smoothly

### Implementation for User Story 2

- [ ] T037 [P] [US2] Create date utility functions in lib/utils/date-utils.ts
  - Implement formatEventDate (e.g., "Feb 1, 2023")
  - Implement formatRelativeDate (e.g., "2 years ago")
  - Implement sortByDate function

- [ ] T038 [P] [US2] Create TimelineEvent component in components/Timeline/TimelineEvent.tsx
  - Display event title (bold, prominent)
  - Display service name and logo (if available)
  - Display formatted date using date-utils
  - Display event description (max 2-3 lines, expandable)
  - Display severity indicator (color-coded badge)
  - Display source link if provided (external link icon)
  - Make responsive for mobile

- [ ] T039 [P] [US2] Create TimelineSort component in components/Timeline/TimelineSort.tsx
  - Render dropdown/toggle for sort order
  - Options: "Newest First", "Oldest First"
  - Emit sort change event to parent
  - Style with Tailwind (consistent with app)

- [ ] T040 [US2] Create Timeline container component in components/Timeline/Timeline.tsx
  - Fetch events with service data using Supabase query
  - Sort events based on user preference (newest first default)
  - Render TimelineEvent for each event
  - Render TimelineSort control
  - Handle empty state (no events)
  - Handle loading state
  - Optimize rendering (consider virtualization if >50 events)

- [ ] T041 [US2] Update home page app/page.tsx to include Timeline below Clock
  - Keep Clock component (US1)
  - Add Timeline component (US2)
  - Use CSS Grid or Flexbox for layout
  - Ensure responsive design (stack on mobile)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - View Service Details (Priority: P3)

**Goal**: Allow users to click on a service and see all events specific to that service in a dedicated view

**Independent Test**: Click on a service name and verify a detail page shows all events for that service

### Tests for User Story 3 ⚠️

- [ ] T042 [P] [US3] Component test for ServiceHeader in tests/unit/ServiceHeader.test.tsx
  - Test renders service name, description, logo
  - Test shows category badge
  - Test displays event count

- [ ] T043 [P] [US3] Component test for ServiceCard in tests/unit/ServiceCard.test.tsx
  - Test renders service summary
  - Test links to service detail page
  - Test shows event count

- [ ] T044 [US3] Integration test for service detail page in tests/integration/service-details.test.tsx
  - Test page loads service data by slug
  - Test page displays all events for service
  - Test events are chronologically ordered
  - Test back navigation works

- [ ] T045 [US3] E2E test for viewing service details in tests/e2e/service-details.spec.ts
  - Test user clicks service name from timeline
  - Test user sees dedicated service view
  - Test user sees all events for that service
  - Test user can navigate back to main timeline

### Implementation for User Story 3

- [ ] T046 [P] [US3] Create ServiceHeader component in components/Service/ServiceHeader.tsx
  - Display service name (large heading)
  - Display service logo (if available)
  - Display service description
  - Display category badge
  - Display total event count
  - Include back button/link to home

- [ ] T047 [P] [US3] Create ServiceCard component in components/Service/ServiceCard.tsx
  - Display service name and logo
  - Display event count
  - Link to service detail page (Next.js Link)
  - Hover effect for interactivity

- [ ] T048 [US3] Create service detail page in app/services/[slug]/page.tsx (Server Component)
  - Extract slug from route params
  - Fetch service by slug using Supabase server client
  - Fetch all events for service using Supabase server client
  - Handle service not found (404)
  - Render ServiceHeader with service data
  - Render Timeline with filtered events
  - Set page metadata with service name for SEO

- [ ] T049 [US3] Update TimelineEvent component in components/Timeline/TimelineEvent.tsx
  - Make service name clickable (Link to service detail page)
  - Add hover effect on service name

**Checkpoint**: All user stories (1, 2, 3) should now be independently functional

---

## Phase 6: User Story 4 - Filter Timeline by Service or Date Range (Priority: P4)

**Goal**: Allow users to filter the timeline by service or date range, with URL parameters for shareable links

**Independent Test**: Apply filters and verify only matching events are shown. Copy URL and verify filter persists.

### Tests for User Story 4 ⚠️

- [ ] T050 [P] [US4] Unit test for URL state helpers in tests/unit/url-state.test.ts
  - Test parseFiltersFromURL function
  - Test buildFilterURL function
  - Test handles missing parameters gracefully

- [ ] T051 [P] [US4] Component test for TimelineFilters in tests/unit/TimelineFilters.test.tsx
  - Test renders service dropdown with all services
  - Test renders date range pickers
  - Test emits filter change events
  - Test displays active filters
  - Test includes clear filters button

- [ ] T052 [US4] Integration test for filtering in tests/integration/timeline-filters.test.tsx
  - Test selecting service filter shows only that service's events
  - Test selecting date range shows only events in range
  - Test combining filters (service + date)
  - Test clearing filters restores all events
  - Test URL updates when filters applied

- [ ] T053 [US4] E2E test for filter timeline in tests/e2e/filter-timeline.spec.ts
  - Test user selects service filter
  - Test only that service's events shown
  - Test user selects date range
  - Test only events in range shown
  - Test user clears filters
  - Test all events shown again
  - Test URL contains filter parameters
  - Test copying URL preserves filter state

### Implementation for User Story 4

- [ ] T054 [US4] Create URL state utility in lib/utils/url-state.ts (see research.md:258-281)
  - Implement useFilterState hook
  - Implement parseFiltersFromURL function
  - Implement buildFilterURL function
  - Use Next.js useSearchParams and useRouter
  - Support service, startDate, endDate parameters

- [ ] T055 [US4] Create TimelineFilters component in components/Timeline/TimelineFilters.tsx (Client Component)
  - Mark with 'use client' directive
  - Render service filter dropdown (all services + "All Services")
  - Render date range inputs (start date, end date)
  - Use useFilterState hook for URL state
  - Update URL when filters change
  - Display active filter badges
  - Include "Clear Filters" button
  - Style with Tailwind (consistent with app)

- [ ] T056 [US4] Update Timeline component in components/Timeline/Timeline.tsx
  - Add TimelineFilters component
  - Read filters from URL using useFilterState
  - Filter events based on active filters (client-side)
  - Update displayed event count
  - Ensure filtering is fast (< 100ms for 50+ events)

- [ ] T057 [US4] Update home page app/page.tsx
  - Make page support URL query parameters
  - Pass initial filter state to Timeline
  - Ensure Server Component hydration works with Client Component filters

**Checkpoint**: All user stories (1, 2, 3, 4) should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T058 [P] Create README.md in repository root with project overview, setup instructions, and quickstart guide
- [ ] T059 [P] Add comprehensive JSDoc comments to all utility functions in lib/utils/
- [ ] T060 [P] Optimize images: Add service logos to public/icons/services/ (SVG format, <10KB each)
- [ ] T061 [P] Add meta tags for social sharing (Open Graph, Twitter Cards) in app/layout.tsx
- [ ] T062 [P] Configure Next.js image optimization in next.config.js
- [ ] T063 [P] Add loading skeleton screens for Suspense boundaries in components/shared/
- [ ] T064 Test accessibility with screen reader and keyboard navigation
- [ ] T065 Run Lighthouse audit and address performance issues (target: 90+ score)
- [ ] T066 Verify mobile responsiveness on real devices (iOS, Android)
- [ ] T067 [P] Add error logging with console.error for production debugging
- [ ] T068 Create .env.example with all required environment variables documented
- [ ] T069 Run full test suite and ensure 90%+ coverage
- [ ] T070 Fix any linting errors (`npm run lint`)
- [ ] T071 Run type check and fix any TypeScript errors (`npm run type-check`)
- [ ] T072 Create deployment guide in docs/deployment.md for Vercel + Supabase
- [ ] T073 Test production build locally (`npm run build && npm run start`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 but naturally combines with clock
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses Timeline component from US2 but can be built independently
- **User Story 4 (P4)**: Depends on US2 (Timeline must exist) - Should start after US2 complete

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD - Constitution Principle II)
- Utility functions before components (US1: clock-calculator before Clock components)
- Leaf components before container components (US2: TimelineEvent before Timeline)
- Components before pages (US3: ServiceHeader before service detail page)
- Core implementation before integration (US4: url-state before TimelineFilters)
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: All tasks marked [P] can run in parallel (T001-T010)
- **Phase 2 (Foundational)**: Database tasks (T011-T016) and component tasks (T017-T021) can run in parallel
- **Within User Stories**: All test tasks marked [P] can run in parallel, implementation tasks marked [P] can run in parallel
- **User Stories**: Once Foundational completes, US1, US2, US3 can start in parallel by different developers (US4 should wait for US2)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
# T022, T023, T024 (unit/component tests - all different files)
Task: "Unit test for clock calculation logic in tests/unit/clock-calculator.test.ts"
Task: "Component test for ClockFace in tests/unit/ClockFace.test.tsx"
Task: "Component test for ClockLegend in tests/unit/ClockLegend.test.tsx"

# After tests pass, launch all leaf components together:
# T028, T029 (ClockFace, ClockLegend - different files)
Task: "Create ClockFace component in components/Clock/ClockFace.tsx"
Task: "Create ClockLegend component in components/Clock/ClockLegend.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T021) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T022-T032)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

**MVP Deliverable**: A working app that displays the enshittification clock with real-time calculation

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T021)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) (T022-T032)
3. Add User Story 2 → Test independently → Deploy/Demo (T033-T041)
4. Add User Story 3 → Test independently → Deploy/Demo (T042-T049)
5. Add User Story 4 → Test independently → Deploy/Demo (T050-T057)
6. Polish → Final production release (T058-T073)

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T021)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T022-T032)
   - **Developer B**: User Story 2 (T033-T041)
   - **Developer C**: Start on shared components for US3 (ServiceHeader, ServiceCard preparation)
3. After US2 completes:
   - **Developer B**: Move to User Story 4 (T050-T057)
   - **Developer C**: Complete User Story 3 (T042-T049)
4. All developers: Polish phase together (T058-T073)

---

## Task Summary

**Total Tasks**: 73

**Task Breakdown by Phase**:
- Phase 1 (Setup): 10 tasks
- Phase 2 (Foundational): 11 tasks
- Phase 3 (User Story 1): 11 tasks (5 test + 6 implementation)
- Phase 4 (User Story 2): 9 tasks (4 test + 5 implementation)
- Phase 5 (User Story 3): 8 tasks (4 test + 4 implementation)
- Phase 6 (User Story 4): 8 tasks (4 test + 4 implementation)
- Phase 7 (Polish): 16 tasks

**Test Coverage**:
- 17 test tasks total
- Unit tests: 5 tasks (clock calculation, date utils, component tests)
- Integration tests: 4 tasks (clock, timeline, service details, filters)
- E2E tests: 4 tasks (view clock, browse timeline, service details, filters)
- Contract tests: Covered in integration tests

**Parallel Opportunities**:
- Phase 1: 10 parallel tasks
- Phase 2: ~15 parallel tasks (different categories)
- Each User Story: 4-5 parallel test tasks, 2-3 parallel implementation tasks
- Phase 7: ~10 parallel tasks

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability (US1, US2, US3, US4)
- Each user story should be independently completable and testable
- Tests written FIRST per TDD and Constitution Principle II (NON-NEGOTIABLE)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

**Constitution Compliance**:
- ✅ Code Quality: TypeScript, ESLint, Prettier enforced
- ✅ Testing Standards: 17 test tasks, TDD approach, 90%+ coverage target
- ✅ UX Consistency: Tailwind CSS, responsive design, accessibility tasks
- ✅ Simplicity: No unnecessary dependencies, native SVG for clock
- ✅ Observable: Vercel Analytics, error logging, structured code

**Ready for Execution**: All tasks are specific enough for immediate implementation. Each includes exact file paths and clear acceptance criteria.
