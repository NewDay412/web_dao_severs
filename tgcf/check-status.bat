@echo off
echo ========================================
echo        天官赐福项目状态检查
echo ========================================
echo.

:: 检查后端服务状态
echo [检查] 后端服务状态...
curl -s http://localhost:3003/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] 后端服务运行正常 (http://localhost:3003)
    curl -s http://localhost:3003/health
    echo.
) else (
    echo [✗] 后端服务未启动或无法访问
    echo [提示] 请运行 start-server.bat 启动服务
    echo.
)

:: 检查主要API接口
echo [检查] 主要API接口...
curl -s http://localhost:3003/api/user/home-content >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] 首页内容API正常
) else (
    echo [✗] 首页内容API异常
)

curl -s http://localhost:3003/api/user/character >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] 角色介绍API正常
) else (
    echo [✗] 角色介绍API异常
)

curl -s http://localhost:3003/api/user/message >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] 留言板API正常
) else (
    echo [✗] 留言板API异常
)

echo.

:: 检查管理员登录
echo [检查] 管理员登录...
curl -s -X POST http://localhost:3003/api/admin/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] 管理员登录API正常
) else (
    echo [✗] 管理员登录API异常
)

echo.

:: 检查文件结构
echo [检查] 项目文件结构...
if exist "user-web\天官赐福首页.html" (
    echo [✓] 用户前端页面存在
) else (
    echo [✗] 用户前端页面缺失
)

if exist "admin-web\admin.html" (
    echo [✓] 管理员页面存在
) else (
    echo [✗] 管理员页面缺失
)

if exist "node-backend\app.js" (
    echo [✓] 后端主文件存在
) else (
    echo [✗] 后端主文件缺失
)

echo.
echo ========================================
echo 项目访问地址:
echo - 用户首页: file:///d:/wen_project/web_dao/user-web/天官赐福首页.html
echo - 管理员页面: file:///d:/wen_project/web_dao/admin-web/admin.html
echo - 后端API: http://localhost:3003
echo ========================================
echo.

pause