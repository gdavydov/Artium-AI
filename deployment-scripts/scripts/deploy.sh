#!/usr/bin/env bash
#
# Manual/local scripted deploy — an alternative to the GitHub Actions
# workflows, for triggering a deploy directly from a local machine or a
# different CI system. Uses RAILWAY_TOKEN directly (a project-scoped token),
# which sidesteps the interactive `railway login` flow entirely — the same
# approach used by the GitHub Actions workflow.
#
# USAGE:
#   RAILWAY_TOKEN=<project-token> ./scripts/deploy.sh production
#   RAILWAY_TOKEN=<dev-project-token> ./scripts/deploy.sh development
#
# Each environment needs its OWN RAILWAY_TOKEN — a production project token
# and a development project token are two different, separately-generated
# values (see DEPLOYMENT.md, "Getting a Railway project token").

set -euo pipefail

ENVIRONMENT="${1:-}"

if [[ -z "$ENVIRONMENT" ]]; then
  echo "Usage: RAILWAY_TOKEN=<token> ./scripts/deploy.sh <production|development>"
  exit 1
fi

if [[ -z "${RAILWAY_TOKEN:-}" ]]; then
  echo "Error: RAILWAY_TOKEN environment variable is not set."
  echo "Get a project-scoped token from: Railway dashboard -> your project -> Settings -> Tokens"
  exit 1
fi

case "$ENVIRONMENT" in
  production)
    ENV_FILE=".env.production"
    ;;
  development)
    ENV_FILE=".env.development"
    ;;
  *)
    echo "Error: environment must be 'production' or 'development', got '$ENVIRONMENT'"
    exit 1
    ;;
esac

echo "==> Deploying backend to Railway ($ENVIRONMENT)"
cd "$(dirname "$0")/../backend"

if [[ -f "$ENV_FILE" ]]; then
  echo "==> Loading $ENV_FILE"
  set -o allexport
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +o allexport
else
  echo "Warning: $ENV_FILE not found — relying on already-exported env vars."
fi

echo "==> Installing dependencies (pnpm)"
pnpm install --frozen-lockfile

echo "==> Generating Prisma client"
pnpm run prisma:generate

echo "==> Running database migrations"
pnpm run prisma:migrate

echo "==> Running tests"
pnpm test

echo "==> Deploying to Railway"
npx --yes @railway/cli up --service backend

echo "==> Done. Deployed $ENVIRONMENT via RAILWAY_TOKEN (no interactive login used)."
