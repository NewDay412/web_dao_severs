const http = require('http');

async function testAdminLogin() {
  try {
    console.log('🔍 测试管理员登录API...\n');

    const postData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 3003,
      path: '/api/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      console.log('HTTP状态码:', res.statusCode);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('响应结果:', JSON.stringify(result, null, 2));
          
          if (result.success) {
            console.log('✅ 管理员登录成功');
          } else {
            console.log('❌ 管理员登录失败');
          }
        } catch (error) {
          console.error('解析响应失败:', error.message);
          console.log('原始响应:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('请求失败:', error.message);
    });

    req.write(postData);
    req.end();

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAdminLogin();