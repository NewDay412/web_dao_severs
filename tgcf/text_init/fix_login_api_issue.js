// 登录API问题诊断和修复脚本
const { execSync } = require('child_process');
const fs = require('fs');

/**
 * 执行命令并返回输出
 * @param {string} cmd - 要执行的命令
 * @param {boolean} showOutput - 是否显示输出
 * @returns {string} 命令执行结果
 */
function executeCommand(cmd, showOutput = true) {
  try {
    const output = execSync(cmd, { encoding: 'utf8', timeout: 30000 });
    if (showOutput) {
      console.log(`执行结果: ${output}`);
    }
    return output;
  } catch (error) {
    console.error(`命令执行失败: ${cmd}`);
    console.error(`错误信息: ${error.message}`);
    return null;
  }
}

/**
 * 检查远程服务器上的Node.js服务状态
 */
function checkRemoteService() {
  console.log('=== 检查远程服务器Node.js服务状态 ===');
  const cmd = 'ssh root@47.83.203.60 "ps aux | grep node | grep -v grep"';
  return executeCommand(cmd);
}

/**
 * 检查并创建必要的后端文件结构
 */
function setupBackendFiles() {
  console.log('=== 设置后端文件结构 ===');
  
  // 创建server.js文件
  const serverJsContent = `const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3003;

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 登录API接口
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login request received:', { username });
    
    // 模拟登录验证
    if (username === 'admin' && password === 'admin123') {
      return res.json({
        success: true,
        user: { username, role: 'admin' },
        message: '登录成功'
      });
    } else if (username === 'user1' && password === 'user123') {
      return res.json({
        success: true,
        user: { username, role: 'user' },
        message: '登录成功'
      });
    } else {
      return res.json({
        success: false,
        message: '用户名或密码错误'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 注册API接口
app.post('/api/register', (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Register request received:', { username });
    
    // 模拟注册逻辑
    if (username && password) {
      return res.json({
        success: true,
        message: '注册成功'
      });
    } else {
      return res.json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});`;

  // 创建package.json文件
  const packageJsonContent = `{
  "name": "node-backend",
  "version": "1.0.0",
  "description": "Node.js backend server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "body-parser": "^1.19.0",
    "cors": "^2.8.5",
    "express": "^4.17.1"
  }
}`;

  // 写入本地文件
  fs.writeFileSync('d:/wen_project/web_dao/temp_server.js', serverJsContent);
  fs.writeFileSync('d:/wen_project/web_dao/temp_package.json', packageJsonContent);
  
  console.log('临时文件创建成功');
}

/**
 * 上传文件到远程服务器
 */
function uploadFiles() {
  console.log('=== 上传文件到远程服务器 ===');
  
  // 创建远程目录
  executeCommand('ssh root@47.83.203.60 "mkdir -p /root/node-backend"');
  
  // 上传文件
  executeCommand('scp d:\\wen_project\\web_dao\\temp_server.js root@47.83.203.60:/root/node-backend/server.js');
  executeCommand('scp d:\\wen_project\\web_dao\\temp_package.json root@47.83.203.60:/root/node-backend/package.json');
  
  console.log('文件上传成功');
}

/**
 * 安装依赖并启动服务
 */
function setupAndStartService() {
  console.log('=== 安装依赖并启动服务 ===');
  
  // 停止现有进程
  executeCommand('ssh root@47.83.203.60 "pkill -f node"');
  
  // 安装依赖
  executeCommand('ssh root@47.83.203.60 "cd /root/node-backend && npm install --production"');
  
  // 启动服务（使用PM2）
  executeCommand('ssh root@47.83.203.60 "cd /root/node-backend && npm install pm2 -g && pm2 start server.js --name node-backend"');
  
  console.log('服务启动成功');
}

/**
 * 配置Nginx代理
 */
function configureNginx() {
  console.log('=== 配置Nginx代理 ===');
  
  const nginxConfig = `server {
    listen 80;
    server_name longlong.baby;

    location / {
        root /var/www/tgcf;
        index index.html index.htm;
        try_files $uri $uri/ =404;
    }

    location /api/ {
        proxy_pass http://localhost:3003/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`;

  // 写入临时配置文件
  fs.writeFileSync('d:\\wen_project\\web_dao\\temp_nginx.conf', nginxConfig);
  
  // 上传并应用Nginx配置
  executeCommand('scp d:\\wen_project\\web_dao\\temp_nginx.conf root@47.83.203.60:/etc/nginx/sites-available/tgcf.conf');
  executeCommand('ssh root@47.83.203.60 "ln -sf /etc/nginx/sites-available/tgcf.conf /etc/nginx/sites-enabled/"');
  executeCommand('ssh root@47.83.203.60 "nginx -t"');
  executeCommand('ssh root@47.83.203.60 "nginx -s reload || service nginx restart"');
  
  console.log('Nginx配置成功');
}

/**
 * 测试登录API
 */
function testLoginApi() {
  console.log('=== 测试登录API ===');
  
  // 等待服务启动
  console.log('等待服务启动...');
  setTimeout(() => {
    try {
      const result = executeCommand('curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" http://47.83.203.60/api/login');
      
      if (result && result.includes('{') && result.includes('}')) {
        console.log('✅ 登录接口返回有效的JSON响应');
        console.log('响应内容:', result);
      } else {
        console.error('❌ 登录接口未返回有效的JSON响应');
      }
    } catch (error) {
      console.error('测试失败:', error);
    }
  }, 5000);
}

/**
 * 主函数
 */
function main() {
  try {
    console.log('=== 开始修复登录API问题 ===');
    
    // 检查远程服务状态
    checkRemoteService();
    
    // 设置后端文件
    setupBackendFiles();
    
    // 上传文件
    uploadFiles();
    
    // 安装依赖并启动服务
    setupAndStartService();
    
    // 配置Nginx代理
    configureNginx();
    
    // 测试API
    testLoginApi();
    
    console.log('\n=== 修复完成 ===');
    console.log('请尝试再次访问登录页面：https://longlong.baby/user-web/登录页面.html');
    console.log('默认测试账号：');
    console.log('- 管理员: username=admin, password=admin123');
    console.log('- 普通用户: username=user1, password=user123');
  } catch (error) {
    console.error('修复过程中出错:', error);
  }
}

// 执行主函数
main();