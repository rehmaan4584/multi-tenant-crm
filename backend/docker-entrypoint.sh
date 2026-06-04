#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

if [ "${RUN_SEED:-true}" = "true" ]; then
  echo "Seeding database..."
  npm run prisma:seed || echo "Seed skipped or already applied."
fi

echo "Starting API..."
exec node dist/src/main.js
