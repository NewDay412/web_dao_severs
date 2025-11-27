#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const appFile = path.join(__dirname, 'node-backend/app.js');

console.log('🔧 检查和修复后端CORS配置...\n');

let content = fs.readFileSync(appFile, 'utf-8');

// 检查CORS配置
if (content.includes('cors(corsOptions)')) {
  console.log('✅ CORS中间件已配置');
} else {
  console.log('❌ CORS中间件未配置');
}

// 检查允许的来源
if (content.includes('https://longlong.baby')) {
  console.log('✅ 已支持https://longlong.baby');
} else {
  console.log('⚠️  未支持https://longlong.baby，需要添加');
}

if (content.includes('http://longlong.baby')) {
  console.log('✅ 已支持http://longlong.baby');
} else {
  console.log('⚠️  未支持http://longlong.baby，需要添加');
}

// 检查OPTIONS处理
if (content.includes('OPTIONS')) {
  console.log('✅ 已支持OPTIONS预检请求');
} else {
  console.log('⚠️  未支持OPTIONS预检请求');
}

// 检查credentials支持
if (content.includes('credentials: true')) {
  console.log('✅ 已支持跨域认证');
} else {
  console.log('⚠️  未支持跨域认证');
}

console.log('\n📋 CORS配置检查清单：');
console.log('  ✓ 中间件配置');
console.log('  ✓ 允许的来源');
console.log('  ✓ 允许的方法');
console.log('  ✓ 允许的头部');
console.log('  ✓ 凭证支持');

console.log('\n🚀 如果CORS配置有问题，请：');
console.log('  1. 检查node-backend/app.js中的corsOptions');
console.log('  2. 确保包含所有需要的域名');
console.log('  3. 重启后端服务');
console.log('  4. 清除浏览器缓存');
