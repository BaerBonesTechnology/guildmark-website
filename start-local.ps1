param(
    [string]$Project = 'guildmark',
    [string]$Config = 'dev_personal',
    [ValidateRange(0, 50000)][int]$PortOffset = 0,
    [switch]$CheckOnly,
    [switch]$SmokeTest,
    [switch]$Ephemeral,
    [switch]$LocalOnly,
    [switch]$Personas
)
$ErrorActionPreference = 'Stop'
$taskPython = Join-Path $PSScriptRoot 'ml-qv/.venv-py312/Scripts/python.exe'
if (-not (Test-Path -LiteralPath $taskPython)) {
    throw 'ML Python environment is missing. Set up ml-qv/.venv-py312 using ml-qv/README.md.'
}
if (-not $LocalOnly -and -not (Get-Command doppler -ErrorAction SilentlyContinue)) { throw 'Install and log in to the Doppler CLI first.' }
$taskArgs = @((Join-Path $PSScriptRoot 'scripts/local_stack.py'), '--port-offset', "$PortOffset")
if ($CheckOnly) { $taskArgs += '--check-only' }
if ($SmokeTest) { $taskArgs += '--smoke-test' }
if ($Ephemeral) { $taskArgs += '--ephemeral' }
if ($Personas) { $taskArgs += '--personas' }
if ($LocalOnly) {
    $taskArgs += '--local-only'
    & $taskPython @taskArgs
    exit $LASTEXITCODE
}
& doppler run --project $Project --config $Config -- $taskPython @taskArgs
exit $LASTEXITCODE
