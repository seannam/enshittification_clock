# Enshittification Clock

A web app that visualizes the "enshittification" of major apps and services through a clock metaphor and interactive timeline.

## What is Enshittification?

Enshittification describes how platforms degrade over time: they start by being good to users, then abuse users to benefit business customers, and finally abuse those business customers to claw back value for themselves.

## Features

- **Clock Visualization**: A prominent clock display representing the overall level of platform degradation across the tech industry
- **Event Timeline**: Chronological list of enshittification events for various services (Twitter, Reddit, Netflix, etc.)
- **Service Details**: View the complete history of enshittification events for any tracked service
- **Filtering**: Filter timeline by service or date range with shareable URLs
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Testing**: Vitest (unit), Playwright (e2e)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/seannam/enshittification_clock.git
   cd enshittification_clock
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your Supabase credentials.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run type-check` | Check TypeScript types |

## Project Structure

```
app/                  # Next.js App Router pages
components/
  Clock/              # Clock visualization components
  shared/             # Reusable UI components
lib/
  supabase/           # Supabase client and types
  utils/              # Utility functions
supabase/
  migrations/         # Database migrations
tests/                # Test files
specs/                # Feature specifications
```

## License

MIT
