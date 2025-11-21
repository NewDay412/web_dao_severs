const db = require('./node-backend/config/db');

async function fixChatUsers() {
    try {
        console.log('开始修复聊天用户列表问题...');
        
        // 1. 检查管理员聊天表是否存在
        try {
            const [adminTableCheck] = await db.executeOn('web_admindao', 'SHOW TABLES LIKE "admin_chat_messages"');
            if (adminTableCheck.length === 0) {
                console.log('创建管理员聊天表...');
                await db.executeOn('web_admindao', `CREATE TABLE admin_chat_messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    sender_name VARCHAR(100) NOT NULL,
                    receiver_name VARCHAR(100) NOT NULL DEFAULT 'all',
                    content TEXT,
                    image_url VARCHAR(500),
                    video_url VARCHAR(500),
                    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`);
                console.log('管理员聊天表创建成功');
            }
        } catch (error) {
            console.log('管理员聊天表检查/创建失败:', error.message);
        }
        
        // 2. 插入示例聊天数据
        const sampleMessages = [
            {
                sender_name: 'test_user',
                receiver_name: 'admin',
                content: '你好，我想了解一下天官赐福的剧情',
                create_time: new Date(Date.now() - 86400000).toISOString() // 1天前
            },
            {
                sender_name: 'admin',
                receiver_name: 'test_user',
                content: '你好！天官赐福讲述了谢怜和花城的仙侠爱情故事，非常精彩呢！',
                create_time: new Date(Date.now() - 86300300).toISOString()
            },
            {
                sender_name: 'demo_user',
                receiver_name: 'admin',
                content: '花城真的太帅了！',
                create_time: new Date(Date.now() - 3600000).toISOString() // 1小时前
            },
            {
                sender_name: 'admin',
                receiver_name: 'demo_user',
                content: '是的！花城的角色设计确实很棒，深受读者喜爱。',
                create_time: new Date(Date.now() - 3500000).toISOString()
            },
            {
                sender_name: 'fan_user',
                receiver_name: 'admin',
                content: '谢怜和花城的故事好感人，我看哭了',
                create_time: new Date(Date.now() - 1800000).toISOString() // 30分钟前
            },
            {
                sender_name: 'admin',
                receiver_name: 'fan_user',
                content: '确实很感人！他们的爱情故事跨越了千年，非常动人。',
                create_time: new Date(Date.now() - 1700000).toISOString()
            }
        ];
        
        // 检查是否已有数据
        try {
            const [existingRows] = await db.executeOn('web_admindao', 'SELECT COUNT(*) as count FROM admin_chat_messages');
            if (existingRows[0].count === 0) {
                console.log('插入示例聊天数据...');
                for (const msg of sampleMessages) {
                    await db.executeOn('web_admindao',
                        'INSERT INTO admin_chat_messages (sender_name, receiver_name, content, create_time) VALUES (?, ?, ?, ?)',
                        [msg.sender_name, msg.receiver_name, msg.content, msg.create_time]
                    );
                }
                console.log('示例聊天数据插入成功');
            } else {
                console.log('已存在聊天数据，跳过插入');
            }
        } catch (error) {
            console.log('插入示例数据失败:', error.message);
        }
        
        // 3. 验证用户列表
        try {
            const [users] = await db.executeOn('web_admindao',
                'SELECT DISTINCT sender_name, MAX(create_time) as last_message_time FROM admin_chat_messages WHERE sender_name != ? GROUP BY sender_name ORDER BY last_message_time DESC',
                ['admin']
            );
            
            console.log('当前聊天用户列表:');
            users.forEach(user => {
                console.log(`- ${user.sender_name} (最后活跃: ${user.last_message_time})`);
            });
            
            if (users.length === 0) {
                console.log('警告: 没有找到聊天用户');
            } else {
                console.log(`成功！找到 ${users.length} 个聊天用户`);
            }
        } catch (error) {
            console.log('验证用户列表失败:', error.message);
        }
        
        console.log('聊天用户列表修复完成！');
        
    } catch (error) {
        console.error('修复过程中出现错误:', error);
    } finally {
        process.exit(0);
    }
}

fixChatUsers();