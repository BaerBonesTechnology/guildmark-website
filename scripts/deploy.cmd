@echo off
REM API-only deployment. Appwrite Cloud defaults are in the compose file.
setlocal EnableExtensions
cd /d "%~dp0.." || exit /b 1
set "COMPOSE=docker compose -f docker-compose.prod.yml"
if defined DOPPLER_PROJECT (
  set "COMPOSE=docker compose --env-file /dev/null -f docker-compose.prod.yml"
) else if exist doppler.yaml (
  set "COMPOSE=doppler run -- docker compose --env-file /dev/null -f docker-compose.prod.yml"
)
%COMPOSE% config --quiet
if errorlevel 1 exit /b 1
%COMPOSE% build api
if errorlevel 1 exit /b 1
%COMPOSE% up -d --no-deps api
if errorlevel 1 exit /b 1
echo API deployed. Verify Cloud data before retiring legacy services.
endlocal
