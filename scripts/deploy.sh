#!/bin/bash
set -e
cd "$(dirname "$0")/.."                       # repo root, regardless of CWD

echo "[$(date '+%F %T')] Starting deployment..."
 docker network create guildmark-net 2>/dev/null || true   # shared external net

doppler run -- docker compose -f docker-compose.prod.yml build --no-cache
docker compose -- env-file .env.appwrite -f docker-compose.appwrite.yml up -d
doppler run --docker compose -f docker-compose.prod.yml up -d
echo "[$(date '+%F %T')] Deployment complete"