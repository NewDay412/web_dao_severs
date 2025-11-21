const db = require('./node-backend/config/db');

async function testChatData() {
    try {
        console.log('数据库连接成功');
        
        // 查询聊天消息表结构
        console.log('\n--- 聊天消息表结构 ---');
        const [tableInfo] = await db.executeOn('web_project', 'DESCRIBE chat_messages');
        console.table(tableInfo);
        
        // 查询所有聊天消息
        console.log('\n--- 所有聊天消息 ---');
        const [messages] = await db.executeOn('web_project', 'SELECT * FROM chat_messages ORDER BY create_time DESC');
        console.table(messages);
        
        // 查询用户列表
        console.log('\n--- 用户列表 ---');
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
        
    } catch (error) {
        console.error('查询失败:', error);
    }
}

testChatData();
