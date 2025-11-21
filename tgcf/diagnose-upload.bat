@echo off
echo ========================================
echo        图片上传功能诊断工具
echo ========================================
echo.

echo [检查] 后端服务状态...
curl -s http://localhost:3003/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] 后端服务运行正常
    curl -s http://localhost:3003/health
    echo.
) else (
    echo [✗] 后端服务未启动
    echo [提示] 请运行 start-server.bat 启动服务
    echo.
    goto :end
)

echo [检查] 管理员登录API...
curl -s -X POST http://localhost:3003/api/admin/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" >temp_login.json 2>&1
if %errorlevel% equ 0 (
    echo [✓] 管理员登录API正常
) else (
    echo [✗] 管理员登录API异常
)

echo.
echo [检查] 图片上传API...
curl -s -X POST http://localhost:3003/api/admin/upload-image >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] 图片上传API接口存在
) else (
    echo [✗] 图片上传API接口不存在
)

echo.
echo [检查] uploads目录...
if exist "uploads" (
    echo [✓] uploads目录存在
    dir uploads /b | find /c /v "" >temp_count.txt
    set /p file_count=<temp_count.txt
    echo [信息] 目录中有 %file_count% 个文件
    del temp_count.txt >nul 2>&1
) else (
    echo [✗] uploads目录不存在
    mkdir uploads
    echo [修复] 已创建uploads目录
)

echo.
echo [检查] 依赖包...
cd node-backend
node -e "try { require('multer'); console.log('[✓] multer依赖已安装'); } catch(e) { console.log('[✗] multer依赖未安装'); }" 2>&1
cd ..

echo.
echo ========================================
echo 诊断完成！
echo.
echo 如果所有检查都通过，但上传仍然失败：
echo 1. 打开浏览器开发者工具（F12）
echo 2. 查看Network标签中的请求详情
echo 3. 查看Console标签中的错误信息
echo 4. 确认已正确登录管理员账号
echo.
echo 测试页面: file:///%cd%/test-upload.html
echo 解决方案: 查看 UPLOAD_SOLUTION.md 文件
echo ========================================

:end
if exist temp_login.json del temp_login.json >nul 2>&1
pause