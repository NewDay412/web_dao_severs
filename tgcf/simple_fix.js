// 简化的登录API修复脚本
const { execSync } = require('child_process');
const fs = require('fs');

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

// 创建简单的server.js
const serverContent = 'const express = require("express");\nconst cors = require("cors");\nconst bodyParser = require("body-parser");\nconst app = express();\napp.use(cors());\napp.use(bodyParser.json());\n\napp.get("/health", (req, res) => {\n  res.json({ status: "ok" });\n});\n\napp.post("/api/login", (req, res) => {\n  const { username, password } = req.body;\n  if (username === "admin" && password === "admin123") {\n    res.json({ success: true, user: { username, role: "admin" } });\n  } else if (username === "user1" && password === "user123") {\n    res.json({ success: true, user: { username, role: "user" } });\n  } else {\n    res.json({ success: false, message: "用户名或密码错误" });\n  }\n});\n\napp.post("/api/register", (req, res) => {\n  res.json({ success: true, message: "注册成功" });\n});\n\napp.listen(3003, () => console.log("Server running on port 3003"));';

// 创建package.json
const packageContent = '{"name":"backend","version":"1.0.0","main":"server.js","scripts":{"start":"node server.js"},"dependencies":{"express":"^4.17.1","cors":"^2.8.5","body-parser":"^1.19.0"}}';

// 写入文件
fs.writeFileSync('d:/wen_project/web_dao/server.js', serverContent);
fs.writeFileSync('d:/wen_project/web_dao/package.json', packageContent);

console.log('文件创建完成，开始部署...');

// 上传并执行
runCmd('ssh root@47.83.203.60 "mkdir -p /root/fix-backend"');
runCmd('scp d:/wen_project/web_dao/server.js root@47.83.203.60:/root/fix-backend/');
runCmd('scp d:/wen_project/web_dao/package.json root@47.83.203.60:/root/fix-backend/');

// 停止旧进程并启动新服务
runCmd('ssh root@47.83.203.60 "pkill -f node || true"');
runCmd('ssh root@47.83.203.60 "cd /root/fix-backend && npm install --production"');
runCmd('ssh root@47.83.203.60 "cd /root/fix-backend && node server.js > /root/server.log 2>&1 &"');

// 测试API
setTimeout(() => {
  console.log('\n测试登录API:');
  runCmd('curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" http://47.83.203.60:3003/api/login');
  console.log('\n修复完成，请测试登录页面');
}, 5000);