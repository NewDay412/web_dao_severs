// 测试用户消息同步到管理员表功能
const axios = require('axios');

// 创建测试消息
const testMessage = {
    sender_name: 'test_user',
    receiver_name: 'all',
    content: '测试消息同步修复功能' + new Date().getTime()
};

// 测试发送消息
async function testMessageSync() {
    try {
        console.log('发送测试消息...');
        const response = await axios.post('http://localhost:3003/api/user-chat/send', testMessage, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test_token' // 这里使用测试token
            }
        });
        
        console.log('消息发送成功，messageId:', response.data.messageId);
        console.log('\n检查管理员表是否包含该消息...');
        
        // 获取管理员消息
        const adminMessagesResponse = await axios.get('http://localhost:3003/api/admin-chat/messages', {
            headers: {
                'Authorization': 'Bearer admin_token' // 这里使用管理员token
            }
        });
        
        const adminMessages = adminMessagesResponse.data.data;
        
        // 查找测试消息
        let testMessageInAdmin = null;
        if (Array.isArray(adminMessages)) {
            testMessageInAdmin = adminMessages.find(msg => 
                msg.sender_name === testMessage.sender_name && 
                msg.content === testMessage.content
            );
        }
        
        if (testMessageInAdmin) {
            console.log('✅ 测试成功！用户消息已同步到管理员表：');
            console.log('   消息ID:', testMessageInAdmin.id);
            console.log('   发送者:', testMessageInAdmin.sender_name);
            console.log('   内容:', testMessageInAdmin.content);
            console.log('   发送时间:', testMessageInAdmin.create_time);
        } else {
            console.log('❌ 测试失败！用户消息未同步到管理员表');
            console.log('   管理员消息数量:', adminMessages?.length || 0);
            console.log('   最近几条管理员消息:');
            if (Array.isArray(adminMessages)) {
                adminMessages.slice(0, 5).forEach(msg => {
                    console.log(`   - [${msg.sender_name}] ${msg.content}`);
                });
            }
        }
        
    } catch (error) {
        console.error('测试过程中发生错误:', error.message);
        console.error('错误栈:', error.stack);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
            console.error('响应头:', JSON.stringify(error.response.headers, null, 2));
        } else if (error.request) {
            console.error('请求已发送但未收到响应:', error.request);
        }
    }
}

// 运行测试
testMessageSync();
