const axios = require('axios');

// 测试管理员回复消息同步功能
async function testAdminReplySync() {
    try {
        console.log('开始测试管理员回复消息同步功能...');
        
        // 1. 准备测试数据
        const testUser = 'test_user';
        const adminMessage = {
            sender_name: 'admin',
            receiver_name: testUser,
            content: '这是管理员的回复消息测试'
        };
        
        // 2. 调用管理员发送消息接口
        console.log('\n1. 管理员发送回复消息...');
        const adminSendResponse = await axios.post('http://localhost:3003/api/admin-chat/send', adminMessage, {
            headers: {
                'Authorization': 'Bearer admin_token'
            }
        });
        console.log('管理员发送消息成功:', adminSendResponse.data);
        
        // 3. 检查用户聊天表中是否能获取到管理员的回复
        console.log('\n2. 检查用户聊天表是否包含管理员回复...');
        const userMessagesResponse = await axios.get(`http://localhost:3003/api/user-chat/messages/${testUser}`, {
            headers: {
                'Authorization': 'Bearer dummy_token'
            }
        });
        
        console.log('用户聊天表中的消息总数:', userMessagesResponse.data.data.length);
        
        // 4. 查找管理员回复
        const adminReplies = userMessagesResponse.data.data.filter(msg => 
            msg.sender_name === 'admin' && msg.content === adminMessage.content
        );
        
        if (adminReplies.length > 0) {
            console.log('✅ 测试成功: 管理员回复已成功同步到用户聊天表');
            console.log('同步的消息:', adminReplies[0]);
        } else {
            console.log('❌ 测试失败: 用户聊天表中未找到管理员回复');
            console.log('所有消息:', userMessagesResponse.data.data);
        }
        
        // 5. 检查管理员聊天表中是否包含该消息
        console.log('\n3. 验证管理员聊天表...');
        const adminMessagesResponse = await axios.get('http://localhost:3003/api/admin-chat/messages', {
            headers: {
                'Authorization': 'Bearer admin_token'
            }
        });
        
        const adminMessageInAdminTable = adminMessagesResponse.data.data.find(msg => 
            msg.sender_name === 'admin' && msg.content === adminMessage.content
        );
        
        if (adminMessageInAdminTable) {
            console.log('✅ 管理员消息也正确保存在管理员聊天表中');
        } else {
            console.log('❌ 管理员消息未保存在管理员聊天表中');
        }
        
    } catch (error) {
        console.error('测试过程中发生错误:', error);
        if (error.response) {
            console.error('响应数据:', error.response.data);
            console.error('响应状态:', error.response.status);
        }
    }
}

// 执行测试
testAdminReplySync();