#!/usr/bin/env bash
#
# scripts/load-seed-data.sh
#
# Loads reference/seed data (Countries, Periods, Schools, Mediums, Artists,
# Artifacts) into an already-schema'd Postgres database. This is the "load
# data only" half of docs/RUNBOOK_seed_supabase.md — it deliberately does
# NOT drop tables or apply the schema. Use supabase-schema/reset.sql and
# schema.sql for that first (via the Supabase SQL Editor, or `psql -f`), on
# whatever database DATABASE_URL below points at.
#
# What this script does, in order:
#   1. Checks it can connect, and that the schema already exists (fails
#      fast with a clear message otherwise, rather than letting the first
#      seed file produce a wall of "relation does not exist" errors).
#   2. Ensures at least one row exists in the `user` table. The artifact
#      inserts in seed-data/*.sql are guarded with
#      `where ... and exists (select 1 from "user")` — without a user row,
#      those inserts silently no-op, which is confusing if you're not
#      expecting it. If ADMIN_EMAIL/ADMIN_PASSWORD are set and no user
#      exists yet, this creates one directly via SQL (pgcrypto's bcrypt-
#      compatible crypt()/gen_salt('bf') — verified to produce a hash
#      backend/src/auth/auth.service.ts's bcryptjs.compare() accepts).
#   3. Runs seed-data/populate_durer.sql, then
#      seed-data/populate_northern_renaissance_artists.sql.
#   4. Prints row counts for every seeded table so you can see what
#      actually landed.
#
# Every step is idempotent — safe to re-run. Re-running after a successful
# load just confirms nothing changed (all seed SQL uses
# `where not exists (...)` guards).
#
# Usage:
#   chmod +x scripts/load-seed-data.sh
#   DATABASE_URL=postgresql://user:pass@host:port/db ./scripts/load-seed-data.sh
#
# Or, to also create the admin user this needs:
#   DATABASE_URL=... ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' \
#     ./scripts/load-seed-data.sh
#
# If DATABASE_URL isn't set in the environment, this script falls back to
# reading it out of backend/.env (the same file `npm run start:dev` uses)
# if that file exists — so running this from a machine already set up per
# backend/README.md's Setup section works with no extra arguments.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

step() {
  printf '\n\033[1;34m==> %s\033[0m\n' "$1"
}

# --- 0. resolve DATABASE_URL ------------------------------------------------

step "Resolving DATABASE_URL"

if [ -z "${DATABASE_URL:-}" ] && [ -f "${REPO_ROOT}/backend/.env" ]; then
  # Pull just DATABASE_URL out of backend/.env without sourcing the whole
  # file (which may contain other vars we don't want to blindly export).
  DATABASE_URL="$(grep -E '^DATABASE_URL=' "${REPO_ROOT}/backend/.env" | head -1 | cut -d= -f2-)"
  if [ -n "$DATABASE_URL" ]; then
    echo "Using DATABASE_URL from backend/.env"
  fi
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set and backend/.env doesn't have one either." >&2
  echo "Set it, e.g.: DATABASE_URL=postgresql://user:pass@host:port/db $0" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Install the PostgreSQL client first (see scripts/install-dependencies.sh)." >&2
  exit 1
fi

# --- 1. connectivity + schema preflight -------------------------------------

step "Checking connection and schema"

if ! psql "$DATABASE_URL" -q -c '\q' 2>/tmp/load-seed-data-connect-err.log; then
  echo "Could not connect using DATABASE_URL. Details:" >&2
  cat /tmp/load-seed-data-connect-err.log >&2
  rm -f /tmp/load-seed-data-connect-err.log
  exit 1
fi
rm -f /tmp/load-seed-data-connect-err.log
echo "Connected."

schema_exists="$(psql "$DATABASE_URL" -t -A -c "select to_regclass('public.artifact') is not null;")"
if [ "$schema_exists" != "t" ]; then
  echo "The 'artifact' table doesn't exist yet — schema hasn't been applied to this database." >&2
  echo "Run supabase-schema/schema.sql against it first (see docs/RUNBOOK_seed_supabase.md Step 2), then re-run this script." >&2
  exit 1
fi
echo "Schema present."

# --- 2. ensure at least one admin user exists -------------------------------

step "Checking for an existing user"

user_count="$(psql "$DATABASE_URL" -t -A -c 'select count(*) from "user";')"

if [ "$user_count" -gt 0 ]; then
  echo "Found $user_count existing user row(s) — skipping admin creation."
elif [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  echo "No users found. Creating admin user '${ADMIN_EMAIL}'..."
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -v email="$ADMIN_EMAIL" -v password="$ADMIN_PASSWORD" <<'SQL'
create extension if not exists pgcrypto;

insert into role (name)
select r
from unnest(array['admin', 'curator', 'contributor']) as r
where not exists (select 1 from role where name = r);

insert into "user" (email, password_hash, role_id)
select :'email', crypt(:'password', gen_salt('bf')), (select id from role where name = 'admin')
where not exists (select 1 from "user" where email = :'email');
SQL
  echo "Admin user ready."
else
  echo "Warning: no user rows exist, and ADMIN_EMAIL/ADMIN_PASSWORD weren't provided." >&2
  echo "The artifact/artist inserts below need a user row to attribute records to —" >&2
  echo "without one, those specific inserts will silently no-op (this is by design in" >&2
  echo "the seed SQL's own guards, not a bug in this script). Reference data (Country," >&2
  echo "Period, School, Medium) will still load fine." >&2
  echo "Re-run with ADMIN_EMAIL=... ADMIN_PASSWORD=... to also create Artist/Artifact rows." >&2
fi

# --- 3. load seed data -------------------------------------------------------

step "Loading seed-data/populate_durer.sql"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "${REPO_ROOT}/seed-data/populate_durer.sql"

step "Loading seed-data/populate_northern_renaissance_artists.sql"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "${REPO_ROOT}/seed-data/populate_northern_renaissance_artists.sql"

# --- 4. verification summary -------------------------------------------------

step "Row counts after loading"

psql "$DATABASE_URL" <<'SQL'
select 'role' as t, count(*) from role
union all select 'user', count(*) from "user"
union all select 'country', count(*) from country
union all select 'period', count(*) from period
union all select 'school', count(*) from school
union all select 'medium', count(*) from medium
union all select 'artist', count(*) from artist
union all select 'artifact', count(*) from artifact
order by 1;
SQL

echo
echo "Done. See docs/LOAD_SEED_DATA.md for what to check if any of these look wrong."
