#!/usr/bin/env node

/**
 * Error 522 修复工具
 * 诊断和修复连接超时问题
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Error 522 修复工具');
console.log('====================');

// 1. 检查端口占用
function checkPort() {
  console.log('\n📍 检查端口3003占用情况...');
  try {
    const result = execSync('netstat -ano | findstr :3003', { encoding: 'utf8' });
    if (result) {
      console.log('⚠️  端口3003被占用:');
      console.log(result);
      
      // 提取PID并终止进程
      const lines = result.split('\n').filter(line => line.includes(':3003'));
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') {
          try {
            console.log(`🔄 终止进程 PID: ${pid}`);
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          } catch (err) {
            console.log(`❌ 无法终止进程 ${pid}`);
          }
        }
      });
    } else {
      console.log('✅ 端口3003未被占用');
    }
  } catch (err) {
    console.log('✅ 端口3003未被占用');
  }
}

// 2. 检查MySQL服务
function checkMySQL() {
  console.log('\n📍 检查MySQL服务状态...');
  try {
    const result = execSync('sc query mysql', { encoding: 'utf8' });
    if (result.includes('RUNNING')) {
      console.log('✅ MySQL服务正在运行');
    } else {
      console.log('⚠️  MySQL服务未运行，尝试启动...');
      try {
        execSync('net start mysql', { stdio: 'inherit' });
        console.log('✅ MySQL服务启动成功');
      } catch (err) {
        console.log('❌ MySQL服务启动失败，请手动启动');
      }
    }
  } catch (err) {
    console.log('⚠️  无法检查MySQL服务状态');
  }
}

// 3. 创建优化的启动脚本
function createOptimizedStartScript() {
  console.log('\n📍 创建优化的启动脚本...');
  
  const optimizedScript = `@echo off
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

pause`;

  fs.writeFileSync(path.join(__dirname, 'start-server-optimized.bat'), optimizedScript, 'utf8');
  console.log('✅ 已创建优化启动脚本: start-server-optimized.bat');
}

// 4. 创建快速测试脚本
function createQuickTest() {
  console.log('\n📍 创建快速测试脚本...');
  
  const testScript = `const http = require('http');

// 测试服务器连接
function testConnection() {
  console.log('🔍 测试服务器连接...');
  
  const options = {
    hostname: 'localhost',
    port: 3003,
    path: '/health',
    method: 'GET',
    timeout: 10000
  };

  const req = http.request(options, (res) => {
    console.log(\`✅ 连接成功 - 状态码: \${res.statusCode}\`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📊 响应数据:', data);
    });
  });

  req.on('error', (err) => {
    console.log('❌ 连接失败:', err.message);
  });

  req.on('timeout', () => {
    console.log('⏰ 连接超时');
    req.destroy();
  });

  req.end();
}

// 延迟测试，给服务器启动时间
setTimeout(testConnection, 2000);`;

  fs.writeFileSync(path.join(__dirname, 'quick-test.js'), testScript, 'utf8');
  console.log('✅ 已创建快速测试脚本: quick-test.js');
}

// 5. 检查防火墙设置
function checkFirewall() {
  console.log('\n📍 检查防火墙设置...');
  try {
    const result = execSync('netsh advfirewall firewall show rule name="Node.js Server"', { encoding: 'utf8' });
    if (result.includes('Node.js Server')) {
      console.log('✅ 防火墙规则已存在');
    } else {
      console.log('⚠️  防火墙规则不存在，建议添加');
    }
  } catch (err) {
    console.log('⚠️  建议添加防火墙规则允许端口3003');
    console.log('💡 管理员命令: netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=3003');
  }
}

// 主函数
async function main() {
  try {
    checkPort();
    checkMySQL();
    createOptimizedStartScript();
    createQuickTest();
    checkFirewall();
    
    console.log('\n🎯 修复建议:');
    console.log('1. 使用优化启动脚本: start-server-optimized.bat');
    console.log('2. 启动后运行测试: node quick-test.js');
    console.log('3. 如果仍有问题，检查网络和防火墙设置');
    console.log('4. 确保MySQL服务正常运行');
    
    console.log('\n✅ Error 522 修复工具执行完成');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message);
  }
}

main();