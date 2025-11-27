#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const SERVER = 'root@47.83.203.60';
const PASSWORD = 'root';
const REMOTE_PATH = '/root/web_dao';

const FILES = [
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

let uploadedCount = 0;
let failedCount = 0;

function uploadFile(index) {
  if (index >= FILES.length) {
    console.log(`\n✨ 上传完成！成功: ${uploadedCount}, 失败: ${failedCount}`);
    process.exit(failedCount > 0 ? 1 : 0);
  }

  const file = FILES[index];
  const localPath = path.join(__dirname, file);
  const remotePath = `${SERVER}:${REMOTE_PATH}/${file}`;

  if (!fs.existsSync(localPath)) {
    console.log(`❌ 文件不存在: ${file}`);
    failedCount++;
    uploadFile(index + 1);
    return;
  }

  // 使用scp命令上传
  const scp = spawn('scp', ['-o', 'StrictHostKeyChecking=no', localPath, remotePath]);

  let output = '';
  let errorOutput = '';

  scp.stdout.on('data', (data) => {
    output += data.toString();
  });

  scp.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  scp.on('close', (code) => {
    if (code === 0) {
      console.log(`✅ 上传成功: ${file}`);
      uploadedCount++;
    } else {
      console.log(`❌ 上传失败: ${file}`);
      if (errorOutput) {
        console.log(`   错误: ${errorOutput.trim()}`);
      }
      failedCount++;
    }
    uploadFile(index + 1);
  });

  scp.on('error', (err) => {
    console.log(`❌ 上传失败: ${file}`);
    console.log(`   错误: ${err.message}`);
    failedCount++;
    uploadFile(index + 1);
  });
}

uploadFile(0);
