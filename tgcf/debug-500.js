const http = require('http');

// 测试服务器健康状态
function testServer() {
  console.log('🔍 检查服务器状态...');
  
  const options = {
    hostname: 'localhost',
    port: 3003,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`状态码: ${res.statusCode}`);
    console.log(`响应头: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('响应内容:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ 服务器运行正常');
        testLogin();
      } else {
        console.log('❌ 服务器异常');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ 连接失败:', e.message);
    console.log('请确保服务器已启动: npm start');
  });

  req.end();
}

// 测试登录接口
function testLogin() {
  console.log('\n🔍 测试登录接口...');
  
  const postData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
  });

  const options = {
    hostname: 'localhost',
    port: 3003,
    path: '/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`登录状态码: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('登录响应:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ 登录接口正常');
      } else {
        console.log('❌ 登录接口异常');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ 登录测试失败:', e.message);
  });

  req.write(postData);
  req.end();
}

// 开始测试
testServer();