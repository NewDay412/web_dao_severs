const db = require('./config/db');

async function addTestMessages() {
    try {
        console.log('开始添加测试消息...');
        
        // 添加一些测试用户消息
        const testMessages = [
            { sender_name: 'user1', content: '你好，我想了解天官赐福的故事' },
            { sender_name: 'user2', content: '请问角色介绍在哪里可以找到？' },
            { sender_name: 'user3', content: '这部作品真的很精彩！' },
            { sender_name: 'user1', content: '谢怜和花城的关系是怎样的？' },
            { sender_name: 'admin', content: '欢迎来到天官赐福官方网站！' },
            { sender_name: 'user2', content: '谢谢管理员的回复！' }
        ];
        
        for (const message of testMessages) {
            const [result] = await db.executeOn('web_project',
                'INSERT INTO chat_messages (sender_name, content, create_time) VALUES (?, ?, NOW())',
                [message.sender_name, message.content]
            );
            console.log(`添加消息成功: ${message.sender_name} - ${message.content}`);
        }
        
        console.log('测试消息添加完成！');
        
        // 验证用户列表
        const [users] = await db.executeOn('web_project',
            'SELECT DISTINCT sender_name, MAX(create_time) as last_message_time FROM chat_messages GROUP BY sender_name ORDER BY last_message_time DESC'
        );
        console.log('用户列表:', users);
        
    } catch (error) {
        console.error('添加测试消息失败:', error);
    }
}

addTestMessages().then(() => {
    console.log('操作完成');
    process.exit(0);
}).catch(err => {
    console.error('操作失败:', err);
    process.exit(1);
});