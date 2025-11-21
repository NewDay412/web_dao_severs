const db = require('./node-backend/config/db');

async function createTestUser() {
    try {
        // 1. 创建测试用户
        const username = 'test_user';
        const sex = 'male';
        
        console.log('创建测试用户...');
        
        // 检查用户名是否已存在
        const [existing] = await db.executeOn(
            'web_userdao',
            'SELECT id FROM users WHERE username = ?',
            [username]
        );
        
        let userId;
        if (existing.length > 0) {
            userId = existing[0].id;
            console.log(`用户 ${username} 已存在，使用现有用户`);
        } else {
            // 插入新用户（使用简单密码，仅用于测试）
            const [result] = await db.executeOn(
                'web_userdao',
                'INSERT INTO users (username, password, sex, create_time) VALUES (?, ?, ?, NOW())',
                [username, 'test123', sex]
            );
            
            userId = result.insertId;
            console.log(`用户 ${username} 创建成功，ID: ${userId}`);
        }
        
        // 2. 发送测试消息
        console.log('\n发送测试消息...');
        
        const [messageResult] = await db.executeOn(
            'web_project',
            'INSERT INTO chat_messages (sender_name, receiver_name, content, create_time) VALUES (?, ?, ?, NOW())',
            [username, 'admin', '这是一条测试消息，用于验证用户列表功能']
        );
        
        console.log(`测试消息发送成功，ID: ${messageResult.insertId}`);
        
        // 3. 再次检查用户列表
        console.log('\n--- 更新后的用户列表 ---');
        const [users] = await db.executeOn('web_project', `
            SELECT DISTINCT username, MAX(create_time) as last_message_time 
            FROM (
                SELECT sender_name as username, create_time FROM chat_messages
                UNION ALL
                SELECT receiver_name as username, create_time FROM chat_messages
            ) as all_users 
            WHERE username != 'admin' AND username != 'all'
            GROUP BY username 
            ORDER BY last_message_time DESC
        `);
        
        console.table(users);
        
        if (users.length > 0) {
            console.log('\n✅ 管理员界面现在应该能显示用户列表了！');
        } else {
            console.log('\n❌ 用户列表仍然为空，请检查代码逻辑');
        }
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

createTestUser();
