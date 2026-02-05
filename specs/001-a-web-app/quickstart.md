# Quickstart Guide: Enshittification Clock Web App

**Feature**: Enshittification Clock Web App
**Last Updated**: 2025-10-13

## Overview

This guide helps you set up and run the Enshittification Clock web application locally. Follow these steps to get the development environment running.

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: v18.17 or later ([Download](https://nodejs.org/))
- **npm** or **pnpm**: Package manager (npm comes with Node.js, pnpm is faster)
- **Git**: Version control ([Download](https://git-scm.com/))
- **Supabase Account**: Free account at [supabase.com](https://supabase.com/)
- **Vercel Account** (optional for deployment): [vercel.com](https://vercel.com/)

---

## Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/[your-org]/enshittification_clock.git
cd enshittification_clock
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using pnpm (faster):
```bash
pnpm install
```

### 3. Set Up Supabase Project

#### 3.1 Create a New Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details:
   - **Name**: enshittification-clock
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to you
4. Wait for project to be provisioned (~2 minutes)

#### 3.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://abcdefg.supabase.co`)
   - **anon public** key (the long string starting with `eyJ...`)

#### 3.3 Run Database Migrations

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link your project:
```bash
supabase link --project-ref <your-project-ref>
```
(Find project ref in Supabase dashboard URL: `https://supabase.com/dashboard/project/<project-ref>`)

3. Run migrations:
```bash
supabase db push
```

This will create the database schema (services and enshittification_events tables).

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Vercel Analytics (for deployment)
# NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

**Important**: Never commit `.env.local` to git! It's already in `.gitignore`.

### 5. Seed Initial Data

Seed the database with initial services and events:

```bash
npm run seed
```

This runs the seed script that reads from `lib/data/seed-events.json` and populates the database.

**Verify**: Check your Supabase dashboard > Table Editor to see the seeded data.

### 6. Run Development Server

Start the Next.js development server:

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

---

## Development Workflow

### Project Structure Quick Reference

```
app/                    # Next.js App Router
├── page.tsx            # Home page with clock + timeline
├── services/[slug]/    # Service detail pages
└── api/                # Optional API routes

components/             # React components
├── Clock/              # Clock visualization
├── Timeline/           # Timeline components
└── Service/            # Service-specific components

lib/                    # Business logic
├── supabase/           # Supabase clients & types
├── utils/              # Utility functions
└── data/               # Seed data (JSON)

supabase/               # Database
├── migrations/         # SQL migration files
└── seed.sql            # Seed script

tests/                  # Test files
├── unit/               # Unit tests
├── integration/        # Integration tests
└── e2e/                # E2E tests
```

### Running Tests

**Unit Tests** (Vitest):
```bash
npm run test
```

**Component Tests** (React Testing Library):
```bash
npm run test:components
```

**E2E Tests** (Playwright):
```bash
npm run test:e2e
```

**Test Coverage**:
```bash
npm run test:coverage
```

### Linting and Formatting

**Lint**:
```bash
npm run lint
```

**Format** (Prettier):
```bash
npm run format
```

**Type Check** (TypeScript):
```bash
npm run type-check
```

### Adding New Events

#### Option 1: Edit Seed File (Recommended for v1)

1. Edit `lib/data/seed-events.json`
2. Add new service or event:

```json
{
  "services": [
    {
      "name": "New Service",
      "slug": "new-service",
      "description": "Description here",
      "category": "Social Media"
    }
  ],
  "events": [
    {
      "service_slug": "new-service",
      "title": "Event title",
      "description": "What happened...",
      "event_date": "2024-01-15",
      "severity": "major",
      "source_url": "https://source.com"
    }
  ]
}
```

3. Run seed script:
```bash
npm run seed
```

4. Refresh browser to see changes

#### Option 2: Direct Database Insert (Supabase Dashboard)

1. Go to Supabase Dashboard > Table Editor
2. Select `services` or `enshittification_events` table
3. Click "Insert row"
4. Fill in data and save

---

## Building for Production

### Local Production Build

Test production build locally:

```bash
npm run build
npm run start
```

The production build will be at [http://localhost:3000](http://localhost:3000)

### Deploy to Vercel

#### First-Time Deployment

1. Push code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [vercel.com/new](https://vercel.com/new)

3. Import your repository

4. Configure environment variables in Vercel:
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. Click "Deploy"

#### Subsequent Deployments

Vercel automatically deploys on every push to `main` branch:

```bash
git add .
git commit -m "Add new events"
git push origin main
```

Deployment takes ~2 minutes. Check status at [vercel.com/dashboard](https://vercel.com/dashboard).

---

## Troubleshooting

### Issue: "Module not found" errors

**Solution**: Reinstall dependencies
```bash
rm -rf node_modules
npm install
```

### Issue: Supabase connection fails

**Solution**: Check environment variables
1. Verify `.env.local` exists and has correct values
2. Restart dev server after changing `.env.local`
3. Check Supabase project status in dashboard

### Issue: Database schema missing

**Solution**: Run migrations
```bash
supabase db push
```

### Issue: No events showing

**Solution**: Seed the database
```bash
npm run seed
```

### Issue: TypeScript errors

**Solution**: Regenerate types from Supabase
```bash
npm run generate:types
```

This fetches latest schema from Supabase and generates TypeScript types.

### Issue: Vercel build fails

**Solution**: Check build logs and ensure:
1. All environment variables are set in Vercel dashboard
2. Supabase database is accessible (check firewall/network settings)
3. No TypeScript errors (`npm run type-check` locally)

---

## Common Tasks

### Update Database Schema

1. Create new migration file:
```bash
supabase migration new add_new_field
```

2. Edit the migration SQL file in `supabase/migrations/`

3. Apply migration:
```bash
supabase db push
```

4. Regenerate TypeScript types:
```bash
npm run generate:types
```

### View Database Logs

```bash
supabase db logs
```

### View Realtime Events (Debug)

```bash
supabase realtime logs
```

### Reset Database (⚠️ Destructive)

**Warning**: This deletes all data!

```bash
supabase db reset
npm run seed
```

---

## Performance Optimization

### Enable Vercel Analytics

1. In Vercel dashboard, go to your project
2. Click "Analytics" tab
3. Enable Web Analytics
4. Optionally enable Speed Insights

### Monitor Supabase Usage

1. Go to Supabase Dashboard > Settings > Usage
2. Monitor:
   - Database size (free tier: 500MB)
   - API requests
   - Bandwidth

---

## Next Steps

After setup, you can:

1. **Customize the Clock**: Edit `components/Clock/ClockFace.tsx` for visual design
2. **Add More Services**: Edit `lib/data/seed-events.json` and re-seed
3. **Implement Filtering**: Test filtering by service or date range
4. **Run Tests**: Ensure all tests pass before deploying
5. **Deploy to Production**: Push to GitHub and let Vercel deploy automatically

---

## Getting Help

- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Project Issues**: [GitHub Issues](https://github.com/[your-org]/enshittification_clock/issues)

---

## Development Checklist

Before committing code, ensure:

- [ ] Code passes linting (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Tests pass (`npm run test`)
- [ ] Manual testing of changed features
- [ ] Environment variables documented in `.env.example`
- [ ] Database migrations committed (if schema changed)
- [ ] Seed data updated (if events added)

Before deploying to production:

- [ ] Production build succeeds (`npm run build`)
- [ ] All tests pass including E2E (`npm run test:e2e`)
- [ ] Constitution compliance checked (see plan.md)
- [ ] Code reviewed by another developer
- [ ] Environment variables set in Vercel dashboard
- [ ] Database migrations applied to production Supabase

---

## Summary

**Quick Start**:
1. Install dependencies: `npm install`
2. Set up Supabase project and get credentials
3. Configure `.env.local` with Supabase URL and key
4. Run migrations: `supabase db push`
5. Seed database: `npm run seed`
6. Start dev server: `npm run dev`
7. Open [http://localhost:3000](http://localhost:3000)

**Development Cycle**:
1. Make code changes
2. Test locally (`npm run dev`)
3. Run tests (`npm run test`)
4. Commit and push to GitHub
5. Vercel auto-deploys to production

Enjoy building the Enshittification Clock! 🕐
