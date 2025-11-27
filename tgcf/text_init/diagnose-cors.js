#!/usr/bin/env node

const http = require('http');

const SERVER = '47.83.203.60';
const PORT = 3003;

console.log('🔍 诊断CORS和登录接口...\n');

// 测试健康检查
function testHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: SERVER,
      port: PORT,
      path: '/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ 健康检查: ${res.statusCode}`);
        console.log(`   响应: ${data.substring(0, 100)}`);
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ 健康检查失败: ${err.message}`);
      resolve(false);
    });

    req.end();
  });
}

// 测试登录接口
function testLogin() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });

    const options = {
      hostname: SERVER,
      port: PORT,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n✅ 登录接口: ${res.statusCode}`);
        console.log(`   Content-Type: ${res.headers['content-type']}`);
        console.log(`   CORS Headers:`);
        console.log(`   - Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || '未设置'}`);
        console.log(`   - Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || '未设置'}`);
        
        try {
          const json = JSON.parse(data);
          console.log(`   响应: ${JSON.stringify(json).substring(0, 100)}`);
          resolve(true);
        } catch (e) {
          console.log(`   ❌ 响应不是JSON: ${data.substring(0, 100)}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ 登录接口失败: ${err.message}`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// 测试OPTIONS预检请求
function testOptions() {
  return new Promise((resolve) => {
    const options = {
      hostname: SERVER,
      port: PORT,
      path: '/api/login',
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://longlong.baby',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`\n✅ OPTIONS预检: ${res.statusCode}`);
      console.log(`   CORS Headers:`);
      console.log(`   - Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || '未设置'}`);
      console.log(`   - Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || '未设置'}`);
      console.log(`   - Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || '未设置'}`);
      resolve(res.statusCode === 200);
    });

    req.on('error', (err) => {
      console.log(`❌ OPTIONS预检失败: ${err.message}`);
      resolve(false);
    });

    req.end();
  });
}

async function runDiagnostics() {
  console.log(`服务器: ${SERVER}:${PORT}\n`);
  
  const health = await testHealth();
  const options = await testOptions();
  const login = await testLogin();

  console.log('\n' + '='.repeat(60));
  console.log('诊断结果：');
  console.log('='.repeat(60));
  
  if (health && options && login) {
    console.log('✅ 所有检查通过！');
    console.log('\n问题可能原因：');
    console.log('1. 浏览器缓存 - 清除缓存后重试');
    console.log('2. 域名配置 - 确认https://longlong.baby已正确配置');
    console.log('3. 前端代码 - 检查是否使用了正确的接口地址');
  } else {
    console.log('❌ 部分检查失败！');
    console.log('\n解决方案：');
    if (!health) {
      console.log('1. 后端服务未启动 - 执行: cd node-backend && npm start');
    }
    if (!options) {
      console.log('2. CORS配置不完整 - 检查node-backend/app.js中的corsOptions');
    }
    if (!login) {
      console.log('3. 登录接口异常 - 检查后端日志');
    }
  }
}

runDiagnostics();
