const fetch = require('node-fetch');

async function testAdminAuth() {
  try {
    console.log('=== 测试管理员认证和API访问 ===');
    
    // 1. 测试管理员登录
    console.log('\n1. 测试管理员登录...');
    const loginResponse = await fetch('http://localhost:3003/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    console.log('登录响应状态:', loginResponse.status);
    const loginResult = await loginResponse.json();
    console.log('登录结果:', loginResult);
    
    if (!loginResult.success) {
      throw new Error('管理员登录失败: ' + loginResult.error);
    }
    
    const token = loginResult.data.token;
    console.log('✅ 管理员登录成功，获得token');
    
    // 2. 测试各个管理员API接口
    const testAPIs = [
      { name: 'home-content', url: 'http://localhost:3003/api/admin/home-content' },
      { name: 'character', url: 'http://localhost:3003/api/admin/character' },
      { name: 'story-intro', url: 'http://localhost:3003/api/admin/story-intro' },
      { name: 'work-review', url: 'http://localhost:3003/api/admin/work-review' },
      { name: 'message', url: 'http://localhost:3003/api/admin/message' },
      { name: 'carousel', url: 'http://localhost:3003/api/admin/carousel' },
      { name: 'basic-info', url: 'http://localhost:3003/api/admin/basic-info' },
      { name: 'quotes', url: 'http://localhost:3003/api/admin/quotes' }
    ];
    
    console.log('\n2. 测试管理员API接口访问...');
    for (const api of testAPIs) {
      try {
        const response = await fetch(api.url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ ${api.name}: ${result.data ? result.data.length : 0} 条记录`);
        } else {
          console.log(`❌ ${api.name}: HTTP ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${api.name}: ${error.message}`);
      }
    }
    
    // 3. 测试添加数据功能
    console.log('\n3. 测试添加数据功能...');
    
    // 测试添加首页内容
    try {
      const addHomeResponse = await fetch('http://localhost:3003/api/admin/home-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: '测试首页内容',
          content: '这是一个测试内容',
          status: 'published'
        })
      });
      
      if (addHomeResponse.ok) {
        const result = await addHomeResponse.json();
        console.log('✅ 首页内容添加成功:', result.data);
      } else {
        console.log('❌ 首页内容添加失败:', addHomeResponse.status);
      }
    } catch (error) {
      console.log('❌ 首页内容添加异常:', error.message);
    }
    
    // 测试添加作品评价
    try {
      const addReviewResponse = await fetch('http://localhost:3003/api/admin/work-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: '测试用户',
          rating: 5,
          content: '测试评价内容',
          tags: '测试标签',
          status: 'approved'
        })
      });
      
      if (addReviewResponse.ok) {
        const result = await addReviewResponse.json();
        console.log('✅ 作品评价添加成功:', result.data);
      } else {
        console.log('❌ 作品评价添加失败:', addReviewResponse.status);
      }
    } catch (error) {
      console.log('❌ 作品评价添加异常:', error.message);
    }
    
    console.log('\n✅ 管理员认证和API测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAdminAuth();