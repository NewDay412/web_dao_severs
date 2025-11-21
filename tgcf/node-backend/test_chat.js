const AdminChatModel = require('./models/adminChat.model');
const UserChatModel = require('./models/userChat.model');

// 测试函数
async function testChatSync() {
    console.log('=== 开始测试聊天消息同步功能 ===');
    
    try {
        // 1. 测试用户发送消息
        console.log('\n1. 测试用户发送消息...');
        const userMsg = await UserChatModel.sendMessage({
            sender_name: 'test_user',
            content: '测试用户消息同步',
            receiver_name: 'all'
        });
        console.log(`   ✅ 用户消息发送成功，ID: ${userMsg}`);
        
        // 2. 测试管理员发送消息
        console.log('\n2. 测试管理员发送消息...');
        const adminMsg = await AdminChatModel.sendMessage({
            sender_name: 'admin',
            content: '测试管理员消息同步',
            receiver_name: 'all'
        });
        console.log(`   ✅ 管理员消息发送成功，ID: ${adminMsg}`);
        
        // 3. 验证用户表和管理员表是否都有这些消息
        console.log('\n3. 验证消息同步...');
        
        // 获取用户表中的消息
        const userMessages = await UserChatModel.getMessages(10);
        console.log(`   📋 用户表中最新10条消息: ${userMessages.length}条`);
        
        // 获取管理员表中的消息
        const adminMessages = await AdminChatModel.getMessages(10);
        console.log(`   📋 管理员表中最新10条消息: ${adminMessages.length}条`);
        
        // 检查是否包含刚才发送的两条消息
        const hasUserMsg = userMessages.some(msg => msg.content === '测试用户消息同步');
        const hasAdminMsg = userMessages.some(msg => msg.content === '测试管理员消息同步');
        const hasUserMsgInAdmin = adminMessages.some(msg => msg.content === '测试用户消息同步');
        const hasAdminMsgInAdmin = adminMessages.some(msg => msg.content === '测试管理员消息同步');
        
        if (hasUserMsg && hasAdminMsg) {
            console.log('   ✅ 用户表包含所有测试消息');
        } else {
            console.log('   ❌ 用户表缺少测试消息');
        }
        
        if (hasUserMsgInAdmin && hasAdminMsgInAdmin) {
            console.log('   ✅ 管理员表包含所有测试消息');
        } else {
            console.log('   ❌ 管理员表缺少测试消息');
        }
        
        console.log('\n=== 测试完成 ===');
        
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

// 运行测试
testChatSync();
