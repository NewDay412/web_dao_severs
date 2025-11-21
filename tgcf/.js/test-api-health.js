const fetch = require('node-fetch');

async function testAPI() {
    try {
        console.log('🔍 测试API健康状态...');
        
        // 测试健康检查
        const healthResponse = await fetch('http://localhost:3003/health');
        const healthData = await healthResponse.json();
        console.log('✅ 健康检查:', healthData);
        
        // 测试留言提交
        console.log('\n🧪 测试留言提交API...');
        const testData = {
            username: '测试用户',
            email: 'test@example.com',
            phone: '13800138000',
            content: '这是一条测试留言'
        };
        
        const response = await fetch('http://localhost:3003/api/user/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📊 响应状态:', response.status);
        console.log('📋 响应头:', Object.fromEntries(response.headers.entries()));
        
        const result = await response.json();
        console.log('📝 响应结果:', result);
        
        // 测试获取留言
        console.log('\n📖 测试获取留言API...');
        const getResponse = await fetch('http://localhost:3003/api/user/message');
        const getResult = await getResponse.json();
        console.log('📊 获取留言状态:', getResponse.status);
        console.log('📝 留言数量:', getResult.data ? getResult.data.length : 0);
        
    } catch (error) {
        console.error('❌ API测试失败:', error);
    }
}

testAPI();