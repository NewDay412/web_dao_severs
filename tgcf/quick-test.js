const http = require('http');

// 测试服务器连接
function testConnection() {
  console.log('🔍 测试服务器连接...');
  
  const options = {
    hostname: 'localhost',
    port: 3003,
    path: '/health',
    method: 'GET',
    timeout: 10000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ 连接成功 - 状态码: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📊 响应数据:', data);
    });
  });

  req.on('error', (err) => {
    console.log('❌ 连接失败:', err.message);
  });

  req.on('timeout', () => {
    console.log('⏰ 连接超时');
    req.destroy();
  });

  req.end();
}

// 延迟测试，给服务器启动时间
setTimeout(testConnection, 2000);