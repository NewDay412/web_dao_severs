const mysql = require('mysql2/promise');

/**
 * 修复登录和注册问题的脚本
 * 此脚本将在远程服务器上执行修复操作
 */

console.log('开始修复登录和注册问题...');
console.log('请在远程服务器上执行以下命令来修复问题：');
console.log('');
console.log('# 1. 备份原始文件');
console.log('cp /var/www/tgcf/node-backend/api/user.routes.js /var/www/tgcf/node-backend/api/user.routes.js.bak');
console.log('');
console.log('# 2. 修复登录接口错误处理');
console.log('# 编辑文件 /var/www/tgcf/node-backend/api/user.routes.js');
console.log('# 找到登录接口，修改错误处理逻辑');
console.log('');
console.log('# 3. 重启Node.js服务');
console.log('pm2 restart app');
console.log('');
console.log('# 4. 测试登录和注册功能');
console.log('curl -X POST http://localhost:3000/api/user/login -H "Content-Type: application/json" -d "{\"username\":\"user1\",\"password\":\"password123\"}"');
console.log('curl -X POST http://localhost:3000/api/user/register -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"test123\",\"sex\":\"male\"}"');
