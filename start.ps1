# Quick Start Script for Multi-Agent Task Executor (PowerShell)

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Multi-Agent Task Executor - Quick Start" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Check Python
$pythonCheck = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python 3.9+ not found. Please install Python." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Python found: $pythonCheck" -ForegroundColor Green

# Check Node.js
$nodeCheck = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js 18+ not found. Please install Node.js." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js found: $nodeCheck" -ForegroundColor Green

# Check MongoDB
Write-Host "⚠️  Make sure MongoDB is running locally or with Atlas connection" -ForegroundColor Yellow

Write-Host ""
Write-Host "=== Starting Backend (FastAPI on port 8000) ===" -ForegroundColor Cyan
Set-Location $PSScriptRoot
.\venv\Scripts\Activate.ps1
Write-Host "Starting: python api.py" -ForegroundColor Yellow
Start-Process python -ArgumentList "api.py" -NoNewWindow

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "=== Starting Frontend (React + Vite on port 5173) ===" -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"
Write-Host "Starting: npm run dev" -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k npm run dev" -NoNewWindow

Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "✅ Both services are starting!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open your browser and navigate to: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Close the command windows to stop the services" -ForegroundColor Yellow
Write-Host ""

pause
