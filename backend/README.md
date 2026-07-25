# Artium Gallery — Backend

NestJS + Prisma + GraphQL API, backed by PostgreSQL (Supabase). See the root
`Artium-Gallery_Design_Document.md` (Section 4/6) for the full architecture,
and `Artium-Gallery_Deployment_Environments.docx` for hosting (Railway).

## Setup

```
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, storage credentials
npm install
npx prisma db push     # applies schema.prisma to DATABASE_URL directly (no migration history)
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=change-me npm run seed:admin
npm run start:dev
```

`prisma/schema.prisma` is the single source of truth for the app's database
access. The raw SQL in `../supabase-schema/schema.sql` and `reset.sql` is kept
separately for manual use in the Supabase SQL Editor (see that folder's
notes on why — this sandbox's network policy blocks direct DB access).
Verified end-to-end (login → create Organization → create Collection →
tag a Period → public read) against a real local Postgres while building
this.

## Layout

- `src/auth/` — JWT login (`login` mutation), `JwtStrategy`
- `src/common/guards`, `src/common/decorators` — `JwtAuthGuard`, `RolesGuard`,
  `@Roles(...)`, `@CurrentUser()`
- `src/organizations/` — Museum/Organization CRUD (Admin + Curator only)
- `src/collections/` — Collection CRUD, Period tagging (Admin + Curator, or
  Contributor with a `manage` CollectionAccess grant — see
  `canManageCollection()`)
- `src/artists/` — Artist portrait upload/read (REST, not GraphQL — binary
  streaming), `artistsByCollection` and `artistDetail` (GraphQL, backs
  AboutArtistPage.tsx)
- `src/artifacts/` — `artifact(id)` detail query, backs ArtifactPage.tsx
- `src/attachments/` — Artifact file attachments (two-step signed-upload
  flow) plus `toDetail()`, shared by artists/artifacts to resolve a signed
  preview URL + display label for each Attachment
- `src/storage/` — S3/Cloudflare R2 abstraction (see Design Document Section
  6.2 for the key layout)
- `src/prisma/` — Prisma client wrapper, injected app-wide

Known gaps:
- `CollectionsService.findById()` doesn't yet enforce the private-Collection
  visibility rule (Section 2.4.2) the way `listVisibleTo()` does — see the
  `TODO` in that file.
- `Artist` has no `birthYear`/`deathYear` columns and `Attachment` has no
  `label`/`role` columns — `artistDetail`/`artifact` derive what they can
  (a filename-based label) and leave the rest `null`/undefined rather than
  inventing data. Adding those columns is a schema change, not a resolver fix.
- `primaryImageUrl`/`thumbnailUrl` are a best-effort pick (first image-type
  Attachment) — there's no stored "this is the primary image" flag on
  Attachment today.

## Deploying to Railway

Railway itself isn't reachable from this repo's dev sandbox, so run these
from your own machine:

```
npm install -g @railway/cli
railway login
cd backend
railway init            # or `railway link` to an existing project
railway up
```

On a remote box/SSH session/coding agent with no local browser, use
`railway login -b` (`--browserless`) instead — it prints a sign-in link
and short code to complete from any device with a browser, rather than
trying to open one locally. The device-code flow it uses can be flaky
(polling/timing), so **if it doesn't complete, just re-run it a few times
until it succeeds** rather than assuming something's actually broken.
If a browser *is* available on the machine running this, prefer plain
`railway login` — the CLI's own docs note the browser flow completes more
reliably than `-b` when there's a choice.

Then, in the Railway dashboard, set these environment variables on the
service (same names as `.env.example`): `DATABASE_URL`, `JWT_SECRET`,
`STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_ENDPOINT`,
`MEDIA_BUCKET`. `railway.json` in this folder tells Railway how to build
(`npm run build`) and start (`npm run start:prod`) the service — Nixpacks
picks it up automatically.

Before or after the first deploy, apply the schema to the target database
once (either via the Supabase SQL Editor with `../supabase-schema/schema.sql`,
or by running `npx prisma db push` locally against the production
`DATABASE_URL`), and seed an admin with `npm run seed:admin`.
