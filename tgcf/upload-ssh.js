#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const config = {
  host: '47.83.203.60',
  port: 22,
  username: 'root',
  password: 'root',
  algorithms: {
    serverHostKey: ['ssh-rsa', 'ssh-dss'],
    cipher: ['aes128-ctr', 'aes192-ctr', 'aes256-ctr', 'aes128-cbc', 'aes192-cbc', 'aes256-cbc', '3des-cbc'],
    hmac: ['hmac-sha2-256', 'hmac-sha2-512', 'hmac-sha1'],
    compress: ['none']
  },
  readyTimeout: 30000,
  strictHostKey: false
};

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

const conn = new Client();

console.log('📤 开始上传文件到云服务器...\n');

conn.on('ready', () => {
  console.log('✅ SSH连接成功\n');
  uploadFiles(0);
}).on('error', (err) => {
  console.error('❌ SSH连接失败:', err.message);
  console.error('\n💡 解决方案：');
  console.error('  1. 使用WinSCP图形界面上传');
  console.error('  2. 或使用scp命令手动上传');
  console.error('  3. 或检查服务器SSH配置');
  process.exit(1);
}).on('close', () {
  console.log('\n✨ 所有文件上传完成！');
  console.log('\n📝 后续步骤：');
  console.log('  1. SSH连接到服务器: ssh root@47.83.203.60');
  console.log('  2. 进入项目目录: cd /root/web_dao');
  console.log('  3. 启动后端服务: cd node-backend && npm start');
  process.exit(0);
});

function uploadFiles(index) {
  if (index >= FILES.length) {
    conn.end();
    return;
  }

  const file = FILES[index];
  const localPath = path.join(__dirname, file);
  const remotePath = `/root/web_dao/${file}`;

  if (!fs.existsSync(localPath)) {
    console.log(`❌ 文件不存在: ${file}`);
    uploadFiles(index + 1);
    return;
  }

  conn.sftp((err, sftp) => {
    if (err) {
      console.error(`❌ SFTP连接失败: ${err.message}`);
      uploadFiles(index + 1);
      return;
    }

    const readStream = fs.createReadStream(localPath);
    const writeStream = sftp.createWriteStream(remotePath);

    writeStream.on('close', () => {
      console.log(`✅ 上传成功: ${file}`);
      uploadFiles(index + 1);
    }).on('error', (err) => {
      console.log(`❌ 上传失败: ${file} - ${err.message}`);
      uploadFiles(index + 1);
    });

    readStream.pipe(writeStream);
  });
}

conn.connect(config);
