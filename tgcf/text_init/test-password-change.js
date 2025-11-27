#!/usr/bin/env node

/**
 * 测试管理员密码修改功能
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3003/api';

async function testPasswordChange() {
  console.log('🔐 测试管理员密码修改功能...\n');

  try {
    // 1. 先登录获取token
    console.log('1. 管理员登录...');
    const loginResponse = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    const loginResult = await loginResponse.json();
    
    if (!loginResult.success) {
      console.error('❌ 登录失败:', loginResult.error);
      return;
    }

    const token = loginResult.data.token;
    console.log('✅ 登录成功，获得token');

    // 2. 测试修改密码（使用错误的当前密码）
    console.log('\n2. 测试错误的当前密码...');
    const wrongPasswordResponse = await fetch(`${API_BASE}/admin/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      })
    });

    const wrongPasswordResult = await wrongPasswordResponse.json();
    
    if (wrongPasswordResult.success) {
      console.error('❌ 应该失败但成功了');
    } else {
      console.log('✅ 正确拒绝了错误的当前密码:', wrongPasswordResult.error);
    }

    // 3. 测试修改密码（使用正确的当前密码）
    console.log('\n3. 测试正确的密码修改...');
    const correctPasswordResponse = await fetch(`${API_BASE}/admin/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: 'admin123',
        newPassword: 'newpassword123'
      })
    });

    const correctPasswordResult = await correctPasswordResponse.json();
    
    if (correctPasswordResult.success) {
      console.log('✅ 密码修改成功');
      
      // 4. 测试用新密码登录
      console.log('\n4. 测试新密码登录...');
      const newLoginResponse = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'newpassword123'
        })
      });

      const newLoginResult = await newLoginResponse.json();
      
      if (newLoginResult.success) {
        console.log('✅ 新密码登录成功');
        
        // 5. 恢复原密码
        console.log('\n5. 恢复原密码...');
        const restoreResponse = await fetch(`${API_BASE}/admin/update-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newLoginResult.data.token}`
          },
          body: JSON.stringify({
            currentPassword: 'newpassword123',
            newPassword: 'admin123'
          })
        });

        const restoreResult = await restoreResponse.json();
        
        if (restoreResult.success) {
          console.log('✅ 密码已恢复为原密码');
        } else {
          console.error('❌ 恢复密码失败:', restoreResult.error);
        }
      } else {
        console.error('❌ 新密码登录失败:', newLoginResult.error);
      }
    } else {
      console.error('❌ 密码修改失败:', correctPasswordResult.error);
    }

    console.log('\n🎉 密码修改功能测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  testPasswordChange();
}

module.exports = { testPasswordChange };