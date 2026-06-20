#!/bin/bash
# GuildMark production deploy script
# Builds images, starts Appwrite, redeploys the prod stack. Run from anywhere —
# it anchors itself to the repo root. Mirrors scripts/deploy.cmd.
set -e

# ── Move to repo root (parent of this scripts/ folder) ──────────────────────
cd "$(dirname "$0")/.."

echo "[$(date '+%F %T')] Starting deployment..."

# ── Ensure the shared external network exists (Appwrite + prod declare it external) ─
docker network inspect guildmark-net >/dev/null 2>&1 || docker network create guildmark-net

# ── Build prod images (secrets injected via Doppler) ────────────────────────
doppler run -- docker compose -f docker-compose.prod.yml build --no-cache

# ── Start Appwrite stack (uses its own env file) ────────────────────────────
docker compose --env-file .env.appwrite -f docker-compose.appwrite.yml up -d

# ── Redeploy prod services ──────────────────────────────────────────────────
doppler run -- docker compose -f docker-compose.prod.yml up -d

echo "[$(date '+%F %T')] Deployment complete"
