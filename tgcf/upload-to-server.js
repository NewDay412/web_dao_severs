#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const SERVER = 'root@47.83.203.60';
const PASSWORD = 'root';
const REMOTE_PATH = '/root/web_dao';

const FILES_TO_UPLOAD = [
  'user-web/登录页面.html',
  'user-web/注册.html',
  'fix-all-issues.js',
  'CLOUD_DEPLOYMENT_FIX.md',
  'test-cloud-deployment.js',
  'FINAL_SOLUTION_SUMMARY.md',
  'QUICK_START.md',
  'README_FIXES.md',
  'SOLUTION_REPORT.md',
  'COMPLETION_SUMMARY.txt'
];

console.log('📤 开始上传文件到云服务器...\n');

// 使用scp上传文件
FILES_TO_UPLOAD.forEach((file, index) => {
  const localPath = path.join(__dirname, file);
  const remotePath = `${SERVER}:${REMOTE_PATH}/${file}`;
  
  if (!fs.existsSync(localPath)) {
    console.log(`❌ 文件不存在: ${file}`);
    return;
  }
  
  // 使用expect脚本处理密码
  const cmd = `echo "${PASSWORD}" | scp -o StrictHostKeyChecking=no "${localPath}" "${remotePath}"`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.log(`❌ 上传失败: ${file}`);
      console.log(`   错误: ${error.message}`);
    } else {
      console.log(`✅ 上传成功: ${file}`);
    }
    
    if (index === FILES_TO_UPLOAD.length - 1) {
      console.log('\n✨ 所有文件上传完成！');
      console.log('\n📝 后续步骤：');
      console.log('  1. SSH连接到服务器: ssh root@47.83.203.60');
      console.log('  2. 进入项目目录: cd /root/web_dao');
      console.log('  3. 启动后端服务: cd node-backend && npm start');
    }
  });
});
