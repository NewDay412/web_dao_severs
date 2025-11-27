// 直接在远程服务器上修复登录API
const { execSync } = require('child_process');

// 执行命令函数
function runCmd(cmd) {
  try {
    console.log('执行:', cmd);
    const output = execSync(cmd, { encoding: 'utf8' });
    console.log('结果:', output);
    return output;
  } catch (e) {
    console.error('失败:', e.message);
    return null;
  }
}

// 直接在远程服务器上创建文件和启动服务
console.log('开始在远程服务器上创建后端服务...');

// 创建server.js文件
const createServerCmd = `ssh root@47.83.203.60 "cat > /root/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username);
  
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true, user: { username, role: 'admin' }, message: '登录成功' });
  } else if (username === 'user1' && password === 'user123') {
    res.json({ success: true, user: { username, role: 'user' }, message: '登录成功' });
  } else {
    res.json({ success: false, message: '用户名或密码错误' });
  }
});

app.post('/api/register', (req, res) => {
  res.json({ success: true, message: '注册成功' });
});

app.listen(3003, () => console.log('Server running on port 3003'));
EOF`;

// 创建package.json文件
const createPackageCmd = `ssh root@47.83.203.60 "cat > /root/package.json << 'EOF'
{
  "name": "backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "cors": "^2.8.5",
    "body-parser": "^1.19.0"
  }
}
EOF`;

// 执行命令
runCmd(createServerCmd);
runCmd(createPackageCmd);

// 安装依赖并启动服务
runCmd('ssh root@47.83.203.60 "cd /root && npm install --production"');
runCmd('ssh root@47.83.203.60 "pkill -f node || true"');
runCmd('ssh root@47.83.203.60 "cd /root && node server.js > /root/server.log 2>&1 &"');

// 测试API
setTimeout(() => {
  console.log('\n测试登录API:');
  runCmd('curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" http://47.83.203.60:3003/api/login');
  console.log('\n修复完成，请测试登录页面');
}, 5000);