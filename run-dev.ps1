# Run development environment script for VIBE project

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

$hasNode = Test-Command "node"
$hasNpm = Test-Command "npm"
$hasPython = Test-Command "python"
$hasPip = Test-Command "pip"

if (-not $hasNode) {
    Write-Host "Node.js is not installed. Please install Node.js to run the frontend." -ForegroundColor Red
    exit 1
}

if (-not $hasNpm) {
    Write-Host "npm is not installed. Please install npm to run the frontend." -ForegroundColor Red
    exit 1
}

if (-not $hasPython) {
    Write-Host "Python is not installed. Please install Python to run the backend." -ForegroundColor Red
    exit 1
}

if (-not $hasPip) {
    Write-Host "pip is not installed. Please install pip to run the backend." -ForegroundColor Red
    exit 1
}

# Start the frontend in a new window
Write-Host "Starting frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-Command", "cd '$PSScriptRoot\frontend' && npm install && npm start"

# Start the backend in a new window
Write-Host "Starting backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-Command", "cd '$PSScriptRoot\backend' && pip install -r requirements.txt && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

Write-Host "Development environment started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Yellow
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Yellow
