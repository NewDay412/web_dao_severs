# Nginx 80 Port Forwarding Configuration Script
# This script helps configure Nginx to listen on port 80 and forward to port 3003

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Nginx 80 Port Forwarding Configuration" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "[1/5] Checking current Nginx status..." -ForegroundColor Yellow
$nginxProcesses = tasklist | findstr nginx.exe
if ($LASTEXITCODE -eq 0) {
    Write-Host "Nginx service is running" -ForegroundColor Green
    Write-Host "Note: Administrator privileges required to stop Nginx service" -ForegroundColor Yellow
    Write-Host "Please run this script as Administrator" -ForegroundColor Yellow
} else {
    Write-Host "Nginx service is not running" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[2/5] Checking port 80 usage..." -ForegroundColor Yellow
$port80 = netstat -ano | findstr ":80 "
if ($LASTEXITCODE -eq 0) {
    Write-Host "Port 80 is occupied, please check other services" -ForegroundColor Yellow
    Write-Host "If occupied by Nginx, administrator privileges required to stop" -ForegroundColor Yellow
} else {
    Write-Host "Port 80 is available" -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/5] Checking Node.js application status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3003/health" -TimeoutSec 5
    Write-Host "Node.js application is running normally" -ForegroundColor Green
} catch {
    Write-Host "Node.js application is not running or port 3003 is unavailable" -ForegroundColor Red
    Write-Host "Please start the Node.js application first" -ForegroundColor Red
}

Write-Host ""
Write-Host "[4/5] Nginx configuration information..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Nginx Configuration Summary:" -ForegroundColor Cyan
Write-Host "   Listen Port: 80"
Write-Host "   Forward Target: 127.0.0.1:3003"
Write-Host "   Supported Domains: dao.longlong.baby, longlong.baby, 47.83.203.60"
Write-Host "   Config File: nginx-80.conf"

Write-Host ""
Write-Host "[5/5] Configuration instructions:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Manual Configuration Steps:" -ForegroundColor Cyan
Write-Host "1. Stop Nginx service as Administrator"
Write-Host "2. Use config file: nginx-80.conf"
Write-Host "3. Start Nginx service"
Write-Host "4. Test access: http://localhost/health"

Write-Host ""
Write-Host "Test Commands:" -ForegroundColor Cyan
Write-Host "curl -s http://localhost/health"
Write-Host "curl -s http://dao.longlong.baby/health"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Configuration Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run this script as Administrator"
Write-Host "2. Follow the manual configuration steps above"
Write-Host "3. Test the domain access to verify 522 error is resolved"