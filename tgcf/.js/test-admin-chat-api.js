const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3003';

async function testAdminChatAPI() {
    try {
        console.log('开始测试管理员聊天API...');
        
        // 1. 测试管理员登录
        console.log('\n1. 测试管理员登录...');
        const loginResponse = await fetch(`${BASE_URL}/api/admin/login`, {
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
            throw new Error('管理员登录失败');
        }
        
        const token = loginResult.data.token;
        console.log('获取到token:', token);
        
        // 2. 测试获取用户列表
        console.log('\n2. 测试获取用户列表...');
        const usersResponse = await fetch(`${BASE_URL}/api/admin-chat/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const usersResult = await usersResponse.json();
        console.log('用户列表结果:', usersResult);
        
        // 3. 测试获取所有消息
        console.log('\n3. 测试获取所有消息...');
        const messagesResponse = await fetch(`${BASE_URL}/api/admin-chat/messages`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const messagesResult = await messagesResponse.json();
        console.log('消息列表结果:', messagesResult);
        
        // 4. 如果有用户，测试获取特定用户的消息
        if (usersResult.success && usersResult.data.length > 0) {
            const firstUser = usersResult.data[0];
            console.log(`\n4. 测试获取用户 ${firstUser.username} 的消息...`);
            
            const userMessagesResponse = await fetch(`${BASE_URL}/api/admin-chat/messages/${firstUser.username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const userMessagesResult = await userMessagesResponse.json();
            console.log('用户消息结果:', userMessagesResult);
        }
        
        // 5. 测试发送消息
        console.log('\n5. 测试发送消息...');
        const sendResponse = await fetch(`${BASE_URL}/api/admin-chat/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                sender_name: 'admin',
                receiver_name: 'test_user',
                content: '这是一条测试消息'
            })
        });
        
        const sendResult = await sendResponse.json();
        console.log('发送消息结果:', sendResult);
        
        console.log('\n✅ 所有API测试完成！');
        
    } catch (error) {
        console.error('❌ API测试失败:', error);
    }
}

// 检查服务器是否运行
async function checkServer() {
    try {
        const response = await fetch(`${BASE_URL}/health`);
        const result = await response.json();
        console.log('服务器状态:', result);
        return true;
    } catch (error) {
        console.error('服务器未运行，请先启动服务器:', error.message);
        return false;
    }
}

async function main() {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await testAdminChatAPI();
    }
}

main();