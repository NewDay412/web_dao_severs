const fetch = require('node-fetch');

async function testReviewAdd() {
  try {
    console.log('=== 测试作品评价添加功能 ===');
    
    // 1. 登录获取token
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
    if (!loginResult.success) {
      throw new Error('登录失败: ' + loginResult.error);
    }
    
    const token = loginResult.data.token;
    console.log('✅ 登录成功');
    
    // 2. 测试添加作品评价
    console.log('\n2. 测试添加作品评价...');
    const reviewData = {
      username: '测试读者',
      rating: 5,
      content: '天官赐福真的是一部非常精彩的作品！谢怜和花城的故事让人感动，剧情跌宕起伏，人物刻画生动。强烈推荐！',
      tags: '剧情精彩,人物生动,情感丰富',
      status: 'approved'
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
    
    console.log('响应状态:', addResponse.status);
    const addResult = await addResponse.json();
    console.log('添加结果:', addResult);
    
    if (addResult.success) {
      console.log('✅ 作品评价添加成功！ID:', addResult.data.reviewId);
      
      // 3. 验证数据是否正确插入
      console.log('\n3. 验证数据插入...');
      const listResponse = await fetch('http://localhost:3003/api/admin/work-review', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const listResult = await listResponse.json();
      if (listResult.success) {
        const newReview = listResult.data.find(r => r.id == addResult.data.reviewId);
        if (newReview) {
          console.log('✅ 验证成功，找到新添加的评价:');
          console.log('- 用户名:', newReview.username);
          console.log('- 评分:', newReview.rating);
          console.log('- 内容:', newReview.content.substring(0, 50) + '...');
          console.log('- 标签:', newReview.tags);
          console.log('- 状态:', newReview.status);
        } else {
          console.log('❌ 未找到新添加的评价');
        }
      }
      
    } else {
      console.error('❌ 作品评价添加失败:', addResult.error);
      console.error('详细错误信息:', addResult);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testReviewAdd();