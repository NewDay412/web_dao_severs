# Web Project Startup Script - PowerShell Version
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Web Project Starter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "[ERROR] Node.js not detected. Please install Node.js first" -ForegroundColor Red
    Write-Host "Download: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please re-run this script after installation" -ForegroundColor Yellow
    Read-Host "Press any key to continue"
    exit 1
}

Write-Host "[INFO] Node.js version: $nodeVersion" -ForegroundColor Green

# Check MySQL connection
Write-Host ""
Write-Host "[INFO] Checking MySQL connection..." -ForegroundColor Cyan
$mysqlCheck = node -e "const mysql = require('mysql2'); console.log('MySQL driver available');" 2>$null
if (-not $mysqlCheck) {
    Write-Host "[WARNING] MySQL driver not installed, will be installed with dependencies" -ForegroundColor Yellow
}

# Change to backend directory
Set-Location "node-backend"

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] package.json not found" -ForegroundColor Red
    Write-Host "Please ensure you are in the correct project directory" -ForegroundColor Yellow
    Read-Host "Press any key to continue"
    exit 1
}

# Check if node_modules exists, install dependencies if not
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] First run, installing dependencies..." -ForegroundColor Cyan
    Write-Host "This may take a few minutes, please wait..." -ForegroundColor Yellow
    Write-Host ""
    
    # Set npm registry for faster download
    Write-Host "[INFO] Configuring npm registry..." -ForegroundColor Cyan
    npm config set registry https://registry.npmmirror.com/
    
    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Cyan
    $installResult = npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Dependency installation failed" -ForegroundColor Red
        Write-Host "Trying with official registry..." -ForegroundColor Yellow
        npm config set registry https://registry.npmjs.org/
        $installResult = npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Dependency installation failed, please check network or install manually" -ForegroundColor Red
            Write-Host "Manual install: cd node-backend && npm install" -ForegroundColor Yellow
            Read-Host "Press any key to continue"
            exit 1
        }
    }
    Write-Host "[SUCCESS] Dependencies installed successfully" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[INFO] Dependencies already exist, skipping installation" -ForegroundColor Green
}

# Create necessary directories
Write-Host "[INFO] Checking and creating necessary directories..." -ForegroundColor Cyan
if (-not (Test-Path "uploads")) { New-Item -ItemType Directory -Path "uploads" | Out-Null }
if (-not (Test-Path "../uploads")) { New-Item -ItemType Directory -Path "../uploads" | Out-Null }

# Start the server
Write-Host "[INFO] Starting server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Server Information" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backend API: http://localhost:3003" -ForegroundColor White
Write-Host "  Health Check: http://localhost:3003/health" -ForegroundColor White
Write-Host "  Admin Panel: Open admin-web/admin.html" -ForegroundColor White
Write-Host "  User Pages: Open HTML files in user-web directory" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Default Admin Account:" -ForegroundColor White
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[TIP] Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "[TIP] Database and tables will be created automatically on first run" -ForegroundColor Yellow
Write-Host ""

# Start Node.js application
npm start

# If server stops unexpectedly
Write-Host ""
Write-Host "[INFO] Server has stopped" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you encounter issues, please check:" -ForegroundColor Yellow
Write-Host "1. MySQL service is running" -ForegroundColor White
Write-Host "2. Port 3003 is not occupied" -ForegroundColor White
Write-Host "3. Database password is correct" -ForegroundColor White
Write-Host ""
Write-Host "More help: See DEPLOYMENT_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press any key to continue"