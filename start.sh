#!/usr/bin/env bash
# GuildMark — full-stack start script
#
# Usage:
#   ./start.sh              Full Docker — all four services in containers.
#                           Automatically uses docker-compose.prod.yml on master branch.
#   ./start.sh --dev        Dev mode — DB in Docker, apps run locally with HMR.
#   ./start.sh --db-only    Postgres only (use when running apps individually).
#   ./start.sh --build      Force-rebuild all Docker images, then start.
#   ./start.sh --down       Stop and remove all containers.
#   ./start.sh --logs       Tail logs from all running services and exit.
#   ./start.sh --ml         Full Docker, including the optional ML service.
#
# Run from the repo root (the folder containing this file).

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
C_RESET=$'\033[0m'
C_BOLD=$'\033[1m'
C_GREEN=$'\033[32m'
C_YELLOW=$'\033[33m'
C_BLUE=$'\033[34m'
C_RED=$'\033[31m'
C_DIM=$'\033[2m'

log()  { printf "%s[guildmark]%s %s\n"                     "$C_BLUE"  "$C_RESET" "$*"; }
ok()   { printf "%s[guildmark]%s %s%s%s\n"                 "$C_BLUE"  "$C_RESET" "$C_GREEN"  "$*" "$C_RESET"; }
warn() { printf "%s[guildmark]%s %s%s%s\n"                 "$C_BLUE"  "$C_RESET" "$C_YELLOW" "$*" "$C_RESET"; }
err()  { printf "%s[guildmark]%s %s%s%s\n" "$C_BLUE" "$C_RESET" "$C_RED"    "$*" "$C_RESET" >&2; }

# ── Parse args ───────────────────────────────────────────────────────────────
MODE="docker"
case "${1:-}" in
  --dev)     MODE="dev"      ;;
  --db-only) MODE="db-only"  ;;
  --build)   MODE="build"    ;;
  --down)    MODE="down"     ;;
  --logs)    MODE="logs"     ;;
  --ml)      MODE="ml"       ;;
  -h|--help)
    sed -n '2,14p' "$0"
    exit 0
    ;;
  "") ;;
  *) err "Unknown flag: $1 (try --help)"; exit 2 ;;
esac

# ── Check for Docker ──────────────────────────────────────────────────────────
if ! docker info >/dev/null 2>&1; then
  err "Docker is not running. Start Docker Desktop and try again."
  exit 1
fi

# ── Detect Compose v1 vs v2 ──────────────────────────────────────────────────
if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  err "Docker Compose not found. Install Docker Desktop (includes Compose v2)."
  exit 1
fi

# ── Move to repo root (where this script lives) ──────────────────────────────
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"

# ── Auto prod compose — use docker-compose.prod.yml on master branch ─────────
_GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
if [[ "$_GIT_BRANCH" == "master" ]]; then
  export COMPOSE_FILE=docker-compose.prod.yml
  warn "on master branch — using docker-compose.prod.yml"
fi

# ── Set up daily deployment cron job at 3 AM ─────────────────────────────────
setup_cron() {
  local deploy_script="$REPO_ROOT/scripts/deploy.sh"
  local cron_entry="0 3 * * * $deploy_script >> /var/log/guildmark-deploy.log 2>&1"
  
  mkdir -p "$REPO_ROOT/scripts"
  
  # Create deploy script if missing
  if [[ ! -f "$deploy_script" ]]; then
    cat > "$deploy_script" << 'EOF'
#!/bin/bash
set -e
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting deployment..."
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deployment complete"
EOF
    chmod +x "$deploy_script"
  fi
  
  # Add to crontab if not already present
  if ! crontab -l 2>/dev/null | grep -q "$deploy_script"; then
    (crontab -l 2>/dev/null || echo "") | grep -v "$deploy_script" | { cat; echo "$cron_entry"; } | crontab -
    ok "cron job added: daily pull and redeploy at 3 AM"
  fi
}

# Set up cron when running in docker/prod/build/ml mode
if [[ "$MODE" == "docker" || "$MODE" == "build" || "$MODE" == "ml" ]]; then
  setup_cron
fi

# ── Load secrets — Doppler (prod/CI) or .env fallback (local) ────────────────
# Strip \r so Windows-saved (CRLF) .env files don't break bash sourcing.
_source_env() { set -a; source <(sed 's/\r$//' "$1"); set +a; }

# If already running inside `doppler run --`, DOPPLER_PROJECT is set in the
# environment — don't re-invoke doppler or build-time vars will be dropped.
_USE_DOPPLER=false
if [[ -n "${DOPPLER_PROJECT:-}" ]]; then
  _USE_DOPPLER=true
  ok "Running inside Doppler environment — secrets already injected"
elif command -v doppler >/dev/null 2>&1 && [[ -f doppler.yaml ]]; then
  if doppler whoami >/dev/null 2>&1; then
    _USE_DOPPLER=true
    ok "Doppler authenticated — secrets will be injected at runtime"
  else
    warn "doppler.yaml found but not logged in — run: doppler login && doppler setup"
  fi
fi

if [[ "$_USE_DOPPLER" == "false" ]]; then
  if [[ -f .env ]]; then
    log "loading .env"
    _source_env .env
  elif [[ -f .env.example ]]; then
    warn "no .env found — copying .env.example. Edit values before using in prod."
    cp .env.example .env
    _source_env .env
  else
    warn "no .env or .env.example found — using built-in defaults."
  fi
fi

# Build the full compose invocation — with Doppler prefix when authenticated.
# When Doppler is active, pass --env-file /dev/null so Docker Compose doesn't
# read the .env file and override the Doppler-injected environment variables.
DOPPLER_PREFIX=()
ENV_FILE_ARG=()
if [[ "$_USE_DOPPLER" == "true" ]]; then
  DOPPLER_PREFIX=(doppler run --)
  ENV_FILE_ARG=(--env-file /dev/null)
fi
DC=("${DOPPLER_PREFIX[@]}" "${COMPOSE[@]}" "${ENV_FILE_ARG[@]}")

# ── Cleanup trap ──────────────────────────────────────────────────────────────
cleanup() {
  echo
  if [[ "$MODE" == "dev" ]]; then
    log "stopping background jobs..."
    jobs -p | xargs -r kill 2>/dev/null || true
    log "stopping Docker services..."
    "${DC[@]}" down --remove-orphans 2>/dev/null || true
  fi
  ok "bye."
}
trap cleanup INT TERM EXIT

# ── Helpers ──────────────────────────────────────────────────────────────────
wait_for_service() {
  local label="$1" max="$2" cmd="$3"
  log "waiting for $label..."
  local i=0
  while ! eval "$cmd" >/dev/null 2>&1; do
    ((i++))
    if (( i >= max )); then
      err "$label did not become ready after ${max}s"
      return 1
    fi
    sleep 1
  done
  ok "$label ready"
}

require_tool() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "'$1' not found. $2"
    exit 1
  fi
}

# ── Subcommands ───────────────────────────────────────────────────────────────

if [[ "$MODE" == "down" ]]; then
  log "stopping all services..."
  "${DC[@]}" down --remove-orphans
  "${DC[@]}" --profile ml down --remove-orphans 2>/dev/null || true
  ok "all services stopped."
  trap - INT TERM EXIT
  exit 0
fi

if [[ "$MODE" == "logs" ]]; then
  trap - INT TERM EXIT
  exec "${DC[@]}" logs -f --tail=50
fi

# ── Full Docker (default / --build / --ml) ────────────────────────────────────
if [[ "$MODE" == "docker" || "$MODE" == "build" || "$MODE" == "ml" ]]; then
  BUILD_FLAG=()
  [[ "$MODE" == "build" ]] && BUILD_FLAG=(--build)

  PROFILE_FLAG=()
  [[ "$MODE" == "ml" ]] && PROFILE_FLAG=(--profile ml)

  log "starting all services in Docker..."
  "${DC[@]}" "${PROFILE_FLAG[@]}" up -d "${BUILD_FLAG[@]}"

  wait_for_service "postgres"  60 "${DC[*]} exec -T postgres pg_isready -q"
  wait_for_service "Dart API"  90 "curl -fsS http://localhost:${API_PORT:-8080}/health 2>/dev/null || curl -fsS http://localhost:${API_PORT:-8080}/"

  printf "\n%s%sGuildMark is up%s\n" "$C_BOLD" "$C_GREEN" "$C_RESET"
  printf "  %-18s http://localhost:%s\n"  "GuildMark UI:"  "${GUILDMARK_PORT:-3000}"
  printf "  %-18s http://localhost:%s\n"  "DevDash:"       "${DEVDASH_PORT:-3001}"
  printf "  %-18s http://localhost:%s\n"  "API:"           "${API_PORT:-8080}"
  printf "  %-18s localhost:%s\n"         "Postgres:"      "${POSTGRES_PORT:-5432}"
  [[ "$MODE" == "ml" ]] && printf "  %-18s http://localhost:%s\n" "ML service:" "${ML_PORT:-8001}"
  printf "\n  %sStreaming logs (Ctrl+C to stop):%s\n\n" "$C_DIM" "$C_RESET"

  "${DC[@]}" logs -f --tail=20
  exit 0
fi

# ── DB only ───────────────────────────────────────────────────────────────────
if [[ "$MODE" == "db-only" ]]; then
  log "starting Postgres..."
  "${DC[@]}" up -d postgres
  wait_for_service "postgres" 60 "${DC[*]} exec -T postgres pg_isready -q"
  ok "Postgres is up on localhost:${POSTGRES_PORT:-5432}"
  printf "\n  Run each app locally:\n"
  printf "    API:       DATABASE_URL='postgres://%s:%s@localhost:%s/%s' dart_frog dev  (from api/bin/)\n" \
    "${POSTGRES_USER:-guildmark}" "${POSTGRES_PASSWORD}" "${POSTGRES_PORT:-5432}" "${POSTGRES_DB:-guildmark}"
  printf "    GuildMark: cd guildmark && pnpm dev\n"
  printf "    DevDash:   cd devdash && pnpm dev\n\n"
  # Block until Ctrl+C so the trap can clean up.
  log "press Ctrl+C to stop Postgres."
  wait
  exit 0
fi

# ── Dev mode — DB in Docker, apps local with HMR ─────────────────────────────
if [[ "$MODE" == "dev" ]]; then
  require_tool dart_frog   "Install: dart pub global activate dart_frog_cli"
  require_tool pnpm        "Install: npm install -g pnpm"

  log "starting Postgres in Docker..."
  "${DC[@]}" up -d postgres
  wait_for_service "postgres" 60 "${DC[*]} exec -T postgres pg_isready -q"

  # Ensure Dart deps + codegen are ready.
  if [[ ! -d api/bin/.dart_tool ]]; then
    log "fetching Dart dependencies..."
    (cd api/bin && dart pub get)
  fi
  if ! ls api/bin/lib/models/*.freezed.dart >/dev/null 2>&1; then
    log "running build_runner (freezed + json_serializable)..."
    (cd api/bin && dart run build_runner build --delete-conflicting-outputs)
  fi

  # Ensure pnpm deps are installed for both frontends.
  for app in guildmark devdash; do
    if [[ ! -d "$app/node_modules" ]]; then
      log "installing $app dependencies..."
      (cd "$app" && pnpm install)
    fi
  done

  # Rewrite DATABASE_URL for local dev — the root .env points at the Docker
  # service hostname "postgres" which only resolves inside the Docker network.
  # When the API runs locally it must connect via localhost instead.
  export DATABASE_URL="postgres://${POSTGRES_USER:-guildmark}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT:-5432}/${POSTGRES_DB:-guildmark}"

  # Start all three apps in the background (stdout is prefixed by shell).
  log "starting Dart Frog API (hot reload)..."
  (cd api/bin && dart_frog dev) &
  API_PID=$!

  log "starting GuildMark (Vite HMR on :${GUILDMARK_PORT:-5173})..."
  (cd guildmark && pnpm dev --port "${GUILDMARK_PORT:-5173}") &
  GM_PID=$!

  log "starting DevDash (Vite HMR on :${DEVDASH_PORT:-5174})..."
  (cd devdash && pnpm dev --port "${DEVDASH_PORT:-5174}") &
  DD_PID=$!

  # Give processes a moment to spit out their startup lines.
  sleep 3

  printf "\n%s%sGuildMark dev stack ready%s\n" "$C_BOLD" "$C_GREEN" "$C_RESET"
  printf "  %-18s http://localhost:%s\n"  "GuildMark UI:"  "${GUILDMARK_PORT:-5173}"
  printf "  %-18s http://localhost:%s\n"  "DevDash:"       "${DEVDASH_PORT:-5174}"
  printf "  %-18s http://localhost:%s\n"  "API:"           "${API_PORT:-8080}"
  printf "  %-18s localhost:%s\n"         "Postgres:"      "${POSTGRES_PORT:-5432}"
  printf "\n  %sCtrl+C stops everything.%s\n\n" "$C_DIM" "$C_RESET"

  # Wait for any background job to exit (crash → teardown everything).
  wait -n "$API_PID" "$GM_PID" "$DD_PID" 2>/dev/null || true
fi
