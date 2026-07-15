# Installing Development/Deployment Tools — Linux

This document explains what `scripts/install-dependencies.sh` installs, why
each tool is needed for Artium Gallery, and what to do once it's finished.
The script itself is the executable counterpart to this document — read
either one, they cover the same ground.

## Who this is for

Anyone setting up a fresh Debian/Ubuntu Linux machine (a laptop, a VM, a
CI runner) to build, run, or deploy `backend/` and `frontend/`. It targets
apt-based distros specifically, matching this project's dev sandbox
(Ubuntu 24.04) and the Debian-based images Railway/Nixpacks build from.

## Quick start

```bash
chmod +x scripts/install-dependencies.sh
./scripts/install-dependencies.sh
```

Run it as root, or as a user with passwordless `sudo` — every apt/system
step in the script uses `sudo` automatically when you're not already root.
The script is **idempotent**: re-running it after a successful run just
prints the already-installed versions and does nothing destructive, so
it's safe to run again if you're not sure what state a machine is in.

## What gets installed, and why

| Tool | Why Artium Gallery needs it |
|---|---|
| **Node.js 20 LTS** | Runs and builds both `backend/` (NestJS) and `frontend/` (Next.js). Next.js 14 requires Node ≥18.17; 20 is the current LTS. |
| **npm** | Ships with Node. This repo's own `package-lock.json` files (in `backend/` and `frontend/`) are npm lockfiles — npm is what the project's own scripts assume. |
| **pnpm** | Installed because it was asked for explicitly. Not required by this repo's own tooling (which commits npm lockfiles), but available if you prefer it for ad-hoc work outside the two apps. |
| **git** | Clone/push this repo. |
| **postgresql-client** (`psql`) | Manually running `supabase-schema/schema.sql`, `reset.sql`, and the `seed-data/*.sql` files against your Supabase database — see `supabase-schema/`'s own notes on why this is a manual step rather than an automated migration. |
| **Railway CLI** | Deploys `backend/` — see `backend/README.md`'s "Deploying to Railway" section. |
| **Vercel CLI** | Deploys `frontend/` — see `frontend/README.md`'s "Deploying to Vercel or Railway" section. |
| **Wrangler** (Cloudflare CLI) | Manages the Cloudflare R2 bucket used for object storage (Design Document Section 6.2), and is also the CLI for Cloudflare Pages if you ever deploy the frontend there instead of Vercel. |
| **Supabase CLI** *(optional)* | For `supabase db push` / migration-style workflows, if you outgrow the manual-SQL-Editor approach this repo uses today. Installed from Supabase's GitHub releases, not npm — the `supabase` npm package deliberately refuses a global install and tells you to do this instead. |
| **build-essential, ca-certificates, gnupg, curl, jq, openssl** | General prerequisites: compiling any native npm module that needs it, verifying NodeSource's apt repo signing key, parsing JSON in shell (used by the script itself), and generating a `JWT_SECRET` (see `backend/.env.example`). |

## Optional flags

Set these as environment variables before running the script:

```bash
# Skip the Supabase CLI entirely
INSTALL_SUPABASE_CLI=false ./scripts/install-dependencies.sh

# Also install @nestjs/cli and prisma as *global* commands.
# Not required — backend/package.json already runs both via npx/local
# node_modules once you've run `npm install` inside backend/. This is a
# convenience only, for when you want the bare `nest`/`prisma` commands
# available outside that folder.
INSTALL_GLOBAL_PROJECT_CLIS=true ./scripts/install-dependencies.sh
```

## After the script finishes

1. **Log each deploy CLI in** (interactive — the script can't do this for you):
   ```bash
   railway login
   vercel login
   wrangler login
   supabase login   # only if you installed it
   ```
2. **Set up the backend** — follow `backend/README.md`'s Setup section
   (`.env`, `npx prisma db push`, `npm run seed:admin`).
3. **Set up the frontend** — follow `frontend/README.md`'s Setup section
   (`.env`, point `NEXT_PUBLIC_API_URL` at the backend).
4. **Deploy** — `backend/README.md` and `frontend/README.md` each have a
   "Deploying to..." section with the exact `railway`/`vercel` commands
   and which environment variables to set on each platform.

## Troubleshooting

- **"Cannot find /etc/os-release" / distro warning at the top of the
  script's output** — this script only supports Debian/Ubuntu (apt-based)
  systems. On anything else (Fedora, Arch, macOS), install the tools in
  the table above using that platform's own package manager instead.
- **Supabase CLI step fails** — this step is wrapped so a failure here
  (GitHub API rate limiting, a network blip) prints a warning and lets the
  rest of the script finish; it doesn't abort everything. Install it
  manually later from <https://github.com/supabase/cli/releases> if you
  need it — it's optional for this project either way.
- **"Neither running as root nor is 'sudo' available"** — the script needs
  one or the other to run `apt-get`. Either re-run as root, or install
  `sudo` first.
- **`npm install -g ...` fails with permission errors** — this usually
  means Node was installed in a way that makes its global directory
  root-owned while you're running as a non-root user without sudo. Either
  run the whole script as root/sudo (as documented above), or reconfigure
  npm's global prefix to a directory your user owns.
