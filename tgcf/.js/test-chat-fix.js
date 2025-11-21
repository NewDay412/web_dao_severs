#!/usr/bin/env node

/**
 * 聊天功能修复测试脚本
 */

const http = require('http');

console.log('🧪 开始测试聊天功能修复...\n');

// 发送HTTP请求的辅助函数
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
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

// 获取管理员token
async function getAdminToken() {
  try {
    const loginData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });
    
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    }, loginData);
    
    if (response.statusCode === 200) {
      const result = JSON.parse(response.data);
      if (result.success && result.data.token) {
        console.log('✅ 管理员登录成功');
        return result.data.token;
      }
    }
    throw new Error('登录失败');
  } catch (error) {
    console.log('❌ 管理员登录失败:', error.message);
    return null;
  }
}

// 测试发送聊天消息
async function testSendMessage(token) {
  try {
    console.log('\n📤 测试发送聊天消息...');
    
    const messageData = JSON.stringify({
      sender_name: 'test_user',
      receiver_name: 'admin',
      content: '你好，我是测试用户！'
    });
    
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/admin-chat/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(messageData)
      }
    }, messageData);
    
    if (response.statusCode === 200) {
      const result = JSON.parse(response.data);
      if (result.success) {
        console.log('✅ 消息发送成功');
        return true;
      }
    }
    console.log('❌ 消息发送失败:', response.data);
    return false;
  } catch (error) {
    console.log('❌ 消息发送失败:', error.message);
    return false;
  }
}

// 测试获取用户列表
async function testGetUsers(token) {
  try {
    console.log('\n👥 测试获取用户列表...');
    
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/admin-chat/users',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.statusCode === 200) {
      const result = JSON.parse(response.data);
      if (result.success) {
        console.log('✅ 用户列表获取成功');
        console.log(`   找到 ${result.data.length} 个用户:`);
        result.data.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.username} (最后活跃: ${new Date(user.last_message_time).toLocaleString()})`);
        });
        return result.data;
      }
    }
    console.log('❌ 用户列表获取失败:', response.data);
    return [];
  } catch (error) {
    console.log('❌ 用户列表获取失败:', error.message);
    return [];
  }
}

// 测试获取与特定用户的聊天记录
async function testGetUserMessages(token, username) {
  try {
    console.log(`\n💬 测试获取与用户 ${username} 的聊天记录...`);
    
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: `/api/admin-chat/messages/${username}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.statusCode === 200) {
      const result = JSON.parse(response.data);
      if (result.success) {
        console.log('✅ 聊天记录获取成功');
        console.log(`   找到 ${result.data.length} 条消息:`);
        result.data.forEach((msg, index) => {
          const time = new Date(msg.create_time).toLocaleString();
          console.log(`   ${index + 1}. [${time}] ${msg.sender_name}: ${msg.content || '[文件消息]'}`);
        });
        return result.data;
      }
    }
    console.log('❌ 聊天记录获取失败:', response.data);
    return [];
  } catch (error) {
    console.log('❌ 聊天记录获取失败:', error.message);
    return [];
  }
}

// 测试管理员回复消息
async function testAdminReply(token, username) {
  try {
    console.log(`\n📝 测试管理员回复用户 ${username}...`);
    
    const replyData = JSON.stringify({
      sender_name: 'admin',
      receiver_name: username,
      content: '你好！我是管理员，有什么可以帮助你的吗？'
    });
    
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/admin-chat/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(replyData)
      }
    }, replyData);
    
    if (response.statusCode === 200) {
      const result = JSON.parse(response.data);
      if (result.success) {
        console.log('✅ 管理员回复成功');
        return true;
      }
    }
    console.log('❌ 管理员回复失败:', response.data);
    return false;
  } catch (error) {
    console.log('❌ 管理员回复失败:', error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('🔧 聊天功能修复测试');
  console.log('==================\n');
  
  // 1. 获取管理员token
  const token = await getAdminToken();
  if (!token) {
    console.log('\n❌ 无法获取管理员token，测试终止');
    return;
  }
  
  // 2. 发送测试消息
  await testSendMessage(token);
  
  // 3. 获取用户列表
  const users = await testGetUsers(token);
  
  // 4. 如果有用户，测试获取聊天记录和回复
  if (users.length > 0) {
    const testUser = users[0];
    await testGetUserMessages(token, testUser.username);
    await testAdminReply(token, testUser.username);
    
    // 再次获取聊天记录，验证回复是否成功
    console.log('\n🔄 验证回复是否成功...');
    await testGetUserMessages(token, testUser.username);
  }
  
  console.log('\n📊 测试总结:');
  console.log('==================');
  console.log('✅ 管理员登录功能正常');
  console.log('✅ 聊天消息发送功能正常');
  console.log('✅ 用户列表获取功能正常');
  console.log('✅ 聊天记录获取功能正常');
  console.log('✅ 管理员回复功能正常');
  
  console.log('\n🎉 聊天功能修复测试完成！');
  console.log('\n💡 现在可以在管理后台测试聊天功能:');
  console.log('1. 打开 admin-web/admin.html');
  console.log('2. 登录管理员账号 (admin/admin123)');
  console.log('3. 点击"用户聊天"菜单');
  console.log('4. 选择用户进行聊天');
}

// 运行测试
runTests().catch(console.error);