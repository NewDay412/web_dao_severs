// 测试轮播图API接口的脚本
const fetch = require('node-fetch');

async function testCarouselAPI() {
  try {
    // 1. 登录获取令牌
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

    const loginData = await loginResponse.json();
    console.log('登录响应:', loginData);

    if (!loginData.success) {
      console.error('登录失败:', loginData.message);
      return;
    }

    const token = loginData.data.token;

    // 2. 使用令牌访问轮播图接口
    const carouselResponse = await fetch('http://localhost:3003/api/admin/carousel', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const carouselData = await carouselResponse.json();
    console.log('轮播图接口响应:', carouselData);

    if (carouselResponse.status === 404) {
      console.error('轮播图接口404错误');
    } else if (carouselResponse.status === 200) {
      console.log('轮播图接口正常工作');
    } else {
      console.error('轮播图接口错误:', carouselData.message);
    }

  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

testCarouselAPI();