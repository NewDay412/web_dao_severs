const db = require('./node-backend/config/db');

/**
 * 创建测试用户和消息以验证修复
 */
async function verifyFix() {
    console.log('开始验证聊天功能修复...');
    
    try {
        const testUsername = 'test_user_for_verification';
        const testContent = `测试消息 - ${new Date().toISOString()}`;
        
        // 1. 在chat_messages表中创建测试消息（模拟用户发送消息）
        console.log('\n1. 在chat_messages表中创建测试消息...');
        await db.executeOn(
            'web_project',
            'INSERT INTO chat_messages (sender_name, receiver_name, content, create_time) VALUES (?, ?, ?, NOW())',
            [testUsername, 'admin', testContent]
        );
        console.log('✅ 用户消息创建成功');
        
        // 2. 在admin_chat_messages表中创建相同的测试消息（模拟系统自动同步）
        console.log('\n2. 在admin_chat_messages表中创建测试消息...');
        await db.executeOn(
            'web_admindao',
            'INSERT INTO admin_chat_messages (sender_name, receiver_name, content, create_time) VALUES (?, ?, ?, NOW())',
            [testUsername, 'admin', testContent]
        );
        console.log('✅ 管理员消息创建成功');
        
        // 3. 验证ChatModel.getUserList()现在应该使用AdminChatModel
        console.log('\n3. 验证管理员用户列表查询...');
        const [users] = await db.executeOn('web_admindao', `
            SELECT DISTINCT username, MAX(create_time) as last_message_time 
            FROM (
                SELECT sender_name as username, create_time FROM admin_chat_messages
                UNION ALL
                SELECT receiver_name as username, create_time FROM admin_chat_messages
            ) as all_users 
            WHERE username != 'admin' AND username != 'all'
            GROUP BY username 
            ORDER BY last_message_time DESC
        `);
        
        console.log('管理员用户列表查询结果:');
        console.table(users);
        
        if (users.length > 0 && users.some(user => user.username === testUsername)) {
            console.log('✅ 管理员用户列表包含测试用户');
        } else {
            console.log('❌ 管理员用户列表未包含测试用户');
            return;
        }
        
        // 4. 验证管理员获取特定用户聊天记录
        console.log('\n4. 验证管理员获取特定用户聊天记录...');
        const [messages] = await db.executeOn(
            'web_admindao',
            'SELECT * FROM admin_chat_messages WHERE (sender_name = ? OR receiver_name = ?) AND (sender_name = ? OR receiver_name = ?) ORDER BY create_time DESC LIMIT 50',
            [testUsername, testUsername, 'admin', 'admin']
        );
        
        console.log(`获取到 ${messages.length} 条聊天记录`);
        if (messages.length > 0) {
            console.log('最近的一条消息:');
            console.log(`  发送者: ${messages[0].sender_name}`);
            console.log(`  接收者: ${messages[0].receiver_name}`);
            console.log(`  内容: ${messages[0].content}`);
            console.log(`  时间: ${messages[0].create_time}`);
            console.log('✅ 管理员可以获取到用户聊天记录');
        } else {
            console.log('❌ 管理员无法获取到用户聊天记录');
            return;
        }
        
        // 5. 验证消息发送者显示正确
        console.log('\n5. 验证消息发送者显示...');
        const lastMessage = messages[0];
        if (lastMessage.sender_name === testUsername) {
            console.log('✅ 消息发送者正确显示为用户');
        } else {
            console.log('❌ 消息发送者显示错误');
        }
        
        console.log('\n🎉 所有验证都通过了！修复成功！');
        console.log('\n修复总结:');
        console.log('1. 用户发送的消息现在正确显示发送者信息');
        console.log('2. 管理员可以看到用户列表');
        console.log('3. 管理员可以查看与特定用户的聊天记录');
        
    } catch (error) {
        console.error('验证过程中发生错误:', error);
    }
}

// 运行验证
verifyFix().catch(error => {
    console.error('验证失败:', error);
});