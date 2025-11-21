const UserChatModel = require('./models/userChat.model');
const AdminChatModel = require('./models/adminChat.model');

async function testSeparatedChat() {
    try {
        console.log('开始测试分离的聊天功能...');
        
        // 测试用户聊天
        console.log('\n=== 测试用户聊天 ===');
        const userMessageId = await UserChatModel.sendMessage({
            sender_name: 'user1',
            receiver_name: 'all',
            content: '这是用户聊天测试消息'
        });
        console.log('✅ 用户消息发送成功，ID:', userMessageId);
        
        const userMessages = await UserChatModel.getMessages(10);
        console.log('✅ 用户聊天记录:', userMessages.length, '条');
        
        // 测试管理员聊天
        console.log('\n=== 测试管理员聊天 ===');
        const adminMessageId = await AdminChatModel.sendMessage({
            sender_name: 'admin',
            receiver_name: 'all',
            content: '这是管理员聊天测试消息'
        });
        console.log('✅ 管理员消息发送成功，ID:', adminMessageId);
        
        const adminMessages = await AdminChatModel.getMessages(10);
        console.log('✅ 管理员聊天记录:', adminMessages.length, '条');
        
        const userList = await AdminChatModel.getUserList();
        console.log('✅ 用户列表:', userList.length, '个用户');
        
        console.log('\n✅ 分离的聊天功能测试完成');
        process.exit(0);
    } catch (error) {
        console.error('❌ 测试失败:', error);
        process.exit(1);
    }
}

// 运行测试
testSeparatedChat();