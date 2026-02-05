# Feature Specification: Enshittification Clock Web App

**Feature Branch**: `001-a-web-app`   
**Created**: 2025-10-13    
**Status**: Draft   
**Input**: User description: "a web app that has a 'enshittification clock' and a timeline that tracks enshittification of major apps/services"   

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Enshittification Clock (Priority: P1)

A user visits the website to see the current state of enshittification across the technology industry. They see a prominent clock display that represents the overall level of platform degradation.

**Why this priority**: This is the core visual element and value proposition of the app. Without the clock, there is no product. This delivers immediate value and communicates the concept clearly.

**Independent Test**: Can be fully tested by opening the app and verifying that a clock visualization is displayed with a meaningful representation of enshittification levels. No other features need to be working.

**Acceptance Scenarios**:

1. **Given** a user opens the web app, **When** the page loads, **Then** they see a prominent clock display with clear visual indicators of enshittification level
2. **Given** the clock is displayed, **When** the user looks at it, **Then** they can immediately understand what the clock represents through clear labeling or visual metaphors
3. **Given** the clock shows a specific level, **When** the user wants context, **Then** they see a brief explanation of what the current time/level means

---

### User Story 2 - Browse Timeline of Services (Priority: P2)

A user wants to see the historical progression of enshittification for specific apps and services. They can browse a timeline showing major events and milestones that represent platform degradation.

**Why this priority**: This provides the evidence and detail that supports the clock visualization. Users can explore specific examples and understand the trends. This is essential for credibility and engagement.

**Independent Test**: Can be tested independently by verifying that users can see a list or timeline of services with enshittification events, even if the clock feature is not connected to it.

**Acceptance Scenarios**:

1. **Given** a user is viewing the app, **When** they navigate to the timeline section, **Then** they see a chronological list of enshittification events for various services
2. **Given** multiple services are tracked, **When** the user views the timeline, **Then** they can distinguish between different services through clear visual separation or filtering
3. **Given** an event is displayed, **When** the user views it, **Then** they see the service name, date, and a brief description of what changed
4. **Given** the user is browsing events, **When** they scroll through the timeline, **Then** events are organized chronologically (most recent first or oldest first based on user preference)

---

### User Story 3 - View Service Details (Priority: P3)

A user is interested in a specific service and wants to see all enshittification events related to that service. They can click on or select a service to see its complete history.

**Why this priority**: This enables deeper exploration for engaged users. While nice to have, users can get value from just the clock and timeline views. This is an enhancement for power users.

**Independent Test**: Can be tested by selecting a service from the timeline and verifying that a detailed view appears showing all events for that service.

**Acceptance Scenarios**:

1. **Given** a user sees a service mentioned in the timeline, **When** they click on the service name, **Then** they see a dedicated view showing all enshittification events for that service
2. **Given** a service detail view is displayed, **When** the user views it, **Then** they see events in chronological order with full descriptions
3. **Given** a user is viewing service details, **When** they want to return to the main timeline, **Then** they can easily navigate back

---

### User Story 4 - Filter Timeline by Service or Date Range (Priority: P4)

A user wants to focus on specific services or time periods. They can filter the timeline to show only events matching their criteria.

**Why this priority**: This is a convenience feature for users who want to explore specific aspects. The app is fully functional without filtering, but it improves the experience for returning visitors.

**Independent Test**: Can be tested by applying filters and verifying that only matching events are displayed.

**Acceptance Scenarios**:

1. **Given** the timeline is displayed, **When** the user selects a service filter, **Then** only events for that service are shown
2. **Given** the timeline is displayed, **When** the user selects a date range, **Then** only events within that range are shown
3. **Given** filters are applied, **When** the user clears them, **Then** all events are shown again

---

### Edge Cases

- What happens when no enshittification events exist for a service?
- What happens when a user tries to view the timeline on a very small screen (mobile)?
- What happens when new events are added while a user is viewing the page?
- What happens if the clock data cannot be calculated (no events in database)?
- What happens when a user has JavaScript disabled?
- What happens when two events occur on the same date for the same service?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a visual clock representation that communicates the current level of enshittification
- **FR-002**: System MUST display a timeline of enshittification events for multiple apps and services
- **FR-003**: System MUST show for each timeline event: service name, date, and description of what changed
- **FR-004**: System MUST organize timeline events in chronological order
- **FR-005**: System MUST allow users to view all events for a specific service
- **FR-006**: System MUST be accessible on desktop and mobile devices with responsive design
- **FR-007**: System MUST calculate the clock's position/level based on aggregated timeline data
- **FR-008**: System MUST display service information clearly distinguishable from other services
- **FR-009**: System MUST provide navigation between main timeline and detailed service views
- **FR-010**: System MUST load the initial view (clock and timeline) within 3 seconds on standard connections
- **FR-011**: System MUST allow filtering timeline by service with URL parameter support so users can bookmark and share specific filtered views
- **FR-012**: System MUST persist enshittification event data in structured files (JSON/YAML) within the repository, allowing version-controlled updates through file edits and deployment

### Key Entities

- **Service**: Represents a major app or platform being tracked (e.g., Twitter, Reddit, Netflix). Attributes include service name, optional logo/icon, category/type, and overall enshittification score/level
- **Enshittification Event**: Represents a specific change or milestone that degraded the platform. Attributes include date, service reference, title, description, severity/impact level, and optional source/citation
- **Clock State**: Represents the overall enshittification level calculated from all events. Attributes include current level/position, calculation methodology, and last updated timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view the clock and understand its meaning within 10 seconds of page load
- **SC-002**: Users can browse at least 20 enshittification events without performance degradation
- **SC-003**: 90% of users can successfully navigate between timeline and service detail views on first attempt
- **SC-004**: The application loads and displays initial content within 3 seconds on a standard broadband connection
- **SC-005**: The timeline displays events for at least 10 different major services
- **SC-006**: Users on mobile devices can view and interact with all core features without horizontal scrolling
- **SC-007**: The clock visualization updates to reflect changes in underlying timeline data

### Assumptions

- Users are familiar with the concept of "enshittification" (platform degradation over time) or will learn it from context
- The primary audience is technology-aware users interested in platform critique and tech industry trends
- Events will be curated manually through file edits and deployments (no real-time admin interface)
- Event data will be stored in JSON or YAML files within the repository for version control and simple deployment
- The app will be read-only for general users (viewing only, no user-generated content)
- Standard web performance expectations apply (modern browsers, reasonable internet speeds)
- The clock metaphor will use time-based visualization (e.g., moving toward midnight) to represent worsening conditions
- Filter states will be shareable via URL parameters to enable bookmarking and link sharing
