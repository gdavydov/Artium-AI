#!/usr/bin/env bash
#
# scripts/install-dependencies.sh
#
# Installs every CLI tool needed to build, run, and deploy Artium Gallery
# (backend/ + frontend/) on a Debian/Ubuntu Linux machine — the same distro
# family this project's dev sandbox, Railway, and most Nixpacks-based
# deploy images use.
#
# What this installs, and why each one is here:
#   - Node.js 20 LTS + npm  -> runs/builds both backend/ (NestJS) and
#                              frontend/ (Next.js); npm ships with Node.
#   - pnpm                  -> requested explicitly; not required by this
#                              repo's own scripts (which use npm and commit
#                              package-lock.json), but installed so it's
#                              available if you prefer it for ad-hoc work.
#   - git                   -> clone/push this repo.
#   - postgresql-client     -> gives you `psql`, used to run
#                              supabase-schema/schema.sql, reset.sql, and
#                              the seed-data/*.sql files against Supabase
#                              by hand (see supabase-schema's own notes on
#                              why this is a manual step).
#   - Railway CLI           -> deploys backend/ (see backend/README.md).
#   - Vercel CLI            -> deploys frontend/ (see frontend/README.md).
#   - Wrangler (Cloudflare) -> manages the R2 bucket used for object
#                              storage (Design Document Section 6.2), and
#                              is the CLI for Cloudflare Pages if you ever
#                              deploy the frontend there instead of Vercel.
#   - Supabase CLI          -> optional; useful for `supabase db push` /
#                              migration workflows if you move off the
#                              manual-SQL-Editor approach this repo uses
#                              today. Installed from Supabase's own GitHub
#                              releases, not npm — the `supabase` npm
#                              package deliberately refuses a global
#                              install and tells you to do this instead.
#   - build-essential, ca-certificates, gnupg, curl, jq, openssl
#                           -> general prerequisites: compiling any native
#                              npm module that needs it, verifying
#                              NodeSource's apt repo, parsing JSON in
#                              shell, and generating JWT_SECRET
#                              (see backend/.env.example).
#
# Usage:
#   chmod +x scripts/install-dependencies.sh
#   ./scripts/install-dependencies.sh
#
# Every step is idempotent — re-running this script after it's already
# succeeded just verifies versions and does nothing destructive. Run as
# root, or as a user with passwordless sudo (the script uses `sudo` for
# every apt/system-level step and will simply fail with a clear apt/sudo
# error if you have neither).
#
# Optional environment variables (set to "true" to opt in):
#   INSTALL_SUPABASE_CLI=true         (default: true)
#   INSTALL_GLOBAL_PROJECT_CLIS=true  (default: false — @nestjs/cli and
#                                       prisma as *global* commands; the
#                                       repo's own `npm run` scripts call
#                                       these via npx/local node_modules
#                                       already, so this is a convenience
#                                       only, not a requirement)
#
# Example: skip the Supabase CLI, install the optional project CLIs too:
#   INSTALL_SUPABASE_CLI=false INSTALL_GLOBAL_PROJECT_CLIS=true ./scripts/install-dependencies.sh

set -euo pipefail

# --- tunables -----------------------------------------------------------

NODE_MAJOR="20"   # LTS line matching Next.js 14 / NestJS 10's minimum (>=18.17); 20 is the current LTS.
INSTALL_SUPABASE_CLI="${INSTALL_SUPABASE_CLI:-true}"
INSTALL_GLOBAL_PROJECT_CLIS="${INSTALL_GLOBAL_PROJECT_CLIS:-false}"

# --- small helpers --------------------------------------------------------

# Prints a heading so the script's output is easy to scan.
step() {
  printf '\n\033[1;34m==> %s\033[0m\n' "$1"
}

# True if the given command exists on PATH.
have() {
  command -v "$1" >/dev/null 2>&1
}

# Runs apt-get with sudo if we're not already root.
as_root() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  else
    sudo "$@"
  fi
}

# --- 0. sanity checks -----------------------------------------------------

step "Checking this is a Debian/Ubuntu system"

if [ ! -f /etc/os-release ]; then
  echo "Cannot find /etc/os-release — this script only supports Debian/Ubuntu (apt-based) systems." >&2
  exit 1
fi

# shellcheck disable=SC1091
. /etc/os-release
case "${ID:-}:${ID_LIKE:-}" in
  *debian*|*ubuntu*)
    echo "Detected: ${PRETTY_NAME:-$ID}"
    ;;
  *)
    echo "Detected: ${PRETTY_NAME:-$ID} — this script targets Debian/Ubuntu (apt) and hasn't been tested elsewhere." >&2
    echo "It will likely fail at the first 'apt-get' call. Continuing anyway in 5s (Ctrl-C to stop)..." >&2
    sleep 5
    ;;
esac

if ! have sudo && [ "$(id -u)" -ne 0 ]; then
  echo "Neither running as root nor is 'sudo' available — this script needs one or the other for apt installs." >&2
  exit 1
fi

# --- 1. base apt prerequisites --------------------------------------------

step "Installing base prerequisites (git, curl, jq, openssl, build tools, PostgreSQL client)"

as_root apt-get update -y
as_root apt-get install -y \
  ca-certificates \
  curl \
  gnupg \
  jq \
  openssl \
  git \
  build-essential \
  postgresql-client

# --- 2. Node.js + npm ------------------------------------------------------

step "Installing Node.js ${NODE_MAJOR}.x (npm comes bundled)"

node_needs_install=true
if have node; then
  current_major="$(node -p 'process.versions.node.split(".")[0]')"
  if [ "$current_major" -ge "$NODE_MAJOR" ]; then
    echo "node $(node -v) already installed and >= v${NODE_MAJOR} — skipping."
    node_needs_install=false
  else
    echo "node $(node -v) is older than the required v${NODE_MAJOR} — will upgrade."
  fi
fi

if [ "$node_needs_install" = true ]; then
  # NodeSource's official setup script adds their apt repo + signing key,
  # then `apt-get install nodejs` pulls in npm automatically.
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | as_root bash -
  as_root apt-get install -y nodejs
fi

echo "node:  $(node -v)"
echo "npm:   $(npm -v)"

# --- 3. pnpm ----------------------------------------------------------------

step "Installing pnpm"

if have pnpm; then
  echo "pnpm $(pnpm -v) already installed — skipping."
elif have corepack; then
  # corepack ships with Node >=16.13 but must be explicitly enabled; this is
  # the officially recommended way to get pnpm without a separate installer.
  corepack enable
  corepack prepare pnpm@latest --activate
  echo "pnpm $(pnpm -v) installed via corepack."
else
  # Fallback for older Node builds without corepack.
  npm install -g pnpm
  echo "pnpm $(pnpm -v) installed via npm."
fi

# --- 4. Railway CLI (deploys backend/) --------------------------------------

step "Installing Railway CLI"

if have railway; then
  echo "railway $(railway --version) already installed — skipping."
else
  npm install -g @railway/cli
  echo "railway $(railway --version) installed."
fi

# --- 5. Vercel CLI (deploys frontend/) --------------------------------------

step "Installing Vercel CLI"

if have vercel; then
  echo "vercel $(vercel --version) already installed — skipping."
else
  npm install -g vercel
  echo "vercel $(vercel --version) installed."
fi

# --- 6. Wrangler (Cloudflare R2 / Pages CLI) --------------------------------

step "Installing Wrangler (Cloudflare CLI)"

if have wrangler; then
  echo "wrangler $(wrangler --version) already installed — skipping."
else
  npm install -g wrangler
  echo "wrangler $(wrangler --version) installed."
fi

# --- 7. Supabase CLI (optional) ---------------------------------------------
#
# Wrapped in its own function so a hiccup here (GitHub API rate limiting,
# a network blip, an unrecognized architecture) can't take the rest of the
# script down with it via set -e/pipefail — this component is explicitly
# optional (see the header comment), and a failure here should print a
# warning and let everything else finish, not abort. `if install_supabase_cli;
# then ... else ... fi` is what makes that safe: bash suspends -e's
# immediate-exit behavior for commands run as a conditional's test, so a
# failing curl/jq inside the function just makes the function return
# non-zero instead of killing the script.
install_supabase_cli() {
  local arch supabase_arch latest_tag tarball_url tmp_dir

  arch="$(uname -m)"
  case "$arch" in
    x86_64) supabase_arch="amd64" ;;
    aarch64|arm64) supabase_arch="arm64" ;;
    *)
      echo "Unrecognized architecture '$arch' for the Supabase CLI." >&2
      return 1
      ;;
  esac

  # The `supabase` npm package refuses a global install on purpose and
  # points you at this instead: download the prebuilt binary from
  # Supabase's own GitHub releases.
  latest_tag="$(curl -fsSL https://api.github.com/repos/supabase/cli/releases/latest | jq -r '.tag_name')" || return 1
  [ -n "$latest_tag" ] && [ "$latest_tag" != "null" ] || return 1

  tarball_url="https://github.com/supabase/cli/releases/download/${latest_tag}/supabase_linux_${supabase_arch}.tar.gz"

  tmp_dir="$(mktemp -d)"
  curl -fsSL "$tarball_url" -o "${tmp_dir}/supabase.tar.gz" || { rm -rf "$tmp_dir"; return 1; }
  tar -xzf "${tmp_dir}/supabase.tar.gz" -C "$tmp_dir" || { rm -rf "$tmp_dir"; return 1; }
  as_root install -m 755 "${tmp_dir}/supabase" /usr/local/bin/supabase || { rm -rf "$tmp_dir"; return 1; }
  rm -rf "$tmp_dir"

  echo "supabase $(supabase --version) installed (${latest_tag})."
}

if [ "$INSTALL_SUPABASE_CLI" = "true" ]; then
  step "Installing Supabase CLI (optional)"

  if have supabase; then
    echo "supabase $(supabase --version) already installed — skipping."
  elif install_supabase_cli; then
    : # success message already printed inside the function
  else
    echo "Warning: Supabase CLI install failed (rate-limited GitHub API, network issue, or unsupported arch)." >&2
    echo "This is optional and safe to skip — install manually later from https://github.com/supabase/cli/releases" >&2
  fi
else
  step "Skipping Supabase CLI (INSTALL_SUPABASE_CLI=false)"
fi

# --- 8. Optional project-local CLIs as globals ------------------------------

if [ "$INSTALL_GLOBAL_PROJECT_CLIS" = "true" ]; then
  step "Installing @nestjs/cli and prisma globally (optional convenience)"
  # Not required: backend/package.json already runs these via npx/local
  # node_modules (see its "scripts" section) once you've run `npm install`
  # inside backend/. This just makes the bare `nest`/`prisma` commands
  # available anywhere on this machine.
  npm install -g @nestjs/cli prisma
  echo "nest:   $(nest --version 2>/dev/null || echo 'installed')"
  echo "prisma: $(prisma --version 2>/dev/null | head -1 || echo 'installed')"
else
  step "Skipping optional global @nestjs/cli / prisma (set INSTALL_GLOBAL_PROJECT_CLIS=true to include)"
fi

# --- 9. summary --------------------------------------------------------------

step "Done — installed versions"

printf '%-12s %s\n' "git"      "$(git --version 2>/dev/null || echo 'not found')"
printf '%-12s %s\n' "node"     "$(node -v 2>/dev/null || echo 'not found')"
printf '%-12s %s\n' "npm"      "$(npm -v 2>/dev/null || echo 'not found')"
printf '%-12s %s\n' "pnpm"     "$(pnpm -v 2>/dev/null || echo 'not found')"
printf '%-12s %s\n' "psql"     "$(psql --version 2>/dev/null || echo 'not found')"
printf '%-12s %s\n' "railway"  "$(railway --version 2>/dev/null || echo 'not found')"
printf '%-12s %s\n' "vercel"   "$(vercel --version 2>/dev/null || echo 'not found')"
printf '%-12s %s\n' "wrangler" "$(wrangler --version 2>/dev/null || echo 'not found')"
if [ "$INSTALL_SUPABASE_CLI" = "true" ]; then
  printf '%-12s %s\n' "supabase" "$(supabase --version 2>/dev/null || echo 'not found')"
fi

echo
echo "Next steps: see docs/INSTALL_linux_deb.md for how to log each CLI in (railway login,"
echo "vercel login, wrangler login) and finish setting up backend/ and frontend/."
