# Artium-AI
Repository for Artium Claude AI app

## Layout

- `backend/` — NestJS + Prisma + GraphQL API (see `backend/README.md`)
- `frontend/` — Next.js catalog app (see `frontend/README.md`)
- `supabase-schema/` — raw SQL (`schema.sql`, `reset.sql`) for manual use in the Supabase SQL Editor
- `seed-data/` — seed scripts/data for populating the database
- `scripts/install-dependencies.sh` — installs every CLI needed to build/deploy this repo on a fresh Linux machine (see `docs/INSTALL_linux_deb.md`)
- `docs/Artium-Gallery_Design_Document.md` / `.docx` — full architecture and data model
- `docs/Artium-Gallery_Business_Requirements_Document.docx`, `docs/Artium-Gallery_Deployment_Environments.docx` — supporting docs

## Setting up a new machine

```bash
chmod +x scripts/install-dependencies.sh
./scripts/install-dependencies.sh
```

Installs Node.js, npm, pnpm, git, `psql`, and the Railway/Vercel/Wrangler/
Supabase CLIs. See `docs/INSTALL_linux_deb.md` for what each one is for and what to
do next.
