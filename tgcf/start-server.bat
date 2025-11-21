@echo off
chcp 65001 >nul
title Web项目启动器

echo.
echo ========================================
echo    Web项目启动器
echo ========================================
echo.

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

:: 检查MySQL是否可访问
echo.
echo [信息] 检查MySQL连接...
node -e "const mysql = require('mysql2'); console.log('MySQL驱动可用');" 2>nul
if %errorlevel% neq 0 (
    echo [警告] MySQL驱动未安装，将在安装依赖时自动安装
)

:: 进入后端目录
cd /d "%~dp0node-backend"

:: 检查package.json是否存在
if not exist "package.json" (
    echo [错误] 未找到package.json文件
    echo 请确保在正确的项目目录中运行此脚本
    pause
    exit /b 1
)

:: 检查node_modules是否存在，如果不存在则安装依赖
if not exist "node_modules" (
    echo [信息] 首次运行，正在安装依赖包...
    echo 这可能需要几分钟时间，请耐心等待...
    echo.
    
    :: 设置npm镜像以提高下载速度
    echo [信息] 配置npm镜像源...
    npm config set registry https://registry.npmmirror.com/
    
    echo [信息] 开始安装依赖...
    npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        echo 尝试使用官方镜像重新安装...
        npm config set registry https://registry.npmjs.org/
        npm install
        if %errorlevel% neq 0 (
            echo [错误] 依赖安装失败，请检查网络连接或手动安装
            echo 手动安装命令: cd node-backend && npm install
            pause
            exit /b 1
        )
    )
    echo [成功] 依赖安装完成
    echo.
) else (
    echo [信息] 依赖包已存在，跳过安装
)

:: 创建必要的目录
echo [信息] 检查并创建必要目录...
if not exist "uploads" mkdir uploads
if not exist "../uploads" mkdir "../uploads"

:: 启动服务器
echo [信息] 正在启动服务器...
echo.
echo ========================================
echo  服务器启动信息
echo ========================================
echo  后端API服务: http://localhost:3003
echo  健康检查: http://localhost:3003/health
echo  管理后台: 打开 admin-web/admin.html
echo  用户页面: 打开 user-web 目录下的HTML文件
echo ========================================
echo  默认管理员账号:
echo  用户名: admin
echo  密码: admin123
echo ========================================
echo.
echo [提示] 按 Ctrl+C 可停止服务器
echo [提示] 首次启动会自动创建数据库和表
echo.

npm start

:: 如果服务器意外停止
echo.
echo [信息] 服务器已停止
echo.
echo 如果遇到问题，请检查:
echo 1. MySQL服务是否启动
echo 2. 端口3003是否被占用
echo 3. 数据库密码是否正确
echo.
echo 更多帮助请查看 DEPLOYMENT_GUIDE.md
echo.
pause