@echo off
echo ========================================
echo 修复 Error 522 - MySQL连接超时问题
echo ========================================
echo.

echo 1. 检查MySQL服务状态...
sc query mysql
echo.

echo 2. 尝试启动MySQL服务...
echo 注意：需要管理员权限
net start mysql
if %errorlevel% equ 0 (
    echo ✅ MySQL服务启动成功！
) else (
    echo ❌ MySQL服务启动失败，可能需要管理员权限
    echo.
    echo 解决方案：
    echo 1. 右键点击此文件，选择"以管理员身份运行"
    echo 2. 或者手动启动MySQL服务：
    echo    - 按Win+R，输入services.msc
    echo    - 找到MySQL服务，右键启动
    echo 3. 或者使用MySQL Workbench启动服务
    echo.
    pause
    exit /b 1
)

echo.
echo 3. 验证MySQL连接...
cd node-backend
node -e "
const mysql = require('mysql2/promise');
async function test() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Mysql'
    });
    console.log('✅ MySQL连接成功！');
    await connection.end();
  } catch (error) {
    console.log('❌ MySQL连接失败:', error.message);
    console.log('💡 请检查密码是否为: Mysql');
  }
}
test();
"

echo.
echo 4. 启动项目服务器...
node app.js

pause