# Loading Seed Data Only

`scripts/load-seed-data.sh` is the automated, "data only" counterpart to
`docs/RUNBOOK_seed_supabase.md` — it does **not** drop or create tables.
Use it once a database already has the schema applied (via
`supabase-schema/schema.sql`), when all you want is to (re-)load the
reference/seed data.

## What it does

1. **Resolves `DATABASE_URL`** — from the environment, or falls back to
   reading it out of `backend/.env` if that file exists and the
   environment variable isn't set.
2. **Preflight checks** — confirms it can connect, and that the schema is
   actually present (checks for the `artifact` table). Fails immediately
   with a clear message if not, rather than letting the seed files fail
   with a wall of "relation does not exist" errors.
3. **Ensures an admin user exists** — the artifact/artifact-attribution
   inserts in `seed-data/*.sql` are guarded with
   `... and exists (select 1 from "user")`; without a `user` row, those
   specific inserts silently no-op. If none exists and `ADMIN_EMAIL`/
   `ADMIN_PASSWORD` are set, the script creates one directly via SQL using
   Postgres's `pgcrypto` extension (`crypt()`/`gen_salt('bf')`) — verified
   to produce a bcrypt hash `backend/src/auth/auth.service.ts`'s
   `bcryptjs.compare()` accepts, not just assumed compatible.
4. **Loads the seed files**, in order:
   `seed-data/populate_durer.sql`, then
   `seed-data/populate_northern_renaissance_artists.sql`.
5. **Prints row counts** for every seeded table, so you can see exactly
   what landed.

Every step is idempotent. Running the script again after a successful run
reconfirms the same counts and changes nothing — this was verified by
running it three times in a row against a fresh database (first without
an admin available, then with one, then a third identical re-run) and
confirming identical, correct row counts each time reference data was
expected to be present.

## Usage

```bash
chmod +x scripts/load-seed-data.sh

# Simplest — reads DATABASE_URL out of backend/.env if you've already set that up
./scripts/load-seed-data.sh

# Explicit DATABASE_URL, and create the admin user this needs if one doesn't exist yet
DATABASE_URL=postgresql://user:pass@host:port/db \
  ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='choose-a-real-password' \
  ./scripts/load-seed-data.sh
```

If you omit `ADMIN_EMAIL`/`ADMIN_PASSWORD` and no `user` row exists yet,
the script still loads everything it can (Country/Period/School/Medium/
Artist rows don't require one) and prints a warning that Artifact rows
were skipped, rather than failing outright.

## Expected output

```
    t     | count
----------+-------
 artifact |    58
 artist   |    20
 country  |     4
 medium   |     7
 period   |     1
 role     |     3
 school   |     4
 user     |     1
(8 rows)
```

If your counts differ:
- **`artifact: 0`, everything else present** — no admin user existed and
  none was created; re-run with `ADMIN_EMAIL`/`ADMIN_PASSWORD` set.
- **Preflight fails with "'artifact' table doesn't exist yet"** — the
  schema hasn't been applied to this database. Run
  `supabase-schema/schema.sql` against it first (see
  `docs/RUNBOOK_seed_supabase.md` Step 2), then re-run this script.
- **Counts higher than expected** — you (or someone else) already ran
  this against the same database before, or added other data — the
  script doesn't touch or reset anything that was already there.

## Relationship to the other docs

- `docs/RUNBOOK_seed_supabase.md` — the full manual sequence (reset →
  schema → seed), written as copy-paste SQL Editor steps for someone
  without a local shell/psql set up against the target database. This
  script automates that runbook's Steps 3–5.
- `docs/INSTALL_linux_deb.md` — installs `psql` (and everything else)
  if the machine running this script doesn't have it yet.
