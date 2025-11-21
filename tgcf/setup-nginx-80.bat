@echo off
chcp 65001 >nul

echo ================================================
echo    Nginx 80端口转发配置脚本
echo ================================================

echo.
echo [1/5] 检查当前Nginx状态...
tasklist | findstr nginx.exe
if %errorlevel% equ 0 (
    echo Nginx服务正在运行
    echo 注意：需要管理员权限才能停止Nginx服务
    echo 请以管理员身份运行此脚本
) else (
    echo Nginx服务未运行
)

echo.
echo [2/5] 检查80端口占用情况...
netstat -ano | findstr ":80 "
if %errorlevel% equ 0 (
    echo 80端口已被占用，请检查其他服务
    echo 如果被Nginx占用，需要管理员权限停止
) else (
    echo 80端口可用
)

echo.
echo [3/5] 检查Node.js应用状态...
curl -s http://localhost:3003/health >nul
if %errorlevel% equ 0 (
    echo Node.js应用运行正常
) else (
    echo Node.js应用未运行或端口3003不可用
    echo 请先启动Node.js应用
)

echo.
echo [4/5] 显示Nginx配置信息...
echo.
echo Nginx配置摘要：
echo   监听端口: 80
echo   转发目标: 127.0.0.1:3003
echo   支持域名: dao.longlong.baby, longlong.baby, 47.83.203.60
echo   配置文件: nginx-80.conf

echo.
echo [5/5] 配置说明：
echo.
echo 手动配置步骤：
echo 1. 以管理员身份停止Nginx服务
echo 2. 使用配置文件: nginx-80.conf
echo 3. 启动Nginx服务
echo 4. 测试访问: http://localhost/health

echo.
echo 测试命令：
echo curl -s http://localhost/health
echo curl -s http://dao.longlong.baby/health

echo ================================================
echo   配置完成！
echo ================================================
pause