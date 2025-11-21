@echo off
echo ===============================================
echo Nginx域名配置脚本
echo ===============================================
echo.

echo [1/5] 检查Nginx状态...
tasklist /fi "imagename eq nginx.exe" | find "nginx.exe" >nul
if %errorlevel% equ 0 (
    echo Nginx正在运行
) else (
    echo Nginx未运行
)

echo.
echo [2/5] 创建vhost目录...
if not exist "D:\nginx-1.29.3\conf\vhost" (
    mkdir "D:\nginx-1.29.3\conf\vhost"
    echo 已创建vhost目录
) else (
    echo vhost目录已存在
)

echo.
echo [3/5] 复制配置文件...
if exist "d:\wen_project\web_dao\nginx-dao-longlong-baby.conf" (
    copy "d:\wen_project\web_dao\nginx-dao-longlong-baby.conf" "D:\nginx-1.29.3\conf\vhost\dao-longlong-baby.conf"
    echo 配置文件复制成功
) else (
    echo 错误: 源配置文件不存在
    pause
    exit /b 1
)

echo.
echo [4/5] 测试Nginx配置...
cd /d "D:\nginx-1.29.3"
nginx.exe -t
if %errorlevel% neq 0 (
    echo Nginx配置测试失败
    pause
    exit /b 1
)

echo.
echo [5/5] 重新加载Nginx配置...
tasklist /fi "imagename eq nginx.exe" | find "nginx.exe" >nul
if %errorlevel% equ 0 (
    echo 重新加载Nginx配置...
    nginx.exe -s reload
    if %errorlevel% equ 0 (
        echo Nginx配置重新加载成功
    ) else (
        echo 重新加载失败，请手动重启Nginx
    )
) else (
    echo 启动Nginx...
    nginx.exe
    echo Nginx启动成功
)

echo.
echo ===============================================
echo 配置完成！
echo 域名: http://dao.longlong.baby
echo IP地址: http://47.83.203.60
echo 本地访问: http://localhost
echo ===============================================
echo.
pause