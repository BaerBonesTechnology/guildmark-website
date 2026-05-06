#!/bin/bash
# GuildMark production deploy script
# Pulls latest images from Docker Hub and redeploys services

set -e

REPO_DIR="/path/to/your/repo"  # Change this to your actual repo path
cd "$REPO_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting deployment..."

# Pull latest images from Docker Hub
docker compose -f docker-compose.prod.yml pull

# Redeploy services
docker compose -f docker-compose.prod.yml up -d

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deployment complete"
