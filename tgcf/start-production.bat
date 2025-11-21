@echo off
chcp 65001 >nul
title 天官赐福 - 生产环境启动器

echo.
echo ========================================
echo    天官赐福 - 生产环境启动器
echo ========================================
echo.

:: 设置生产环境变量
set NODE_ENV=production

:: 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    echo 下载地址：https://nodejs.org/
    echo.
    echo 安装完成后请重新运行此脚本
    pause
    exit /b 1
)

echo [信息] Node.js版本：
node --version

:: 进入后端目录
cd /d "%~dp0node-backend"

:: 检查package.json是否存在
if not exist "package.json" (
    echo [错误] 未找到package.json文件
    echo 请确保在正确的项目目录中运行此脚本
    pause
    exit /b 1
)

:: 检查生产环境依赖
if not exist "node_modules" (
    echo [信息] 首次运行，正在安装生产环境依赖包...
    echo 这可能需要几分钟时间，请耐心等待...
    echo.
    
    :: 设置npm镜像以提高下载速度
    echo [信息] 配置npm镜像源...
    npm config set registry https://registry.npmmirror.com/
    
    echo [信息] 开始安装依赖...
    npm install --production
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        echo 尝试使用官方镜像重新安装...
        npm config set registry https://registry.npmjs.org/
        npm install --production
        if %errorlevel% neq 0 (
            echo [错误] 依赖安装失败，请检查网络连接或手动安装
            echo 手动安装命令: cd node-backend && npm install --production
            pause
            exit /b 1
        )
    )
    echo [成功] 生产环境依赖安装完成
    echo.
) else (
    echo [信息] 依赖包已存在，跳过安装
)

:: 创建必要的目录结构
echo [信息] 检查并创建生产环境目录...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "../uploads" mkdir "../uploads"

:: 检查环境变量配置文件
if not exist ".env" (
    echo [信息] 创建环境变量配置文件...
    (
        echo # 生产环境配置
        echo NODE_ENV=production
        echo PORT=3003
        echo HOST=0.0.0.0
        echo # 数据库配置
        echo DB_HOST=localhost
        echo DB_PORT=3306
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_NAME=web_dao
        echo # JWT密钥
        echo JWT_SECRET=production_secret_key_%RANDOM%%RANDOM%%RANDOM%
        echo # SSL配置（可选）
        echo SSL_ENABLED=false
        echo SSL_KEY_PATH=/path/to/private.key
        echo SSL_CERT_PATH=/path/to/certificate.crt
    ) > .env
    echo [成功] 环境变量配置文件已创建，请根据实际情况修改 .env 文件
)

:: 启动生产环境服务器
echo [信息] 正在启动生产环境服务器...
echo.
echo ========================================
echo  生产环境服务器启动信息
echo ========================================
echo  服务器模式: 生产环境
echo  服务端口: 3003
echo  监听地址: 0.0.0.0（所有网络接口）
echo.
echo  支持的域名访问:
echo  - dao.longlong.baby
echo  - longlong.baby
echo  - 47.83.203.60
echo  - localhost
echo.
echo  访问地址:
echo  - HTTP: http://47.83.203.60:3003
echo  - 用户首页: http://47.83.203.60:3003/user-web/天官赐福首页.html
echo  - 管理后台: http://47.83.203.60:3003/admin-web/admin.html
echo  - 健康检查: http://47.83.203.60:3003/health
echo ========================================
echo.
echo [提示] 按 Ctrl+C 可停止服务器
echo [提示] 服务器日志将输出到 logs/production.log 文件
echo.

:: 启动生产环境应用
node app.production.js

:: 如果服务器意外停止
echo.
echo [信息] 生产环境服务器已停止
echo.
echo 如果遇到问题，请检查:
echo 1. 防火墙是否开放3003端口
echo 2. 域名解析是否正确指向服务器IP
echo 3. 数据库连接配置
echo 4. 查看 logs/production.log 日志文件
echo.
echo 更多帮助请查看 DEPLOYMENT_GUIDE.md
echo.
pause