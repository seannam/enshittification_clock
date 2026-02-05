# Deployment Guide

This app is deployed on a self-hosted server using Dokploy with Cloudflare Zero Trust for access control.

**Important:** This app must be deployed as a **Compose** project in Dokploy, not an Application. Dokploy Application deployments ignore the Dockerfile's ENTRYPOINT, which breaks automatic migrations.

## Architecture Overview

```
Internet
    │
    ▼
Cloudflare (DNS + Zero Trust Access)
    │
    ▼
Server (Dokploy + Traefik)
    ├── Clock App (Next.js)
    └── Supabase Stack
        ├── Kong (API Gateway)
        ├── Studio (Admin UI)
        ├── Auth
        ├── REST
        └── PostgreSQL
```

## Domain Naming Convention

Use a consistent pattern with service type as a prefix:

```
{service}-{app}.snam.io
```

| Pattern | Purpose | Example |
|---------|---------|---------|
| `{app}.snam.io` | App frontend | `eclock.snam.io` |
| `db-{app}.snam.io` | Database API (Kong) | `db-eclock.snam.io` |
| `supabase-{app}.snam.io` | Supabase Studio | `supabase-eclock.snam.io` |

**Why this pattern?**
- Cloudflare's free Universal SSL only covers one subdomain level (`*.snam.io`)
- Multi-level subdomains like `eclock.db.snam.io` require paid Advanced Certificate Manager
- Single-level pattern allows wildcard bypass rules (e.g., `db-*` matches all database APIs)

## Cloudflare DNS Setup

In the `snam.io` zone, add these A records pointing to your server IP:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| A | `*` | Server IP | Proxied |

A single wildcard covers all subdomains. Alternatively, add individual records:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| A | `eclock` | Server IP | Proxied |
| A | `db-eclock` | Server IP | Proxied |
| A | `supabase-eclock` | Server IP | Proxied |

## Cloudflare Zero Trust Access

### Why Different Policies?

| Service | Access Type | Needs Bypass? |
|---------|-------------|---------------|
| App frontend | Browser (humans) | No - protect it |
| Supabase Studio | Browser (humans) | No - protect it |
| Database API (Kong) | Code (JS/server) | **Yes** - code can't handle login pages |
| GitHub webhooks | Automated | **Yes** - webhooks can't authenticate |

### Bypass Rule for Database APIs

**Zero Trust > Access > Applications > Add Application**

1. **Type:** Self-hosted
2. **Application name:** `Database APIs`
3. **Public hostname:**
   - Subdomain: `db-*`
   - Domain: `snam.io`
4. **Policy:**
   - Policy name: `Bypass All`
   - Action: **Bypass**
   - Selector: `Everyone`

This bypasses authentication for all `db-*.snam.io` requests (e.g., `db-eclock.snam.io`, `db-newapp.snam.io`).

### Bypass Rule for GitHub Webhooks

GitHub webhooks need to reach Dokploy for automatic deployments.

**Zero Trust > Access > Applications > Add Application**

1. **Type:** Self-hosted
2. **Application name:** `GitHub Webhooks`
3. **Public hostname:**
   - Subdomain: Your Dokploy subdomain
   - Domain: `snam.io`
   - Path: `/api/deploy/*` (or your webhook path)
4. **Policy:**
   - Policy name: `Bypass GitHub`
   - Action: **Bypass**
   - Selector: `Everyone`

Alternatively, use IP-based rules for GitHub's webhook IPs (see [GitHub IP ranges](https://api.github.com/meta)).

### Protected Applications

For apps and Studio, create normal Access policies requiring authentication:

1. **Type:** Self-hosted
2. **Public hostname:** `eclock.snam.io` or `supabase-eclock.snam.io`
3. **Policy:**
   - Action: **Allow**
   - Include: Your identity provider rules (email, group, etc.)

## Supabase Configuration (Dokploy Template)

### Environment Variables

```env
# Public API URL (Kong)
API_EXTERNAL_URL=https://db-eclock.snam.io

# Studio URL
SUPABASE_PUBLIC_URL=https://supabase-eclock.snam.io

# Auth redirect URL (your app)
SITE_URL=https://eclock.snam.io
```

### Traefik Domain Configuration

In Dokploy, configure domains for each service:

| Service | Domain | Port |
|---------|--------|------|
| kong | `db-eclock.snam.io` | 8000 |
| studio | `supabase-eclock.snam.io` | 3000 |

## App Configuration (Dokploy Compose)

### Deployment Type

**You must use Compose deployment in Dokploy:**

1. In Dokploy, create a new **Compose** project (not Application)
2. Point it to your GitHub repo
3. Dokploy will use `docker-compose.yml` for deployment

**Why Compose?** Dokploy Application deployments build from the Dockerfile but ignore ENTRYPOINT when creating the service. Only Compose deployments respect the full docker-compose.yml configuration including entrypoint and networks.

### Environment Variables

Set these in Dokploy's Compose environment settings:

```env
NEXT_PUBLIC_SUPABASE_URL=https://db-eclock.snam.io
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# For internal migrations (Docker network)
DATABASE_URL=postgresql://postgres:your-password@enshittification-clock-supabase-e9ew2d-supabase-db:5432/postgres
```

## Database Migrations

Migrations run automatically at container startup via `docker-entrypoint.sh`. This approach:
- Keeps PostgreSQL internal (not exposed to internet)
- Runs migrations before the app starts
- Uses Docker's internal networking

### How It Works

1. Container starts with `docker-entrypoint.sh`
2. Script checks for `DATABASE_URL` environment variable
3. Applies all `.sql` files from `/app/migrations/` using `psql`
4. Starts the Next.js server

### Docker Network Configuration

The app connects to the Supabase network via `docker-compose.yml`:

```yaml
networks:
  supabase:
    name: enshittification-clock-supabase-e9ew2d
    external: true
```

**Finding your Supabase network name:**

```bash
# SSH into your server and run:
docker network ls | grep supabase
```

The network name follows the pattern: `{dokploy-project-name}-supabase-{id}`

**Finding the PostgreSQL container hostname:**

```bash
docker ps | grep supabase-db
```

The container name is the hostname (e.g., `enshittification-clock-supabase-e9ew2d-supabase-db`).

### Migration Files

SQL migrations are stored in `supabase/migrations/` and applied in alphabetical order:

```
supabase/migrations/
  001_initial_schema.sql
  002_add_event_type.sql
```

**Note:** Migrations should be idempotent (safe to run multiple times). Use `IF NOT EXISTS` for CREATE statements.

## Troubleshooting

### Migrations don't run at startup

**Symptom:** Container starts directly with Next.js, no "Running database migrations..." in logs.

**Causes:**
1. Using Dokploy Application deployment instead of Compose
2. Entrypoint not being executed

**Solution:**
1. Delete the Application deployment in Dokploy
2. Create a new **Compose** project pointing to the same repo
3. Set environment variables in the Compose project
4. Redeploy

**Verify entrypoint is running:**
```bash
docker exec <container> cat /proc/1/cmdline | tr '\0' ' '
```
Should show `./docker-entrypoint.sh`, not `node server.js`.

### Migrations fail to connect

**Symptom:** Container logs show `psql: could not connect to server`

**Causes:**
1. App not on same Docker network as Supabase
2. Wrong internal hostname in `DATABASE_URL`
3. `DATABASE_URL` not set

**Solution:**
1. Verify the app is on the Supabase Docker network
2. Check the PostgreSQL container name: `docker ps | grep supabase-db`
3. Test connectivity: `docker exec <app-container> psql "$DATABASE_URL" -c "SELECT 1"`

### App gets HTML instead of JSON from Supabase

**Symptom:** Logs show Supabase Studio HTML (404 page) instead of API response.

**Causes:**
1. URL pointing to Studio instead of Kong
2. Cloudflare Access blocking API requests

**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` points to Kong (e.g., `db-eclock.snam.io`)
2. Verify Zero Trust bypass rule exists for `db-*.snam.io`
3. Test with curl:
   ```bash
   curl https://db-eclock.snam.io/rest/v1/ -H "apikey: YOUR_ANON_KEY"
   ```
   Should return JSON, not HTML.

### GitHub webhooks failing

**Symptom:** Pushes don't trigger deployments.

**Causes:**
1. Cloudflare Access blocking webhook requests
2. Wrong webhook URL

**Solution:**
1. Check webhook delivery status in GitHub repo settings
2. Verify bypass rule exists for webhook path
3. Test webhook endpoint is accessible

### Cloudflare challenge page breaking requests

**Symptom:** API calls return Cloudflare challenge HTML with JS like:
```
window.__CF$cv$params={...}
'/cdn-cgi/challenge-platform/scripts/jsd/main.js'
```

**Solution:** The endpoint needs a Zero Trust bypass rule. Automated requests cannot complete browser challenges.

## Adding a New App

1. **DNS:** If using a wildcard `*` record, no changes needed. Otherwise add:
   - `newapp` → Server IP
   - `db-newapp` → Server IP
   - `supabase-newapp` → Server IP

2. **Dokploy:** Deploy Supabase template with domains:
   - Kong: `db-newapp.snam.io`
   - Studio: `supabase-newapp.snam.io`

3. **Cloudflare Zero Trust:** No changes needed - `db-*` bypass rule covers all database APIs

4. **App config:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://db-newapp.snam.io
   ```

## SSL Certificate Notes

Cloudflare's free Universal SSL only covers one subdomain level:

| Domain | Covered? |
|--------|----------|
| `snam.io` | Yes |
| `*.snam.io` (e.g., `eclock.snam.io`) | Yes |
| `*.db.snam.io` (e.g., `eclock.db.snam.io`) | **No** |

Multi-level subdomains require Cloudflare Advanced Certificate Manager (~$10/month).
This is why we use `db-eclock.snam.io` instead of `eclock.db.snam.io`.
