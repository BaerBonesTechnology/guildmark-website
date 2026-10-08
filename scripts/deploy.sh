#!/usr/bin/env bash
# Deploy only the native API. Appwrite Cloud defaults are in the compose file.
# Run after migrating the datastore and configuring an HTTPS API ingress.
set -euo pipefail
cd "$(dirname "$0")/.."

compose=(docker compose -f docker-compose.prod.yml)
if [[ -n "${DOPPLER_PROJECT:-}" ]]; then
  compose=(docker compose --env-file /dev/null -f docker-compose.prod.yml)
elif command -v doppler >/dev/null 2>&1 && [[ -f doppler.yaml ]]; then
  compose=(doppler run -- docker compose --env-file /dev/null -f docker-compose.prod.yml)
fi

"${compose[@]}" config --quiet
"${compose[@]}" build api
"${compose[@]}" up -d --no-deps api
# Do not remove old datastore containers/volumes automatically during migration.
printf 'API deployed. Verify health and Cloud data before retiring legacy services.\n'
