# Runbook: Clean and Seed the Real Supabase Database

This is the exact sequence to reset and populate your actual Supabase
project with the schema and seed data in this repo. Written because this
project's dev sandbox has no network access to Supabase at all — every
step here has to be run by you, from a machine or context that does.

Everything in this runbook was already dry-run-verified against a local
Postgres (schema.sql, reset.sql, and both seed-data/*.sql files load with
zero errors and are safe to re-run) — see `supabase-schema/` and
`seed-data/`'s own file headers for the same idempotency notes.

## Prerequisites

- A Supabase project, and either:
  - Access to its **SQL Editor** in the Supabase dashboard (simplest — no
    local setup needed for most of this), or
  - Its connection string (`DATABASE_URL`) and a machine with `psql`/Node
    installed and real internet access.
- If you want the automated admin-user step (recommended): Node.js and
  this repo checked out somewhere with real network access — see
  `docs/INSTALL_linux_deb.md` if that machine needs its tooling installed
  first.

## Step 1 — (Optional) Wipe existing tables

Skip this if your Supabase project is brand new / has no conflicting
tables yet.

**Supabase Dashboard → SQL Editor → New query** → paste the entire
contents of `supabase-schema/reset.sql` → **Run**.

This drops all 14 tables this project owns (`cascade`, so dependent rows
go with them). It does not touch anything else in your project.

## Step 2 — Apply the schema

**New query** → paste the entire contents of `supabase-schema/schema.sql`
→ **Run**.

This creates all 14 tables, their indexes, and seeds the 3 base `role`
rows (`admin`, `curator`, `contributor`) — you should see a mix of
`CREATE TABLE`/`CREATE INDEX` results ending in `INSERT 0 3`.

## Step 3 — Create an admin user

You need at least one row in `user` before Step 4 — the artifact seed
scripts check `exists (select 1 from "user")` and silently skip their
artifact inserts if that's not true yet.

**Option A — from a machine with Node + real network access (recommended):**

```bash
git clone <this-repo-url>
cd Artium-AI/backend
cp .env.example .env
# edit .env: paste your real Supabase DATABASE_URL, set JWT_SECRET to
# the output of `openssl rand -base64 48`
npm install
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='choose-a-real-password' npm run seed:admin
```

This is `backend/prisma/seed-admin.ts` — it creates the 3 roles if they
don't already exist (harmless no-op after Step 2) and one admin `user`
row with a properly bcrypt-hashed password, ready to log in with at
`/login` once the frontend is deployed.

**Option B — SQL Editor only, no local Node needed:**

```sql
-- Supabase has pgcrypto enabled by default, so bcrypt hashing can be done
-- directly in SQL — this produces the same hash format bcryptjs
-- (backend/src/auth/auth.service.ts) verifies against.
insert into "user" (email, password_hash, role_id)
select
  'you@example.com',
  crypt('choose-a-real-password', gen_salt('bf')),
  (select id from role where name = 'admin')
where not exists (select 1 from "user" where email = 'you@example.com');
```

Either option is fine — they produce an equivalent row. Don't leave the
example password in place; pick a real one.

## Step 4 — Load the seed data

Run these two, in this order (the second inserts a few reference rows —
Country/Period/School — that the first didn't already create, plus its
own artists/artifacts):

1. **New query** → paste `seed-data/populate_durer.sql` → **Run**
2. **New query** → paste `seed-data/populate_northern_renaissance_artists.sql` → **Run**

Both are safe to re-run if something goes wrong partway — every insert is
guarded with `where not exists (...)`, so re-running just fills in
whatever didn't make it in the first time, without duplicating anything
that did.

## Step 5 — Verify

**New query**:

```sql
select 'role' t, count(*) from role
union all select 'user', count(*) from "user"
union all select 'country', count(*) from country
union all select 'period', count(*) from period
union all select 'school', count(*) from school
union all select 'medium', count(*) from medium
union all select 'artist', count(*) from artist
union all select 'artifact', count(*) from artifact
order by 1;
```

Expected (matches the dry run this runbook is based on):

| table | count |
|---|---|
| artifact | 58 |
| artist | 20 |
| country | 4 |
| medium | 7 |
| period | 1 |
| role | 3 |
| school | 4 |
| user | 1 (or more, if you add other staff accounts) |

## Step 6 — Point the deployed app at it

Once this is done, `backend`'s `DATABASE_URL` (on Railway, or wherever
it's deployed — see `backend/README.md`) should point at this same
Supabase project. Log in at `/login` with the admin from Step 3, then
`/museum` and `/collection` should show the real seeded data instead of
being empty.

## Note on file storage (Cloudflare R2)

None of the above touches R2 — it only ever contains real files once
someone actually uploads through the app's two-step upload flow (see the
previous discussion on why the bucket starts empty). Seeding the database
doesn't seed storage; those are two independent systems by design (Design
Document Section 6).
