// 测试轮播图API的Node.js脚本
const fetch = require('node-fetch');

async function testCarouselAPI() {
    try {
        console.log('=== 开始测试轮播图API ===');
        
        // 登录获取令牌
        console.log('1. 正在登录获取令牌...');
        const loginResponse = await fetch('http://localhost:3003/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        
        const loginData = await loginResponse.json();
        console.log('登录响应:', loginData);
        
        if (!loginData.success) {
            throw new Error('登录失败: ' + (loginData.error || loginData.message));
        }
        
        const token = loginData.data?.token || loginData.token;
        if (!token) {
            throw new Error('未获取到令牌');
        }
        
        console.log('获取到令牌:', token);
        
        // 测试轮播图API
        console.log('2. 正在调用轮播图API...');
        const carouselResponse = await fetch('http://localhost:3003/api/admin/carousel', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        console.log('轮播图API响应状态:', carouselResponse.status);
        
        const carouselData = await carouselResponse.json();
        console.log('轮播图API响应:', carouselData);
        
        console.log('=== 测试完成 ===');
        
    } catch (error) {
        console.error('测试失败:', error);
        process.exit(1);
    }
}

testCarouselAPI();