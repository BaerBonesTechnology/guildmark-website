param()
$ErrorActionPreference = 'Stop'
if (-not $env:FIREBASE_AUTH_EMULATOR_HOST -or -not $env:FIRESTORE_EMULATOR_HOST -or -not $env:FIREBASE_STORAGE_EMULATOR_HOST) {
    throw 'Run through firebase emulators:exec with the demo-guildmark project.'
}
$env:FIREBASE_PROJECT_ID = 'demo-guildmark'
$taskRoot = Split-Path -Parent $PSScriptRoot
Push-Location (Join-Path $taskRoot 'api/bin')
try {
    dart run tool/firebase_seed.dart
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    dart test
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
