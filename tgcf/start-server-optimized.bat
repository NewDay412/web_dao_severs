@echo off
chcp 65001 >nul
title Web项目启动器 - 优化版

echo.
echo ========================================
echo    Web项目启动器 - 优化版
echo ========================================
echo.

:: 检查并终止占用端口的进程
echo [信息] 检查端口占用...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3003') do (
    if not "%%a"=="0" (
        echo [信息] 终止占用端口的进程 %%a
        taskkill /F /PID %%a >nul 2>&1
    )
)

:: 检查MySQL服务
echo [信息] 检查MySQL服务...
sc query mysql | findstr "RUNNING" >nul
if %errorlevel% neq 0 (
    echo [信息] 启动MySQL服务...
    net start mysql >nul 2>&1
)

:: 设置环境变量
set NODE_ENV=production
set DB_HOST=localhost
set DB_USER=root
set DB_PASSWORD=Mysql

:: 进入后端目录
cd /d "%~dp0node-backend"

:: 安装依赖（如果需要）
if not exist "node_modules" (
    echo [信息] 安装依赖包...
    npm config set registry https://registry.npmmirror.com/
    npm install --production
)

:: 创建必要目录
if not exist "uploads" mkdir uploads

echo [信息] 启动服务器（优化配置）...
echo.
echo ========================================
echo  服务器信息
echo ========================================
echo  本地访问: http://localhost:3003
echo  健康检查: http://localhost:3003/health
echo  管理后台: admin-web/admin.html
echo ========================================
echo.

:: 启动服务器
node app.js

pause