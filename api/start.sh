#!/usr/bin/env bash
#
# AsTech dev startup — boots Postgres + Python ML in Docker, then runs the
# Dart Frog API in the foreground for hot reload. Ctrl+C tears everything down.
#
# Usage:
#   ./start.sh             # default — Postgres + ML in Docker, Dart API local
#   ./start.sh --all-docker # also run the Dart API in Docker
#   ./start.sh --no-db     # skip Postgres + ML (assume they're already up)
#   ./start.sh --logs      # tail logs of all services and exit
#
# Run from the repo root (astech-server/).

set -euo pipefail

# ---------------------------------------------------------------------------
# Pretty-print helpers
# ---------------------------------------------------------------------------

C_RESET=$'\033[0m'
C_BOLD=$'\033[1m'
C_GREEN=$'\033[32m'
C_YELLOW=$'\033[33m'
C_BLUE=$'\033[34m'
C_RED=$'\033[31m'
C_DIM=$'\033[2m'

log()  { printf "%s[astech]%s %s\n" "$C_BLUE" "$C_RESET" "$*"; }
ok()   { printf "%s[astech]%s %s%s%s\n" "$C_BLUE" "$C_RESET" "$C_GREEN" "$*" "$C_RESET"; }
warn() { printf "%s[astech]%s %s%s%s\n" "$C_BLUE" "$C_RESET" "$C_YELLOW" "$*" "$C_RESET"; }
err()  { printf "%s[astech]%s %s%s%s\n" "$C_BLUE" "$C_RESET" "$C_RED" "$*" "$C_RESET" >&2; }

# ---------------------------------------------------------------------------
# Args
# ---------------------------------------------------------------------------

MODE="local-api"   # default: Dart API runs locally
case "${1:-}" in
  --all-docker) MODE="all-docker" ;;
  --no-db)      MODE="no-db" ;;
  --logs)       MODE="logs" ;;
  -h|--help)
    sed -n '2,15p' "$0"
    exit 0
    ;;
  "") ;;
  *)  err "Unknown flag: $1"; exit 2 ;;
esac

# ---------------------------------------------------------------------------
# Locate compose CLI (Compose V2 prefers `docker compose`, fall back to V1)
# ---------------------------------------------------------------------------

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  err "Need either Docker Compose v2 (docker compose) or v1 (docker-compose) installed."
  exit 1
fi

cd "$(dirname "$0")"

# Source .env so DATABASE_URL etc. are visible to the local Dart process.
# Strip \r so Windows-saved (CRLF) .env files don't break bash sourcing.
_source_env() { set -a; source <(sed 's/\r$//' "$1"); set +a; }

if [[ -f .env ]]; then
  log "loading .env"
  _source_env .env
elif [[ -f .env.example ]]; then
  warn "no .env found — copying .env.example. Edit it before going beyond dev."
  cp .env.example .env
  _source_env .env
fi

# ---------------------------------------------------------------------------
# Cleanup trap — runs on Ctrl+C, normal exit, and errors.
# ---------------------------------------------------------------------------

cleanup() {
  echo
  log "shutting down..."
  if [[ "$MODE" != "no-db" && "$MODE" != "logs" ]]; then
    "${COMPOSE[@]}" down --remove-orphans 2>/dev/null || true
  fi
  ok "bye."
}
trap cleanup INT TERM EXIT

# ---------------------------------------------------------------------------
# Subcommands
# ---------------------------------------------------------------------------

if [[ "$MODE" == "logs" ]]; then
  trap - INT TERM EXIT       # don't tear down on log tailing
  exec "${COMPOSE[@]}" logs -f --tail=50
fi

# ---------------------------------------------------------------------------
# Wait helpers
# ---------------------------------------------------------------------------

wait_for() {
  local label="$1" max="$2" cmd="$3"
  log "waiting for $label..."
  local i=0
  while ! eval "$cmd" >/dev/null 2>&1; do
    ((i++))
    if (( i >= max )); then
      err "$label did not become ready after $max attempts"
      return 1
    fi
    sleep 1
  done
  ok "$label is ready"
}

# ---------------------------------------------------------------------------
# Boot Postgres + ML (unless --no-db)
# ---------------------------------------------------------------------------

if [[ "$MODE" != "no-db" ]]; then
  log "starting postgres + ml service..."
  "${COMPOSE[@]}" up -d postgres ml

  # Compose health checks already define readiness; poll them so we don't
  # race ahead while the containers are still warming.
  wait_for "postgres"   60 "${COMPOSE[*]} exec -T postgres pg_isready -q"
  wait_for "ml service" 60 "curl -fsS http://localhost:${ML_PORT:-8001}/health"
fi

# ---------------------------------------------------------------------------
# Run the Dart API (foreground = blocks until Ctrl+C)
# ---------------------------------------------------------------------------

if [[ "$MODE" == "all-docker" ]]; then
  log "starting Dart API in Docker..."
  "${COMPOSE[@]}" up -d api
  wait_for "Dart API" 60 "curl -fsS http://localhost:${API_PORT:-8080}/"

  printf "\n%s%sAsTech is up%s\n" "$C_BOLD" "$C_GREEN" "$C_RESET"
  printf "  API:       http://localhost:%s\n"     "${API_PORT:-8080}"
  printf "  ML:        http://localhost:%s\n"     "${ML_PORT:-8001}"
  printf "  Postgres:  localhost:%s\n"            "${POSTGRES_PORT:-5432}"
  printf "  %sStreaming logs (Ctrl+C to stop):%s\n\n" "$C_DIM" "$C_RESET"

  # Tail logs from all services until Ctrl+C, then cleanup runs.
  "${COMPOSE[@]}" logs -f --tail=20
  exit 0
fi

# Local Dart mode: ensure dart_frog CLI exists so we don't fail mid-launch.
if ! command -v dart_frog >/dev/null 2>&1; then
  warn "dart_frog CLI not found — installing..."
  dart pub global activate dart_frog_cli
fi

cd bin

if [[ ! -d .dart_tool ]]; then
  log "fetching Dart dependencies..."
  dart pub get
fi

# Generate freezed/json_serializable parts if they're missing — fresh clones
# won't have *.freezed.dart / *.g.dart in lib/models/ until build_runner runs.
if ! ls lib/models/*.freezed.dart >/dev/null 2>&1; then
  log "running build_runner (freezed + json_serializable codegen)..."
  dart run build_runner build --delete-conflicting-outputs  # run from api/bin/
fi

printf "\n%s%sAsTech dev stack ready%s\n" "$C_BOLD" "$C_GREEN" "$C_RESET"
printf "  API (this terminal):  http://localhost:%s\n" "${API_PORT:-8080}"
printf "  ML (docker):          http://localhost:%s\n" "${ML_PORT:-8001}"
printf "  Postgres (docker):    localhost:%s\n"        "${POSTGRES_PORT:-5432}"
printf "  Frontend should set:  VITE_API_URL=http://localhost:%s\n\n" "${API_PORT:-8080}"

log "starting Dart Frog (hot reload)..."
exec dart_frog dev
