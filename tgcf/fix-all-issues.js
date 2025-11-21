#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const fixes = [
  {
    name: '修复登录页面接口地址',
    file: 'user-web/登录页面.html',
    changes: [
      {
        old: 'const response = await fetch("https://longlong.baby/api/login", {',
        new: 'const response = await fetch("/api/login", {'
      },
      {
        old: 'if (result.status === \'success\') {',
        new: 'if (result.success) {'
      },
      {
        old: 'window.location.href = "https://longlong.baby/admin-web/admin.html";',
        new: 'window.location.href = "/admin-web/admin.html";'
      },
      {
        old: 'window.location.href = "https://longlong.baby/user-web/天官赐福首页.html";',
        new: 'window.location.href = "/user-web/天官赐福首页.html";'
      }
    ]
  },
  {
    name: '修复注册页面接口地址',
    file: 'user-web/注册.html',
    changes: [
      {
        old: 'const response = await fetch(\'http://localhost:3003/api/user/register\', {',
        new: 'const response = await fetch(\'/api/user/register\', {'
      },
      {
        old: 'alert(\'注册失败：\' + (result.error || \'未知错误\'));',
        new: 'alert(\'注册失败：\' + (result.message || result.error || \'未知错误\'));'
      }
    ]
  }
];

console.log('🔧 开始修复所有问题...\n');

let fixedCount = 0;

fixes.forEach(fix => {
  const filePath = path.join(__dirname, fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${fix.file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  
  fix.changes.forEach(change => {
    if (content.includes(change.old)) {
      content = content.replace(change.old, change.new);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ ${fix.name}`);
    fixedCount++;
  } else {
    console.log(`⏭️  ${fix.name} - 无需修改或已修复`);
  }
});

console.log(`\n✨ 修复完成！共修复 ${fixedCount} 个文件\n`);

console.log('📋 修复内容总结：');
console.log('  1. ✅ 统一前端接口基准地址为相对路径 /api');
console.log('  2. ✅ 修复登录响应字段判断 (status -> success)');
console.log('  3. ✅ 统一注册接口地址');
console.log('  4. ✅ 修复注册错误消息显示\n');

console.log('🚀 后续步骤：');
console.log('  1. 重启后端服务: npm start (在 node-backend 目录)');
console.log('  2. 清除浏览器缓存 (Ctrl+Shift+Delete)');
console.log('  3. 重新测试登录和注册功能\n');
