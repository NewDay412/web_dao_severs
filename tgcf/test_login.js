const axios = require('axios');

/**
 * 测试登录接口
 * 验证修复后的登录功能是否正常工作
 */
async function testLogin() {
  const baseURL = 'http://localhost:3003';
  
  console.log('🔍 开始测试登录接口...');
  console.log('='.repeat(50));
  
  // 测试用例1: 无效参数（缺少密码）
  try {
    console.log('\n📋 测试用例1: 无效参数（缺少密码）');
    const response = await axios.post(`${baseURL}/api/login`, {
      username: 'testuser'
    });
    console.log('❌ 预期失败但返回成功:', response.data);
  } catch (error) {
    const status = error.response?.status || 'N/A';
    const message = error.response?.data?.message || '未知错误';
    console.log(`✅ 返回预期错误 (${status}): ${message}`);
  }
  
  // 测试用例2: 默认管理员账号登录
  try {
    console.log('\n📋 测试用例2: 默认管理员账号登录');
    const response = await axios.post(`${baseURL}/api/login`, {
      username: 'admin',
      password: 'admin123'
    });
    if (response.data.success && response.data.token) {
      console.log('✅ 登录成功:', response.data.user);
      console.log('   Token:', response.data.token.substring(0, 30) + '...');
    } else {
      console.log('❌ 登录失败:', response.data);
    }
  } catch (error) {
    console.log('❌ 登录异常:', error.message);
  }
  
  // 测试用例3: 默认普通用户登录
  try {
    console.log('\n📋 测试用例3: 默认普通用户登录');
    const response = await axios.post(`${baseURL}/api/login`, {
      username: 'user1',
      password: 'password123'
    });
    if (response.data.success && response.data.token) {
      console.log('✅ 登录成功:', response.data.user);
      console.log('   Token:', response.data.token.substring(0, 30) + '...');
    } else {
      console.log('❌ 登录失败:', response.data);
    }
  } catch (error) {
    console.log('❌ 登录异常:', error.message);
  }
  
  // 测试用例4: 不存在的用户
  try {
    console.log('\n📋 测试用例4: 不存在的用户');
    const response = await axios.post(`${baseURL}/api/login`, {
      username: 'nonexistent',
      password: 'wrongpassword'
    });
    console.log('❌ 预期失败但返回成功:', response.data);
  } catch (error) {
    const status = error.response?.status || 'N/A';
    const message = error.response?.data?.message || '未知错误';
    console.log(`✅ 返回预期错误 (${status}): ${message}`);
  }
  
  // 测试用例5: 空参数
  try {
    console.log('\n📋 测试用例5: 空参数');
    const response = await axios.post(`${baseURL}/api/login`, {});
    console.log('❌ 预期失败但返回成功:', response.data);
  } catch (error) {
    const status = error.response?.status || 'N/A';
    const message = error.response?.data?.message || '未知错误';
    console.log(`✅ 返回预期错误 (${status}): ${message}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📝 测试完成');
}

// 运行测试
testLogin().catch(console.error);
