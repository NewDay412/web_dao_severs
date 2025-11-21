# 域名访问测试工具 - PowerShell版本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Domain Access Test Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[INFO] Testing domain access configuration..." -ForegroundColor Yellow
Write-Host ""

# 测试本地访问
Write-Host "1. Testing local access (localhost:3003)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3003/health" -TimeoutSec 5
    Write-Host "  [OK] Local access normal" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Local access failed, please start server first" -ForegroundColor Red
}

Write-Host ""

# 测试IP地址访问
Write-Host "2. Testing IP address access (47.83.203.60:3003)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://47.83.203.60:3003/health" -TimeoutSec 10
    Write-Host "  [OK] IP address access normal" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] IP address access failed, possible reasons:" -ForegroundColor Red
    Write-Host "    - Server not started" -ForegroundColor Red
    Write-Host "    - Firewall port 3003 not open" -ForegroundColor Red
    Write-Host "    - Network connection issue" -ForegroundColor Red
}

Write-Host ""

# 测试域名解析
Write-Host "3. Testing domain resolution..." -ForegroundColor Yellow
Write-Host "  Checking dao.longlong.baby resolution..." -ForegroundColor White
try {
    $result = Resolve-DnsName "dao.longlong.baby" -ErrorAction SilentlyContinue
    if ($result) {
        Write-Host "  [OK] Domain resolution normal" -ForegroundColor Green
        Write-Host "  IP Addresses: $($result.IPAddress -join ', ')" -ForegroundColor Gray
    } else {
        Write-Host "  [ERROR] Domain resolution failed, check DNS settings" -ForegroundColor Red
    }
} catch {
    Write-Host "  [ERROR] Domain resolution failed, check DNS settings" -ForegroundColor Red
}

Write-Host "  Checking longlong.baby resolution..." -ForegroundColor White
try {
    $result = Resolve-DnsName "longlong.baby" -ErrorAction SilentlyContinue
    if ($result) {
        Write-Host "  [OK] Domain resolution normal" -ForegroundColor Green
        Write-Host "  IP Addresses: $($result.IPAddress -join ', ')" -ForegroundColor Gray
    } else {
        Write-Host "  [ERROR] Domain resolution failed, check DNS settings" -ForegroundColor Red
    }
} catch {
    Write-Host "  [ERROR] Domain resolution failed, check DNS settings" -ForegroundColor Red
}

Write-Host ""

# 显示配置信息
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Server IP: 47.83.203.60" -ForegroundColor White
Write-Host "Service Port: 3003" -ForegroundColor White
Write-Host "Supported Domains:" -ForegroundColor White
Write-Host "  - dao.longlong.baby" -ForegroundColor Gray
Write-Host "  - longlong.baby" -ForegroundColor Gray
Write-Host "  - 47.83.203.60" -ForegroundColor Gray
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor White
Write-Host "  User Home: http://dao.longlong.baby/user-web/天官赐福首页.html" -ForegroundColor Gray
Write-Host "  Admin Panel: http://dao.longlong.baby/admin-web/admin.html" -ForegroundColor Gray
Write-Host "  Health Check: http://dao.longlong.baby/health" -ForegroundColor Gray
Write-Host ""
Write-Host "Production startup command:" -ForegroundColor White
Write-Host "  .\start-production.bat" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "[IMPORTANT] Error 522 Solutions:" -ForegroundColor Red
Write-Host "  1. Check server firewall settings" -ForegroundColor Yellow
Write-Host "  2. Confirm ports 80/443 are open" -ForegroundColor Yellow
Write-Host "  3. Verify Cloudflare proxy configuration" -ForegroundColor Yellow
Write-Host "  4. Run .\start-production.bat to start service" -ForegroundColor Yellow
Write-Host ""

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")