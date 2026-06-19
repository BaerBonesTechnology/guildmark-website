@echo off
REM GuildMark production deploy script (Windows)
REM Mirrors scripts/deploy.sh. Builds images, starts Appwrite, redeploys the
REM prod stack. Run from anywhere — it anchors itself to the repo root.

setlocal EnableExtensions

REM ── Move to repo root (parent of this scripts\ folder) ──────────────────────
cd /d "%~dp0.." || (echo Could not cd to repo root & exit /b 1)

echo [%DATE% %TIME%] Starting deployment...

REM ── Ensure the shared external network exists (Appwrite declares it external) ─
docker network inspect guildmark-net >nul 2>&1 || docker network create guildmark-net
if errorlevel 1 (echo Failed to create guildmark-net & exit /b 1)

REM ── Build prod images ───────────────────────────────────────────────────────
doppler run -- docker compose -f docker-compose.prod.yml build --no-cache
if errorlevel 1 (echo Build failed & exit /b 1)

REM ── Start Appwrite stack ────────────────────────────────────────────────────
docker compose --env-file .env.appwrite -f docker-compose.appwrite.yml up -d
if errorlevel 1 (echo Appwrite start failed & exit /b 1)

REM ── Redeploy prod services ──────────────────────────────────────────────────
doppler run -- docker compose -f docker-compose.prod.yml up -d
if errorlevel 1 (echo Prod deploy failed & exit /b 1)

echo [%DATE% %TIME%] Deployment complete
endlocal
