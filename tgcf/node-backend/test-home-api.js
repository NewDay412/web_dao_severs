const http = require('http');

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testHomeApi() {
  console.log('开始测试首页内容API...');
  
  try {
    // 1. 登录获取令牌
    console.log('1. 尝试登录获取令牌...');
    const loginOptions = {
      hostname: '127.0.0.1',
      port: 3003,
      path: '/api/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        username: 'admin',
        password: 'password' // 尝试使用系统其他地方使用的密码
      }
    };
    
    const loginResult = await makeRequest(loginOptions);
    console.log('登录响应状态码:', loginResult.statusCode);
    
    let loginData;
    try {
      loginData = JSON.parse(loginResult.data);
      console.log('登录响应:', loginData);
    } catch (e) {
      console.log('原始登录响应:', loginResult.data);
      return;
    }
    
    if (!loginData.success || !loginData.data || !loginData.data.token) {
      console.error('登录失败或未获取到令牌');
      return;
    }
    
    const token = loginData.data.token;
    console.log('✅ 成功获取令牌:', token.substring(0, 20) + '...');
    
    // 2. 使用令牌访问首页内容API
    console.log('\n2. 使用令牌访问首页内容API...');
    const homeOptions = {
      hostname: '127.0.0.1',
      port: 3003,
      path: '/api/admin/home-content',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const homeResult = await makeRequest(homeOptions);
    console.log('首页内容API响应状态码:', homeResult.statusCode);
    
    try {
      const homeData = JSON.parse(homeResult.data);
      console.log('首页内容API响应:', homeData);
      
      if (homeResult.statusCode === 500) {
        console.error('❌ 发现500错误！');
      } else if (homeResult.statusCode === 200) {
        console.log('✅ API调用成功！');
        if (homeData.data && Array.isArray(homeData.data)) {
          console.log(`获取到 ${homeData.data.length} 条首页内容`);
        }
      }
    } catch (e) {
      console.log('原始首页内容API响应:', homeResult.data);
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

testHomeApi();