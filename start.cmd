@echo off
setlocal EnableExtensions
cd /d "%~dp0" || exit /b 1
if "%~1"=="--help" goto help
if "%~1"=="--appwrite" goto appwrite
if "%~1"=="--db-only" goto retired
if "%~1"=="--ml" goto retired
if not defined COMPOSE_FILE set "COMPOSE_FILE=docker-compose.dev.yml"
if "%~1"=="--prod" set "COMPOSE_FILE=docker-compose.prod.yml"
set "COMPOSE=docker compose -f %COMPOSE_FILE%"
if defined DOPPLER_PROJECT (
  set "COMPOSE=docker compose --env-file /dev/null -f %COMPOSE_FILE%"
) else if exist doppler.yaml (
  set "COMPOSE=doppler run -- docker compose --env-file /dev/null -f %COMPOSE_FILE%"
)
if "%~1"=="--down" (%COMPOSE% down & exit /b)
if "%~1"=="--logs" (%COMPOSE% logs -f & exit /b)
if "%~1"=="--build" (%COMPOSE% up -d --build & exit /b)
if not "%~1"=="" if not "%~1"=="--dev" if not "%~1"=="--prod" goto help
%COMPOSE% up -d
exit /b
:appwrite
docker network inspect guildmark-net >nul 2>&1 || docker network create guildmark-net
docker compose --env-file .env.appwrite -f docker-compose.appwrite.yml up -d
exit /b
:retired
echo PostgreSQL and the Python daemon are no longer runtime dependencies.
exit /b 2
:help
echo start.cmd [--dev^|--build^|--prod^|--logs^|--down^|--appwrite]
echo Default: local containers. Production: API only. Appwrite is opt-in.
exit /b
