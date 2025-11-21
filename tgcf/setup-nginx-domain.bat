@echo off
echo ===============================================
echo Nginx域名访问配置脚本
echo 适用于 D:\nginx-1.29.3 安装路径
echo ===============================================
echo.

echo [1/6] 检查Nginx是否运行...
tasklist /fi "imagename eq nginx.exe" 2>nul | find /i "nginx.exe" >nul
if %errorlevel% equ 0 (
    echo Nginx正在运行
) else (
    echo Nginx未运行
)

echo.
echo [2/6] 创建vhost目录...
if not exist "D:\nginx-1.29.3\conf\vhost" (
    mkdir "D:\nginx-1.29.3\conf\vhost"
    echo 已创建vhost目录
) else (
    echo vhost目录已存在
)

echo.
echo [3/6] 复制域名配置文件...
if exist "d:\wen_project\web_dao\nginx-dao-longlong-baby.conf" (
    copy "d:\wen_project\web_dao\nginx-dao-longlong-baby.conf" "D:\nginx-1.29.3\conf\vhost\dao-longlong-baby.conf"
    echo 配置文件复制成功
) else (
    echo 错误: 源配置文件不存在
    pause
    exit /b 1
)

echo.
echo [4/6] 检查主配置文件...
if not exist "D:\nginx-1.29.3\conf\nginx.conf" (
    echo 错误: Nginx主配置文件不存在
    pause
    exit /b 1
)

echo.
echo [5/6] 测试Nginx配置...
"D:\nginx-1.29.3\nginx.exe" -t
if %errorlevel% neq 0 (
    echo Nginx配置测试失败，请检查配置文件
    pause
    exit /b 1
)

echo.
echo [6/6] 重新加载Nginx配置...
tasklist /fi "imagename eq nginx.exe" 2>nul | find /i "nginx.exe" >nul
if %errorlevel% equ 0 (
    echo 发送重新加载信号...
    "D:\nginx-1.29.3\nginx.exe" -s reload
    if %errorlevel% equ 0 (
        echo Nginx配置重新加载成功
    ) else (
        echo 重新加载失败，尝试重启Nginx...
        echo 停止Nginx...
        "D:\nginx-1.29.3\nginx.exe" -s stop
        timeout /t 2 /nobreak >nul
        echo 启动Nginx...
        "D:\nginx-1.29.3\nginx.exe"
        echo Nginx重启成功
    )
) else (
    echo 启动Nginx...
    "D:\nginx-1.29.3\nginx.exe"
    echo Nginx启动成功
)

echo.
echo 等待Nginx启动...
timeout /t 3 /nobreak >nul

echo.
echo 测试域名访问...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://dao.longlong.baby/health' -UseBasicParsing -TimeoutSec 10; if ($response.StatusCode -eq 200) { echo '域名访问测试成功! 状态码: ' + $response.StatusCode; echo '响应内容: ' + $response.Content } else { echo '域名访问测试失败! 状态码: ' + $response.StatusCode } } catch { echo '域名访问测试失败! 错误: ' + $_.Exception.Message }"

echo.
echo ===============================================
echo Nginx域名配置完成!
echo 域名: http://dao.longlong.baby
echo IP地址: http://47.83.203.60
echo 本地访问: http://localhost
echo ===============================================
echo.
pause