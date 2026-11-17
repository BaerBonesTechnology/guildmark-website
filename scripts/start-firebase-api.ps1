param([string]$EnvironmentFile = '')
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
if (-not $EnvironmentFile) {
    $EnvironmentFile = Join-Path $taskRoot 'deployment/firebase/backend.env.example'
}
foreach ($line in Get-Content -LiteralPath $EnvironmentFile) {
    if ($line.Trim() -eq '' -or $line.TrimStart().StartsWith('#')) { continue }
    $parts = $line.Split('=', 2)
    if ($parts.Count -eq 2) { Set-Item -LiteralPath "Env:$($parts[0].Trim())" -Value $parts[1] }
}
if ($env:FIREBASE_PROJECT_ID -ne 'demo-guildmark' -or -not $env:FIRESTORE_EMULATOR_HOST) {
    throw 'This local launcher only supports demo-guildmark with the Firestore emulator.'
}
Push-Location (Join-Path $taskRoot 'api/bin')
try {
    dart run tool/firebase_seed.dart
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    dart_frog dev --port 8080
    exit $LASTEXITCODE
} finally { Pop-Location }
