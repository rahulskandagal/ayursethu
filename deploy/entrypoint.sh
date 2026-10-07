#!/usr/bin/env bash
set -euo pipefail

PGDATA="${PGDATA:-/data/postgres}"
PGPORT=5432

mkdir -p "$PGDATA" /run/postgresql
chown -R postgres:postgres "$(dirname "$PGDATA")" /run/postgresql

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "[entrypoint] Initializing Postgres data directory at $PGDATA"
  su-exec postgres initdb -D "$PGDATA" -U postgres >/tmp/initdb.log 2>&1
fi

echo "[entrypoint] Starting Postgres"
su-exec postgres pg_ctl -D "$PGDATA" -l /tmp/postgres.log -w -o "-c listen_addresses=localhost -c port=$PGPORT" start

echo "[entrypoint] Waiting for Postgres to accept connections"
for i in $(seq 1 30); do
  if su-exec postgres pg_isready -h localhost -p "$PGPORT" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! su-exec postgres psql -h localhost -p "$PGPORT" -tAc "SELECT 1 FROM pg_database WHERE datname = 'ayursethu'" | grep -q 1; then
  echo "[entrypoint] Creating ayursethu database"
  su-exec postgres createdb -h localhost -p "$PGPORT" ayursethu
fi

export DATABASE_URL="postgresql://postgres@localhost:${PGPORT}/ayursethu?schema=public"

echo "[entrypoint] Running Prisma migrations"
npx prisma migrate deploy

USER_COUNT=$(su-exec postgres psql -h localhost -p "$PGPORT" -d ayursethu -tAc 'SELECT count(*) FROM "User"' 2>/dev/null || echo 0)
if [ "$USER_COUNT" = "0" ]; then
  echo "[entrypoint] Database is empty — seeding demo data"
  npx tsx prisma/seed.ts || echo "[entrypoint] Seed failed (non-fatal), continuing"
else
  echo "[entrypoint] Database already has data ($USER_COUNT users) — skipping seed"
fi

echo "[entrypoint] Starting AyurSethu server"
exec node dist/index.js
