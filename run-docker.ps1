# Run Docker containers for VIBE project

# Function to check if a command exists
function Test-Command {
    param (
        [string]$Command
    )
    
    $exists = $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
    return $exists
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Cyan

$hasDocker = Test-Command "docker"
$hasDockerCompose = Test-Command "docker-compose"

if (-not $hasDocker) {
    Write-Host "Docker is not installed. Please install Docker to run the containers." -ForegroundColor Red
    exit 1
}

if (-not $hasDockerCompose) {
    Write-Host "Docker Compose is not installed. Please install Docker Compose to run the containers." -ForegroundColor Red
    exit 1
}

# Check if domain configuration is present
$envFile = Join-Path $PSScriptRoot ".env"
$hasDomains = $false

if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    $hasDomains = $envContent -match "API_DOMAIN" -and $envContent -match "DASHBOARD_DOMAIN"
}

# Start Docker containers
Write-Host "Starting Docker containers..." -ForegroundColor Cyan
docker-compose up -d

# Check if containers are running
$containersRunning = $true
$containers = @("frontend", "backend", "postgres", "timescaledb")

foreach ($container in $containers) {
    $containerName = "bloomberg-terminal_${container}_1"
    $status = docker ps --filter "name=$containerName" --format "{{.Status}}"
    
    if (-not $status) {
        Write-Host "Container $containerName is not running." -ForegroundColor Red
        $containersRunning = $false
    }
}

if ($containersRunning) {
    Write-Host "All containers are running!" -ForegroundColor Green
    
    if ($hasDomains) {
        # Display domain URLs
        $apiDomain = (Get-Content $envFile | Select-String "API_DOMAIN=(.*)").Matches.Groups[1].Value
        $dashboardDomain = (Get-Content $envFile | Select-String "DASHBOARD_DOMAIN=(.*)").Matches.Groups[1].Value
        
        Write-Host "Frontend: https://$dashboardDomain" -ForegroundColor Yellow
        Write-Host "Backend API: https://$apiDomain" -ForegroundColor Yellow
        Write-Host "API Documentation: https://$apiDomain/docs" -ForegroundColor Yellow
    } else {
        # Display localhost URLs
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
        Write-Host "Backend API: http://localhost:8000" -ForegroundColor Yellow
        Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Yellow
    }
} else {
    Write-Host "Some containers failed to start. Check docker logs for details." -ForegroundColor Red
}
