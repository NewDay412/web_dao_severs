@echo off
chcp 65001 >nul
title Domain Access Test Tool

echo.
echo ========================================
echo    Domain Access Test Tool
echo ========================================
echo.

echo [INFO] Testing domain access configuration...
echo.

:: Test local access
echo 1. Testing local access (localhost:3003)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3003/health' -TimeoutSec 5; echo '  [OK] Local access normal' } catch { echo '  [ERROR] Local access failed, please start server first' }"

echo.
echo 2. Testing IP address access (47.83.203.60:3003)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://47.83.203.60:3003/health' -TimeoutSec 10; echo '  [OK] IP address access normal' } catch { echo '  [ERROR] IP address access failed, possible reasons:'; echo '    - Server not started'; echo '    - Firewall port 3003 not open'; echo '    - Network connection issue' }"

echo.
echo 3. Testing domain resolution...
echo   Checking dao.longlong.baby resolution...
powershell -Command "try { $result = Resolve-DnsName 'dao.longlong.baby' -ErrorAction SilentlyContinue; if ($result) { echo '  [OK] Domain resolution normal' } else { echo '  [ERROR] Domain resolution failed, check DNS settings' } } catch { echo '  [ERROR] Domain resolution failed, check DNS settings' }"

echo   Checking longlong.baby resolution...
powershell -Command "try { $result = Resolve-DnsName 'longlong.baby' -ErrorAction SilentlyContinue; if ($result) { echo '  [OK] Domain resolution normal' } else { echo '  [ERROR] Domain resolution failed, check DNS settings' } } catch { echo '  [ERROR] Domain resolution failed, check DNS settings' }"

echo.
echo 4. Testing domain access (requires server running)...
echo   Note: This test requires server running and correct domain resolution
echo.

:: Display configuration info
echo ========================================
echo  Configuration Summary
echo ========================================
echo  Server IP: 47.83.203.60
echo  Service Port: 3003
echo  Supported Domains:
echo    - dao.longlong.baby
echo    - longlong.baby
echo    - 47.83.203.60
echo.
echo  Access URLs:
echo    User Home: http://dao.longlong.baby/user-web/天官赐福首页.html
echo    Admin Panel: http://dao.longlong.baby/admin-web/admin.html
echo    Health Check: http://dao.longlong.baby/health
echo.
echo  Production startup command:
echo    start-production.bat
echo.
echo ========================================

echo.
echo [IMPORTANT] Error 522 Solutions:
echo   1. Check server firewall settings
echo   2. Confirm ports 80/443 are open
echo   3. Verify Cloudflare proxy configuration
echo   4. Run start-production.bat to start service
echo.

pause