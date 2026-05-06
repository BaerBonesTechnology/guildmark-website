@echo off
setlocal enabledelayedexpansion
title GuildMark Stack

REM Daily deployment tip
echo [guildmark] On Windows, use Task Scheduler to run scripts\deploy.sh daily at 3 AM
echo [guildmark] On Linux/macOS, ./start.sh sets up cron automatically
echo.

:: ---------------------------------------------------------------------------
:: GuildMark - full-stack start script for Windows CMD
::
:: Usage:
::   start.cmd              Full Docker - all services
::   start.cmd --prod       Production Docker - uses docker-compose.prod.yml
::   start.cmd --dev        Dev mode - DB in Docker, apps in separate windows
::   start.cmd --db-only    Postgres only
::   start.cmd --build      Rebuild all images then start
::   start.cmd --down       Stop all containers
::   start.cmd --logs       Tail logs from running services
::   start.cmd --ml         Full Docker including ML service
:: ---------------------------------------------------------------------------

:: -- Parse args ---------------------------------------------------------------
set "MODE=docker"
if /i "%~1"=="--prod"    set "MODE=prod"
if /i "%~1"=="--dev"     set "MODE=dev"
if /i "%~1"=="--db-only" set "MODE=db-only"
if /i "%~1"=="--build"   set "MODE=build"
if /i "%~1"=="--down"    set "MODE=down"
if /i "%~1"=="--logs"    set "MODE=logs"
if /i "%~1"=="--ml"      set "MODE=ml"
if /i "%~1"=="-h"        goto :show_help
if /i "%~1"=="--help"    goto :show_help
if not "%~1"=="" if "!MODE!"=="docker" (
    echo [guildmark] Unknown flag: %~1
    echo Run  start.cmd --help  for usage.
    exit /b 1
)

:: -- Check Docker ---------------------------------------------------------------
docker info >nul 2>&1
if errorlevel 1 (
    echo [guildmark] ERROR: Docker is not running. Start Docker Desktop first.
    exit /b 1
)

:: -- Move to the folder containing this script --------------------------------
cd /d "%~dp0"

:: -- Detect Doppler FIRST - before any .env loading ---------------------------
:: If Doppler is available it injects secrets into the docker compose subprocess.
:: We must NOT pre-load those variables from .env or Doppler won't override them.
set "DOPPLER_RUN="
where doppler >nul 2>&1
if not errorlevel 1 (
    if exist "doppler.yaml" (
        doppler whoami >nul 2>&1
        if not errorlevel 1 (
            set "DOPPLER_RUN=doppler run -- "
            echo [guildmark] Doppler authenticated -- secrets will be injected at runtime
        ) else (
            echo [guildmark] WARNING: doppler.yaml found but not logged in. Run: doppler login ^&^& doppler setup
        )
    )
)

:: -- Load secrets - skip if Doppler is active (it owns the secrets) -----------
if "!DOPPLER_RUN!"=="" (
    call :load_env
) else (
    :: Doppler injects secrets; still set port/display defaults locally.
    if not defined API_PORT       set "API_PORT=8080"
    if not defined POSTGRES_PORT  set "POSTGRES_PORT=5432"
    if not defined GUILDMARK_PORT set "GUILDMARK_PORT=3000"
    if not defined DEVDASH_PORT   set "DEVDASH_PORT=3001"
    if not defined ML_PORT        set "ML_PORT=8001"
)

:: -- Prod compose file override -----------------------------------------------
set "COMPOSE_FILE_FLAG="
if /i "%MODE%"=="prod" set "COMPOSE_FILE_FLAG=-f docker-compose.prod.yml"

:: -- Dispatch ---------------------------------------------------------------
if /i "%MODE%"=="down"    goto :do_down
if /i "%MODE%"=="logs"    goto :do_logs
if /i "%MODE%"=="dev"     goto :do_dev
if /i "%MODE%"=="db-only" goto :do_db_only
if /i "%MODE%"=="prod"    goto :do_docker
goto :do_docker

:: =============================================================================
:do_docker
:do_build
:do_ml
set "BUILD_FLAG="
set "PROFILE_FLAG="
if /i "%MODE%"=="build" set "BUILD_FLAG=--build"
if /i "%MODE%"=="ml"    set "PROFILE_FLAG=--profile ml"

echo [guildmark] starting all services in Docker...
%DOPPLER_RUN%docker compose %COMPOSE_FILE_FLAG% %PROFILE_FLAG% up -d %BUILD_FLAG%
if errorlevel 1 ( echo [guildmark] ERROR: docker compose failed. & exit /b 1 )

call :wait_for_postgres
call :wait_for_api

echo.
echo  GuildMark is up
echo    GuildMark UI  http://localhost:%GUILDMARK_PORT%
echo    DevDash       http://localhost:%DEVDASH_PORT%
echo    API           http://localhost:%API_PORT%
echo    Postgres      localhost:%POSTGRES_PORT%
if /i "%MODE%"=="ml" echo    ML service    http://localhost:%ML_PORT%
echo.
echo  Streaming logs  (Ctrl+C to stop) ...
echo.
%DOPPLER_RUN%docker compose logs -f --tail=20
goto :eof

:: =============================================================================
:do_db_only
echo [guildmark] starting Postgres...
%DOPPLER_RUN%docker compose up -d postgres
if errorlevel 1 ( echo [guildmark] ERROR: docker compose failed. & exit /b 1 )
call :wait_for_postgres

echo.
echo  Postgres is up on localhost:%POSTGRES_PORT%
echo.
echo  Run each app locally:
echo    API:  set DATABASE_URL=postgres://%POSTGRES_USER%:%POSTGRES_PASSWORD%@localhost:%POSTGRES_PORT%/%POSTGRES_DB% ^&^& cd api\bin ^&^& dart_frog dev
echo    GuildMark: cd guildmark  ^&^&  pnpm dev
echo    DevDash:   cd devdash  ^&^&  pnpm dev
echo.
echo  Press any key to stop Postgres and exit.
pause >nul
%DOPPLER_RUN%docker compose down --remove-orphans
goto :eof

:: =============================================================================
:do_dev
echo [guildmark] starting Postgres in Docker...
%DOPPLER_RUN%docker compose up -d postgres
if errorlevel 1 ( echo [guildmark] ERROR: docker compose failed. & exit /b 1 )
call :wait_for_postgres

:: Rewrite DATABASE_URL for local dev - the root .env points at the Docker
:: service hostname "postgres" which only resolves inside the Docker network.
:: When the API runs locally it must connect via localhost instead.
set "DATABASE_URL=postgres://%POSTGRES_USER%:%POSTGRES_PASSWORD%@localhost:%POSTGRES_PORT%/%POSTGRES_DB%"

echo [guildmark] opening service windows...

:: /d sets the working directory for each new window - avoids nested-quote issues.
start "GuildMark - API  (dart_frog)"  /d "%~dp0api\bin"   cmd /k dart_frog dev
start "GuildMark - UI   (Vite)"       /d "%~dp0guildmark" cmd /k pnpm dev --port %GUILDMARK_PORT%
start "GuildMark - DevDash (Vite)"    /d "%~dp0devdash"   cmd /k pnpm dev --port %DEVDASH_PORT%

echo.
echo  GuildMark dev stack ready
echo    GuildMark UI  http://localhost:%GUILDMARK_PORT%
echo    DevDash       http://localhost:%DEVDASH_PORT%
echo    API           http://localhost:%API_PORT%
echo    Postgres      localhost:%POSTGRES_PORT%
echo.
echo  Each service is running in its own window.
echo  Press any key here to stop Postgres and close this window.
echo.
pause >nul
echo [guildmark] stopping Postgres...
%DOPPLER_RUN%docker compose down --remove-orphans
goto :eof

:: =============================================================================
:do_down
echo [guildmark] stopping all services...
%DOPPLER_RUN%docker compose down --remove-orphans
%DOPPLER_RUN%docker compose --profile ml down --remove-orphans 2>nul
echo [guildmark] done.
goto :eof

:: =============================================================================
:do_logs
%DOPPLER_RUN%docker compose logs -f --tail=50
goto :eof

:: =============================================================================
:: Subroutines
:: =============================================================================

:load_env
if exist ".env" (
    echo [guildmark] loading .env
    call :parse_env ".env"
) else if exist ".env.example" (
    echo [guildmark] no .env found -- copying .env.example
    copy ".env.example" ".env" >nul
    call :parse_env ".env"
) else (
    echo [guildmark] WARNING: no .env found -- using built-in defaults
)
:: Fallback defaults for anything not in .env
if not defined API_PORT       set "API_PORT=8080"
if not defined POSTGRES_PORT  set "POSTGRES_PORT=5432"
if not defined GUILDMARK_PORT set "GUILDMARK_PORT=3000"
if not defined DEVDASH_PORT   set "DEVDASH_PORT=3001"
if not defined ML_PORT        set "ML_PORT=8001"
goto :eof

:: ---------------------------------------------------------------------------
:parse_env
:: Reads key=value lines from the given file, skipping # comments and blanks.
:: Inline comments (value  # note) are stripped at the first # character.
for /f "usebackq tokens=* eol=#" %%L in (%~1) do (
    set "_ln=%%L"
    if not "!_ln!"=="" (
        for /f "tokens=1 delims=#" %%V in ("%%L") do (
            set "_kv=%%V"
            :: Trim trailing spaces from the key=value portion
            :_trim
            if "!_kv:~-1!"==" " ( set "_kv=!_kv:~0,-1!" & goto :_trim )
            if not "!_kv!"=="" set "!_kv!"
        )
    )
)
goto :eof

:: =============================================================================
:wait_for_postgres
echo [guildmark] waiting for Postgres...
set /a _pg=0
:_pg_loop
%DOPPLER_RUN%docker compose exec postgres pg_isready -q >nul 2>&1
if not errorlevel 1 ( echo [guildmark] Postgres ready & goto :eof )
set /a _pg+=1
if %_pg% geq 60 (
    echo [guildmark] ERROR: Postgres did not become ready after 60s.
    exit /b 1
)
timeout /t 1 /nobreak >nul
goto :_pg_loop

:: =============================================================================
:wait_for_api
echo [guildmark] waiting for API...
set /a _api=0
:_api_loop
curl -fsS http://localhost:%API_PORT%/ >nul 2>&1
if not errorlevel 1 ( echo [guildmark] API ready & goto :eof )
set /a _api+=1
if %_api% geq 90 (
    echo [guildmark] WARNING: API health check timed out -- check: docker compose logs api
    goto :eof
)
timeout /t 1 /nobreak >nul
goto :_api_loop

:: =============================================================================
:show_help
echo.
echo  GuildMark - full-stack start script for Windows CMD
echo.
echo  Usage:
echo    start.cmd              Full Docker - all four services
echo    start.cmd --prod       Production Docker - uses docker-compose.prod.yml
echo    start.cmd --dev        DB in Docker, each app in its own CMD window
echo    start.cmd --db-only    Postgres only
echo    start.cmd --build      Rebuild all images then start
echo    start.cmd --down       Stop and remove all containers
echo    start.cmd --logs       Tail logs from all running services
echo    start.cmd --ml         Full Docker including the optional ML service
echo.
goto :eof
