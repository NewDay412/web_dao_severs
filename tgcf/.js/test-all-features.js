#!/usr/bin/env node

/**
 * 功能测试脚本
 * 测试项目的主要功能是否正常工作
 */

const http = require('http');
const https = require('https');

console.log('🧪 开始功能测试...\n');

// 测试结果
const testResults = {
  server: false,
  userAPI: false,
  adminAPI: false,
  database: false,
  fileUpload: false
};

// 发送HTTP请求的辅助函数
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.port === 443 ? https : http;
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// 1. 测试服务器基本功能
async function testServer() {
  console.log('🖥️  测试服务器基本功能...');
  
  try {
    // 测试健康检查接口
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/health',
      method: 'GET'
    });
    
    if (healthResponse.statusCode === 200) {
      const healthData = JSON.parse(healthResponse.data);
      if (healthData.status === 'ok') {
        console.log('✅ 健康检查接口正常');
        console.log(`   版本: ${healthData.version}`);
        testResults.server = true;
      } else {
        console.log('❌ 健康检查接口返回异常状态');
      }
    } else {
      console.log(`❌ 健康检查接口返回错误状态码: ${healthResponse.statusCode}`);
    }
    
    // 测试根路径重定向
    const rootResponse = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/',
      method: 'GET'
    });
    
    if (rootResponse.statusCode === 302 || rootResponse.statusCode === 301) {
      console.log('✅ 根路径重定向正常');
    } else {
      console.log(`⚠️  根路径重定向异常: ${rootResponse.statusCode}`);
    }
    
  } catch (error) {
    console.log('❌ 服务器连接失败:', error.message);
  }
}

// 2. 测试用户API
async function testUserAPI() {
  console.log('👤 测试用户API...');
  
  const userEndpoints = [
    { path: '/api/user/home-content', name: '首页内容' },
    { path: '/api/user/character', name: '角色信息' },
    { path: '/api/user/story-intro', name: '剧情简介' },
    { path: '/api/user/review', name: '作品评价' },
    { path: '/api/user/message', name: '留言板' },
    { path: '/api/user/menu', name: '导航菜单' },
    { path: '/api/user/quotes', name: '人物语录' },
    { path: '/api/user/basic-info', name: '基本信息' },
    { path: '/api/user/carousel', name: '轮播图' }
  ];
  
  let successCount = 0;
  
  for (const endpoint of userEndpoints) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3003,
        path: endpoint.path,
        method: 'GET'
      });
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.data);
        if (data.success) {
          console.log(`✅ ${endpoint.name}接口正常`);
          successCount++;
        } else {
          console.log(`⚠️  ${endpoint.name}接口返回失败: ${data.message || '未知错误'}`);
        }
      } else {
        console.log(`❌ ${endpoint.name}接口状态码错误: ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}接口请求失败: ${error.message}`);
    }
  }
  
  if (successCount >= userEndpoints.length * 0.8) {
    testResults.userAPI = true;
    console.log(`✅ 用户API测试通过 (${successCount}/${userEndpoints.length})`);
  } else {
    console.log(`❌ 用户API测试失败 (${successCount}/${userEndpoints.length})`);
  }
}

// 3. 测试管理员登录和API
async function testAdminAPI() {
  console.log('👨‍💼 测试管理员API...');
  
  try {
    // 测试管理员登录
    const loginData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });
    
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    }, loginData);
    
    if (loginResponse.statusCode === 200) {
      const loginResult = JSON.parse(loginResponse.data);
      if (loginResult.success && loginResult.data.token) {
        console.log('✅ 管理员登录成功');
        
        const token = loginResult.data.token;
        
        // 测试需要认证的管理员接口
        const adminEndpoints = [
          { path: '/api/admin/home-content', name: '首页内容管理' },
          { path: '/api/admin/character', name: '角色管理' },
          { path: '/api/admin/message', name: '留言管理' },
          { path: '/api/admin/review', name: '评价管理' }
        ];
        
        let adminSuccessCount = 0;
        
        for (const endpoint of adminEndpoints) {
          try {
            const response = await makeRequest({
              hostname: 'localhost',
              port: 3003,
              path: endpoint.path,
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.statusCode === 200) {
              console.log(`✅ ${endpoint.name}接口正常`);
              adminSuccessCount++;
            } else {
              console.log(`❌ ${endpoint.name}接口状态码错误: ${response.statusCode}`);
            }
          } catch (error) {
            console.log(`❌ ${endpoint.name}接口请求失败: ${error.message}`);
          }
        }
        
        if (adminSuccessCount >= adminEndpoints.length * 0.8) {
          testResults.adminAPI = true;
        }
        
      } else {
        console.log('❌ 管理员登录失败: 无效的响应格式');
      }
    } else {
      console.log(`❌ 管理员登录失败: 状态码 ${loginResponse.statusCode}`);
    }
    
  } catch (error) {
    console.log('❌ 管理员API测试失败:', error.message);
  }
}

// 4. 测试数据库功能
async function testDatabase() {
  console.log('🗄️  测试数据库功能...');
  
  try {
    // 通过API测试数据库读取
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/user/basic-info',
      method: 'GET'
    });
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      if (data.success && Array.isArray(data.data)) {
        console.log('✅ 数据库读取功能正常');
        console.log(`   基本信息记录数: ${data.data.length}`);
        testResults.database = true;
      } else {
        console.log('❌ 数据库返回数据格式错误');
      }
    } else {
      console.log(`❌ 数据库测试失败: 状态码 ${response.statusCode}`);
    }
    
  } catch (error) {
    console.log('❌ 数据库测试失败:', error.message);
  }
}

// 5. 测试文件上传功能（模拟测试）
async function testFileUpload() {
  console.log('📁 测试文件上传功能...');
  
  try {
    // 测试上传接口是否存在（不实际上传文件）
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/admin/upload-image',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid-token'  // 故意使用无效token测试接口存在性
      }
    });
    
    // 如果返回401（未授权）而不是404（不存在），说明接口存在
    if (response.statusCode === 401) {
      console.log('✅ 文件上传接口存在');
      testResults.fileUpload = true;
    } else if (response.statusCode === 404) {
      console.log('❌ 文件上传接口不存在');
    } else {
      console.log(`⚠️  文件上传接口状态异常: ${response.statusCode}`);
    }
    
  } catch (error) {
    console.log('❌ 文件上传测试失败:', error.message);
  }
}

// 主测试函数
async function runAllTests() {
  await testServer();
  console.log();
  
  if (testResults.server) {
    await testUserAPI();
    console.log();
    
    await testAdminAPI();
    console.log();
    
    await testDatabase();
    console.log();
    
    await testFileUpload();
    console.log();
  } else {
    console.log('⚠️  服务器未运行，跳过其他测试');
    console.log();
  }
  
  // 测试总结
  console.log('📊 测试结果总结:');
  console.log('==================');
  
  const testItems = [
    { name: '服务器基本功能', status: testResults.server },
    { name: '用户API接口', status: testResults.userAPI },
    { name: '管理员API接口', status: testResults.adminAPI },
    { name: '数据库功能', status: testResults.database },
    { name: '文件上传功能', status: testResults.fileUpload }
  ];
  
  let passedCount = 0;
  
  for (const item of testItems) {
    const status = item.status ? '✅' : '❌';
    console.log(`${status} ${item.name}`);
    if (item.status) passedCount++;
  }
  
  console.log(`\n测试通过: ${passedCount}/${testItems.length}`);
  
  if (passedCount === testItems.length) {
    console.log('\n🎉 所有功能测试通过！项目运行正常。');
    console.log('\n🚀 你可以开始使用以下功能:');
    console.log('• 用户页面浏览和交互');
    console.log('• 管理员后台管理');
    console.log('• 内容管理和发布');
    console.log('• 用户留言和评价');
    console.log('• 图片上传和管理');
  } else {
    console.log('\n⚠️  部分功能测试失败，请检查相关配置。');
    
    if (!testResults.server) {
      console.log('\n💡 服务器问题:');
      console.log('• 运行 start-server.bat 启动服务器');
      console.log('• 检查端口3003是否被占用');
    }
    
    if (!testResults.database) {
      console.log('\n💡 数据库问题:');
      console.log('• 检查MySQL服务是否启动');
      console.log('• 确认数据库密码配置正确');
    }
  }
  
  console.log('\n📚 更多信息:');
  console.log('• 部署指南: DEPLOYMENT_GUIDE.md');
  console.log('• 项目文档: README.md');
  console.log('• 健康检查: node health-check.js');
}

// 运行测试
console.log('⏱️  测试预计需要30-60秒，请耐心等待...\n');
runAllTests().catch(console.error);