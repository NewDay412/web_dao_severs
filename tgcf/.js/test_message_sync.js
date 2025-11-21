// 测试用户消息是否同步到管理员表
const axios = require('axios');

// 创建测试消息
const testMessage = {
    sender_name: 'test_user',
    receiver_name: 'all',
    content: '测试消息同步功能'
};

// 测试发送消息
async function testMessageSync() {
    try {
        console.log('发送测试消息...');
        const response = await axios.post('http://localhost:3003/api/user-chat/send', testMessage, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RfdXNlciIsImlhdCI6MTY4NzA2MTQ2NX0.7JZJZJZJZJZJZJZJZJZJZJZJZJZJZJZJZJZJZJZJ'
            }
        });
        
        console.log('消息发送成功，messageId:', response.data.messageId);
        console.log('\n检查管理员表是否包含该消息...');
        
        // 获取管理员消息
        const adminMessages = await axios.get('http://localhost:3003/api/admin-chat/messages', {
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjg3MDYxNDY1fQ.7JZJZJZJZJZJZJZJZJZJZJZJZJZJZJZJZJZJZJZJ'
            }
        });
        
        console.log('管理员消息返回数据:', JSON.stringify(adminMessages.data, null, 2));
        
        // 查找测试消息
        let testMessageInAdmin = null;
        if (Array.isArray(adminMessages.data)) {
            testMessageInAdmin = adminMessages.data.find(msg => 
                msg.sender_name === testMessage.sender_name && 
                msg.content === testMessage.content
            );
        } else if (adminMessages.data.messages && Array.isArray(adminMessages.data.messages)) {
            testMessageInAdmin = adminMessages.data.messages.find(msg => 
                msg.sender_name === testMessage.sender_name && 
                msg.content === testMessage.content
            );
        } else if (adminMessages.data.success && Array.isArray(adminMessages.data.data)) {
            testMessageInAdmin = adminMessages.data.data.find(msg => 
                msg.sender_name === testMessage.sender_name && 
                msg.content === testMessage.content
            );
        }
        
        if (testMessageInAdmin) {
            console.log('✅ 测试成功！消息已同步到管理员表。');
            console.log('同步的消息信息:', testMessageInAdmin);
        } else {
            console.log('❌ 测试失败！消息未同步到管理员表。');
        }
        
    } catch (error) {
        console.error('测试失败:', error.message);
        if (error.response) {
            console.error('响应数据:', error.response.data);
        }
    }
}

testMessageSync();