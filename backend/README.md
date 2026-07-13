# Artium Gallery — Backend

NestJS + Prisma + GraphQL API, backed by PostgreSQL (Supabase). See the root
`Artium-Gallery_Design_Document.md` (Section 4/6) for the full architecture,
and `Artium-Gallery_Deployment_Environments.docx` for hosting (Railway).

## Setup

```
cp .env.example .env   # fill in DATABASE_URL + storage credentials
npm install
npm run prisma:generate
npm run start:dev
```

`prisma/schema.prisma` is the single source of truth for the app's database
access. The raw SQL in `../supabase-schema/schema.sql` and `reset.sql` is kept
separately for manual use in the Supabase SQL Editor (see that folder's
notes on why — this sandbox's network policy blocks direct DB access).

## Layout

- `src/organizations/` — Museum/Organization CRUD (Admin + Curator only)
- `src/collections/` — Collection CRUD, Period tagging (Admin + Curator, or
  Contributor with a `manage` CollectionAccess grant)
- `src/artists/` — Artist portrait upload/read (REST, not GraphQL — binary streaming)
- `src/attachments/` — Artifact file attachments (two-step signed-upload flow)
- `src/storage/` — S3/Cloudflare R2 abstraction (see Design Document Section 6.2 for the key layout)
- `src/prisma/` — Prisma client wrapper, injected app-wide

Auth (JwtAuthGuard/RolesGuard/@Roles/@CurrentUser) is not yet implemented —
resolvers have `TODO` comments marking where role enforcement plugs in once
it exists.
