#!/usr/bin/env bash
# Local containers use Appwrite Cloud and in-process Dart valuation.
set -euo pipefail
cd "$(dirname "$0")"
mode="${1:-}"
case "$mode" in
  -h|--help)
    printf '%s\n' './start.sh [--dev|--build|--prod|--logs|--down|--appwrite]' \
      'Default/--dev: local API and three frontend containers.' \
      '--prod: API only; --appwrite: explicitly start legacy self-hosted Appwrite.' \
      'Set COMPOSE_FILE to select a different stack. No scheduled jobs are installed.'
    exit 0 ;;
  --db-only|--ml)
    printf 'PostgreSQL and the Python daemon are no longer runtime dependencies.\n' >&2
    exit 2 ;;
  ''|--dev|--build|--prod|--logs|--down|--appwrite) ;;
  *) printf 'Unknown option: %s\n' "$mode" >&2; exit 2 ;;
esac
if [[ "$mode" == '--appwrite' ]]; then
  docker network inspect guildmark-net >/dev/null 2>&1 || docker network create guildmark-net
  exec docker compose --env-file .env.appwrite -f docker-compose.appwrite.yml up -d
fi
compose_file="${COMPOSE_FILE:-docker-compose.dev.yml}"
[[ "$mode" == '--prod' ]] && compose_file=docker-compose.prod.yml
compose=(docker compose -f "$compose_file")
if [[ -n "${DOPPLER_PROJECT:-}" ]]; then
  compose=(docker compose --env-file /dev/null -f "$compose_file")
elif command -v doppler >/dev/null 2>&1 && [[ -f doppler.yaml ]]; then
  compose=(doppler run -- docker compose --env-file /dev/null -f "$compose_file")
fi
case "$mode" in
  --down) exec "${compose[@]}" down ;;
  --logs) exec "${compose[@]}" logs -f ;;
  --build) exec "${compose[@]}" up -d --build ;;
  *) exec "${compose[@]}" up -d ;;
esac
