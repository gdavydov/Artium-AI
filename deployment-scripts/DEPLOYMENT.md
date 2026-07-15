# Artium-Gallery — Automated Deployment Guide

## Why scripted deployment, not manual CLI

Manual `railway login` / `railway up` from a local machine turned out to be
unreliable specifically on the Debian VM used for development (a local OAuth
callback server that never binds — see the troubleshooting history in this
project's chat log for full detail; this may be a real bug in `@railway/cli`
on Linux). Rather than continuing to fight that, deployments are driven by
**GitHub Actions**, triggered by `git push`. This runs on GitHub's own clean
runners, never touches the local VM's broken CLI auth, and gives you real
scripted control (tests before deploy, migrations before deploy, environment
separation) rather than a single manual command.

**The practical result: `git push` is your deploy command.**

## Two deployment targets, two sets of keys

| Environment | Branch | Backend host | Frontend host |
|---|---|---|---|
| **Production** | `main` | Railway (production service) | Vercel (production) |
| **Development/Preview** | any other branch / PR | Railway (dev service) | Vercel (automatic preview) |

Each environment uses **its own set of secrets** — a production key must never
be usable to deploy to, or read the credentials of, the dev environment, and
vice versa. This is enforced using GitHub's **Environments** feature (Settings
→ Environments → `production` / `development`), not just plain repo secrets,
so each set of keys is scoped correctly.

## Required secrets, per environment

Create these under **Repo Settings → Environments → [production|development]
→ Environment secrets** (not "Repository secrets" — environment-scoped
secrets keep prod and dev keys fully separated):

| Secret name | Where to get it | Notes |
|---|---|---|
| `RAILWAY_TOKEN` | Railway dashboard → the specific project's → Settings → Tokens | **Project-scoped token**, not an account token. Create one per environment/project (see Section "Getting a Railway project token" below) |
| `VERCEL_TOKEN` | Vercel dashboard → Account Settings → Tokens | Personal token; scope can be shared across environments if using one Vercel account, but the **project ID** below is what actually separates prod/preview |
| `VERCEL_ORG_ID` | Vercel project → Settings → General | Same for both environments if using one Vercel team |
| `VERCEL_PROJECT_ID` | Vercel project → Settings → General | Same project ID handles both prod and preview deploys automatically — Vercel's own branch logic decides which |
| `DATABASE_URL` | Supabase project → Settings → Database → Connection Pooling | **Different value per environment** — separate Supabase projects for dev/prod, per the Design Document's dev/prod split (Section 7.4) |
| `DIRECT_URL` | Supabase project → Settings → Database → Connection string (direct) | Used only for `prisma migrate deploy`, separate per environment |
| `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY` | Cloudflare R2 → Manage API Tokens | Separate R2 bucket credentials per environment |
| `JWT_SECRET` | Generate with `openssl rand -base64 32` | **Different value per environment** — never reuse a dev secret in production |

### Getting a Railway project token specifically

Project-scoped tokens (what `RAILWAY_TOKEN` should be) are created **inside a
project**, not from account-level settings:
1. Railway dashboard → open the specific project (e.g. the production backend
   service)
2. Project **Settings → Tokens**
3. **Create Token** → copy it immediately (shown once)

Repeat separately for the dev/staging project if you're running one — this
naturally gives you two different keys, one per environment, which is the
whole point.

## The workflow files

Two workflow files live in `.github/workflows/`:

- **`deploy-backend.yml`** — runs Prisma migrations, then deploys the NestJS
  API to Railway
- **`deploy-frontend.yml`** — deploys the Next.js catalog to Vercel

Both trigger on push to `main` (production) and can be adapted to also run on
other branches for preview/dev deploys — see the `on:` block in each file.

## Manual/local scripted alternative

If you ever want to trigger a deploy from a local machine or a different CI
system (not GitHub Actions), `scripts/deploy.sh` in this bundle does the same
steps as the GitHub Actions workflow, parameterized by environment. This is
useful for a one-off manual deploy without touching the interactive
`railway login` flow at all — it uses `RAILWAY_TOKEN` directly, the same way
the GitHub Actions workflow does, sidestepping the broken interactive login
entirely.

Usage:
```bash
RAILWAY_TOKEN=<project-token> ./scripts/deploy.sh production
RAILWAY_TOKEN=<dev-project-token> ./scripts/deploy.sh development
```

## What's NOT included here

This guide assumes your project's actual `README.md` files (backend,
frontend, or repo root) may already document build steps, test commands, or
project-specific conventions not captured in this conversation. If you paste
those in, this guide and the workflow files below should be merged with/
updated to match your actual `package.json` scripts, folder structure, and
any existing CI you already have — right now the workflows assume:
- Backend lives at `backend/` with `pnpm` as the package manager (confirmed
  from this project's actual terminal history)
- Frontend lives at `frontend/` (assumed — adjust the `working-directory` in
  `deploy-frontend.yml` if it's named differently)
- `pnpm run prisma:migrate` deploys migrations (matches the script name seen
  in this project's `package.json` from earlier troubleshooting)
