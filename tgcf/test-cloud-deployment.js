#!/usr/bin/env node

/**
 * 云服务器部署验证脚本
 * 测试所有接口是否正常工作
 */

const http = require('http');

const SERVER_URL = 'http://47.83.203.60:3003';
const TESTS = [];

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(SERVER_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    TESTS.push({ name, passed: true });
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   错误: ${error.message}`);
    TESTS.push({ name, passed: false, error: error.message });
  }
}

async function runTests() {
  console.log('🧪 开始测试云服务器部署...\n');

  // 测试1: 健康检查
  await test('健康检查接口', async () => {
    const result = await makeRequest('GET', '/health');
    if (result.status !== 200 || !result.data.status) {
      throw new Error(`状态码: ${result.status}`);\n    }
  });

  // 测试2: 登录接口 - 正确凭证
  await test('登录接口 - 管理员账号', async () => {
    const result = await makeRequest('POST', '/api/login', {
      username: 'admin',
      password: 'admin123'
    });
    if (result.status !== 200 || !result.data.success) {
      throw new Error(`登录失败: ${result.data.message}`);\n    }
    if (!result.data.token) {
      throw new Error('未返回token');\n    }
  });

  // 测试3: 登录接口 - 错误密码
  await test('登录接口 - 错误密码处理', async () => {
    const result = await makeRequest('POST', '/api/login', {
      username: 'admin',
      password: 'wrongpassword'
    });
    if (result.status === 200 && result.data.success) {
      throw new Error('不应该登录成功');\n    }
    if (!result.data.message) {
      throw new Error('未返回错误信息');\n    }
  });

  // 测试4: 注册接口
  await test('注册接口 - 新用户注册', async () => {
    const testUser = `testuser_${Date.now()}`;
    const result = await makeRequest('POST', '/api/user/register', {
      username: testUser,
      password: 'testpass123',
      sex: 'male'
    });
    if (result.status !== 200 || !result.data.success) {
      throw new Error(`注册失败: ${result.data.message}`);\n    }
  });

  // 测试5: 获取首页内容
  await test('获取首页内容接口', async () => {
    const result = await makeRequest('GET', '/api/user/home-content');
    if (result.status !== 200 || !result.data.success) {
      throw new Error(`获取失败: ${result.data.error}`);\n    }
    if (!Array.isArray(result.data.data)) {
      throw new Error('返回数据格式错误');\n    }
  });

  // 测试6: 获取角色信息
  await test('获取角色信息接口', async () => {
    const result = await makeRequest('GET', '/api/user/character');
    if (result.status !== 200 || !result.data.success) {
      throw new Error(`获取失败: ${result.data.error}`);\n    }
  });

  // 测试7: 获取轮播图
  await test('获取轮播图接口', async () => {
    const result = await makeRequest('GET', '/api/user/carousel');
    if (result.status !== 200 || !result.data.success) {
      throw new Error(`获取失败: ${result.data.error}`);\n    }
  });

  // 测试8: 提交留言
  await test('提交留言接口', async () => {
    const result = await makeRequest('POST', '/api/user/message', {
      username: 'testuser',
      email: 'test@example.com',
      phone: '13800138000',
      content: '这是一条测试留言'
    });
    if (result.status !== 200 || !result.data.success) {
      throw new Error(`提交失败: ${result.data.error}`);\n    }
  });

  // 测试9: 获取留言列表
  await test('获取留言列表接口', async () => {
    const result = await makeRequest('GET', '/api/user/message');
    if (result.status !== 200 || !result.data.success) {
      throw new Error(`获取失败: ${result.data.error}`);\n    }
  });

  // 测试10: 404处理
  await test('404错误处理', async () => {
    const result = await makeRequest('GET', '/api/nonexistent');
    if (result.status !== 404) {
      throw new Error(`应该返回404，实际: ${result.status}`);\n    }
    if (!result.data.error) {
      throw new Error('未返回错误信息');\n    }
  });

  console.log('\n📊 测试结果统计：');
  const passed = TESTS.filter(t => t.passed).length;
  const total = TESTS.length;
  console.log(`   通过: ${passed}/${total}`);
  console.log(`   失败: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('\n✨ 所有测试通过！云服务器部署正常。\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  部分测试失败，请检查上述错误。\n');
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('测试执行出错:', error);
  process.exit(1);
});
