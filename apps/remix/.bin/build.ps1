# PowerShell equivalent of build.sh
# Exit on error
$ErrorActionPreference = "Stop"

# Get script directory and web app directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$WEB_APP_DIR = Split-Path -Parent $SCRIPT_DIR

# Store the original directory
$ORIGINAL_DIR = Get-Location

# Set up trap to ensure we return to original directory
try {
    Set-Location $WEB_APP_DIR

    $start_time = Get-Date

    Write-Host "[Build]: Extracting and compiling translations"
    npm run translate --prefix ..\..\

    Write-Host "[Build]: Building app"
    npm run build:app

    Write-Host "[Build]: Building server"
    npm run build:server

    # Copy over the entry point for the server.
    Copy-Item -Path "server\main.js" -Destination "build\server\main.js"

    # Copy over all web.js translations
    # Create the destination directory if it doesn't exist
    $destinationDir = "build\server\hono\packages\lib\translations"
    if (-not (Test-Path $destinationDir)) {
        New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
    }
    Copy-Item -Path "..\..\packages\lib\translations" -Destination "build\server\hono\packages\lib" -Recurse -Force

    # Time taken
    $end_time = Get-Date
    $duration = ($end_time - $start_time).TotalSeconds

    Write-Host "[Build]: Done in $([math]::Round($duration)) seconds"
}
finally {
    # Return to original directory
    Set-Location $ORIGINAL_DIR
}
