const fetch = require('node-fetch');

async function testReviewAPI() {
  try {
    console.log('=== 测试作品评价API ===');
    
    // 1. 先登录获取token
    console.log('1. 登录管理员账号...');
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
    
    const loginResult = await loginResponse.json();
    console.log('登录结果:', loginResult);
    
    if (!loginResult.success) {
      throw new Error('登录失败: ' + loginResult.error);
    }
    
    const token = loginResult.data.token;
    console.log('✅ 登录成功，获得token');
    
    // 2. 测试添加作品评价
    console.log('\n2. 测试添加作品评价...');
    const reviewData = {
      username: '测试用户',
      rating: 5,
      content: '这是一个测试评价，天官赐福真的很棒！',
      tags: '剧情精彩,人物生动',
      status: 'pending'
    };
    
    console.log('发送数据:', reviewData);
    
    const addResponse = await fetch('http://localhost:3003/api/admin/work-review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    
    const addResult = await addResponse.json();
    console.log('添加结果:', addResult);
    
    if (addResult.success) {
      console.log('✅ 作品评价添加成功，ID:', addResult.data.reviewId);
      
      // 3. 获取评价列表验证
      console.log('\n3. 获取评价列表验证...');
      const listResponse = await fetch('http://localhost:3003/api/admin/work-review', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const listResult = await listResponse.json();
      console.log('评价列表:', listResult);
      
      if (listResult.success) {
        console.log('✅ 获取评价列表成功，共', listResult.data.length, '条记录');
        
        // 查找刚添加的评价
        const newReview = listResult.data.find(r => r.id == addResult.data.reviewId);
        if (newReview) {
          console.log('✅ 找到刚添加的评价:', newReview);
        }
      }
      
      // 4. 清理测试数据
      console.log('\n4. 清理测试数据...');
      const deleteResponse = await fetch(`http://localhost:3003/api/admin/work-review/${addResult.data.reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const deleteResult = await deleteResponse.json();
      if (deleteResult.success) {
        console.log('✅ 测试数据清理成功');
      }
      
    } else {
      console.error('❌ 作品评价添加失败:', addResult.error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testReviewAPI();