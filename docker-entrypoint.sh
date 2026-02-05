#!/bin/sh
set -e

# Run migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."

  for migration in /app/migrations/*.sql; do
    if [ -f "$migration" ]; then
      echo "Applying migration: $(basename "$migration")"
      psql "$DATABASE_URL" -f "$migration" || echo "Migration may have already been applied: $(basename "$migration")"
    fi
  done

  echo "Migrations complete."
fi

# Start the application
exec node server.js
