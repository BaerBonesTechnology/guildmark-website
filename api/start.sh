#!/usr/bin/env bash
# Compatibility entrypoint for the API-only container stack.
set -euo pipefail
cd "$(dirname "$0")"
case "${1:-}" in
  --logs) exec docker compose -f docker-compose.yml logs -f api ;;
  --down) exec docker compose -f docker-compose.yml down ;;
  ''|--all-docker) exec docker compose -f docker-compose.yml up -d --build api ;;
  *) printf 'Usage: api/start.sh [--all-docker|--logs|--down]\n'; exit 2 ;;
esac
