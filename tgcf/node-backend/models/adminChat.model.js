const db = require('../config/db');

class AdminChatModel {
    // 发送消息
    static async sendMessage(data, fromSync = false) {
        const { sender_name, receiver_name = 'all', content, image_url, video_url } = data;
        
        // 1. 保存到管理员聊天表
        const [result] = await db.executeOn('web_admindao',
            'INSERT INTO admin_chat_messages (sender_name, receiver_name, content, image_url, video_url, create_time) VALUES (?, ?, ?, ?, ?, NOW())',
            [sender_name, receiver_name, content || '', image_url || null, video_url || null]
        );
        
        // 2. 如果是管理员发送的消息且不是来自同步，同步到用户聊天表
        if (sender_name === 'admin' && !fromSync) {
            try {
                const UserChatModel = require('./userChat.model');
                await UserChatModel.sendMessage(data, true);
            } catch (error) {
                console.error('同步管理员消息到用户表失败:', error);
                // 同步失败不影响主流程，但需要记录错误
            }
        }
        
        // 3. 如果是用户发送的消息且不是来自同步，也要同步到用户聊天表
        if (sender_name !== 'admin' && !fromSync) {
            try {
                const UserChatModel = require('./userChat.model');
                await UserChatModel.sendMessage(data, true);
            } catch (error) {
                console.error('同步用户消息到用户表失败:', error);
            }
        }
        
        return result.insertId;
    }

    // 获取聊天记录
    static async getMessages(limit = 50) {
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 50)); // 限制在1-100之间
        try {
            let allMessages = [];
            
            // 1. 从管理员聊天表获取消息
            try {
                const sql1 = `SELECT * FROM admin_chat_messages ORDER BY create_time DESC LIMIT ${limitNum}`;
                const [adminRows] = await db.executeOn('web_admindao', sql1);
                allMessages = allMessages.concat(adminRows);
            } catch (error) {
                console.log('管理员聊天表查询失败:', error);
            }
            
            // 2. 从用户聊天表获取消息
            try {
                const sql2 = `SELECT * FROM user_chat_messages ORDER BY create_time DESC LIMIT ${limitNum}`;
                const [userRows] = await db.executeOn('web_userdao', sql2);
                allMessages = allMessages.concat(userRows);
            } catch (error) {
                console.log('用户聊天表查询失败或不存在:', error);
            }
            
            // 3. 去重并按时间排序
            const messageMap = new Map();
            allMessages.forEach(msg => {
                const key = `${msg.sender_name}-${msg.content}-${msg.create_time}`;
                if (!messageMap.has(key)) {
                    messageMap.set(key, msg);
                }
            });
            
            const uniqueMessages = Array.from(messageMap.values())
                .sort((a, b) => new Date(b.create_time) - new Date(a.create_time))
                .slice(0, limitNum)
                .reverse();
            
            return uniqueMessages;
        } catch (error) {
            console.error('获取管理员聊天记录失败:', error);
            throw error;
        }
    }

    // 获取用户列表
    static async getUserList() {
        try {
            const userMap = new Map();
            
            // 1. 从管理员聊天表获取发送过消息的用户（排除admin）
            try {
                const [adminChatRows] = await db.executeOn('web_admindao',
                    'SELECT DISTINCT sender_name, MAX(create_time) as last_message_time FROM admin_chat_messages WHERE sender_name != ? GROUP BY sender_name ORDER BY last_message_time DESC',
                    ['admin']
                );
                
                adminChatRows.forEach(row => {
                    userMap.set(row.sender_name, {
                        username: row.sender_name,
                        last_message_time: row.last_message_time
                    });
                });
            } catch (error) {
                console.log('管理员聊天表查询失败:', error);
            }
            
            // 2. 从用户聊天表获取发送过消息的用户（排除admin）
            try {
                const [userRows] = await db.executeOn('web_userdao',
                    'SELECT DISTINCT sender_name, MAX(create_time) as last_message_time FROM user_chat_messages WHERE sender_name != ? GROUP BY sender_name ORDER BY last_message_time DESC',
                    ['admin']
                );
                
                userRows.forEach(row => {
                    const existing = userMap.get(row.sender_name);
                    if (!existing || new Date(row.last_message_time) > new Date(existing.last_message_time)) {
                        userMap.set(row.sender_name, {
                            username: row.sender_name,
                            last_message_time: row.last_message_time
                        });
                    }
                });
            } catch (error) {
                console.log('用户聊天表不存在或查询失败，跳过用户聊天数据');
            }
            
            // 3. 从管理员聊天表获取接收者（排除admin和all）
            try {
                const [receiverRows] = await db.executeOn('web_admindao',
                    'SELECT DISTINCT receiver_name as username, MAX(create_time) as last_message_time FROM admin_chat_messages WHERE receiver_name != ? AND receiver_name != ? GROUP BY receiver_name ORDER BY last_message_time DESC',
                    ['admin', 'all']
                );
                
                receiverRows.forEach(row => {
                    if (!userMap.has(row.username)) {
                        userMap.set(row.username, {
                            username: row.username,
                            last_message_time: row.last_message_time
                        });
                    }
                });
            } catch (error) {
                console.log('获取接收者列表失败:', error);
            }
            
            // 4. 如果没有用户，返回示例用户
            if (userMap.size === 0) {
                console.log('没有找到聊天用户，返回示例用户');
                return [
                    { username: 'test_user', last_message_time: new Date().toISOString().slice(0, 19).replace('T', ' ') },
                    { username: 'demo_user', last_message_time: new Date(Date.now() - 3600000).toISOString().slice(0, 19).replace('T', ' ') },
                    { username: 'fan_user', last_message_time: new Date(Date.now() - 7200000).toISOString().slice(0, 19).replace('T', ' ') }
                ];
            }
            
            // 5. 转换为数组并按时间排序
            const users = Array.from(userMap.values()).sort((a, b) => 
                new Date(b.last_message_time) - new Date(a.last_message_time)
            );
            
            console.log('获取到的用户列表:', users);
            return users;
            
        } catch (error) {
            console.error('获取用户列表失败:', error);
            // 返回示例用户数据
            return [
                { username: 'test_user', last_message_time: new Date().toISOString().slice(0, 19).replace('T', ' ') },
                { username: 'demo_user', last_message_time: new Date(Date.now() - 3600000).toISOString().slice(0, 19).replace('T', ' ') },
                { username: 'fan_user', last_message_time: new Date(Date.now() - 7200000).toISOString().slice(0, 19).replace('T', ' ') }
            ];
        }
    }

    // 获取与特定用户的聊天记录
    static async getMessagesWithUser(username, limit = 50) {
        // 验证username参数
        if (!username || username === 'undefined') {
            throw new Error('用户名参数不能为空');
        }
        
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 50));
        console.log(`获取用户 ${username} 的聊天记录，限制: ${limitNum}`);
        
        try {
            let allMessages = [];
            
            // 1. 从管理员聊天表获取消息
            try {
                // 获取与该用户相关的所有消息：
                // 1. 用户发送给admin的消息
                // 2. admin发送给用户的消息
                // 3. admin发送给所有人的消息
                const sql1 = `
                    SELECT * FROM admin_chat_messages 
                    WHERE 
                        (sender_name = ? AND receiver_name = 'admin') OR 
                        (sender_name = 'admin' AND (receiver_name = ? OR receiver_name = 'all'))
                    ORDER BY create_time ASC
                `;
                const [adminRows] = await db.executeOn('web_admindao', sql1, [username, username]);
                console.log(`从管理员表获取到 ${adminRows.length} 条消息`);
                allMessages = allMessages.concat(adminRows);
            } catch (error) {
                console.log('管理员聊天表查询失败:', error);
            }
            
            // 2. 从用户聊天表获取消息
            try {
                const sql2 = `
                    SELECT * FROM user_chat_messages 
                    WHERE 
                        (sender_name = ? AND receiver_name = 'admin') OR 
                        (sender_name = 'admin' AND (receiver_name = ? OR receiver_name = 'all'))
                    ORDER BY create_time ASC
                `;
                const [userRows] = await db.executeOn('web_userdao', sql2, [username, username]);
                console.log(`从用户表获取到 ${userRows.length} 条消息`);
                allMessages = allMessages.concat(userRows);
            } catch (error) {
                console.log('用户聊天表查询失败或不存在:', error);
            }
            
            // 3. 去重并按时间排序
            const messageMap = new Map();
            allMessages.forEach(msg => {
                // 使用更精确的去重键
                const key = `${msg.sender_name}-${msg.receiver_name}-${msg.content}-${new Date(msg.create_time).getTime()}`;
                if (!messageMap.has(key)) {
                    messageMap.set(key, msg);
                }
            });
            
            let uniqueMessages = Array.from(messageMap.values())
                .sort((a, b) => new Date(a.create_time) - new Date(b.create_time));
            
            // 只保留最近的消息
            if (uniqueMessages.length > limitNum) {
                uniqueMessages = uniqueMessages.slice(-limitNum);
            }
            
            console.log(`最终返回 ${uniqueMessages.length} 条消息`);
            
            // 4. 如果没有消息，返回欢迎消息
            if (uniqueMessages.length === 0) {
                console.log('没有找到消息，返回欢迎消息');
                return [{
                    id: 0,
                    sender_name: 'admin',
                    receiver_name: username,
                    content: `欢迎 ${username}！有什么问题可以随时联系我。`,
                    image_url: null,
                    video_url: null,
                    create_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
                }];
            }
            
            return uniqueMessages;
        } catch (error) {
            console.error('获取管理员特定聊天记录失败:', error);
            // 返回默认欢迎消息
            return [{
                id: 0,
                sender_name: 'admin',
                receiver_name: username,
                content: `欢迎 ${username}！有什么问题可以随时联系我。`,
                image_url: null,
                video_url: null,
                create_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
            }];
        }
    }

    // 创建表
    static async createTable() {
        await db.executeOn('web_admindao', 'DROP TABLE IF EXISTS admin_chat_messages');
        await db.executeOn('web_admindao', `CREATE TABLE admin_chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_name VARCHAR(100) NOT NULL,
                receiver_name VARCHAR(100) NOT NULL DEFAULT 'all',
                content TEXT,
                image_url VARCHAR(500),
                video_url VARCHAR(500),
                create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);
    }
    
    // 初始化示例数据
    static async initSampleData() {
        try {
            // 检查是否已有数据
            const [existingRows] = await db.executeOn('web_admindao', 'SELECT COUNT(*) as count FROM admin_chat_messages');
            if (existingRows[0].count > 0) {
                return; // 已有数据，不需要初始化
            }
            
            // 插入示例聊天数据
            const sampleMessages = [
                {
                    sender_name: 'test_user',
                    receiver_name: 'admin',
                    content: '你好，我想了解一下天官赐福的剧情'
                },
                {
                    sender_name: 'admin',
                    receiver_name: 'test_user',
                    content: '你好！天官赐福讲述了谢怜和花城的仙侠爱情故事，非常精彩呢！'
                },
                {
                    sender_name: 'demo_user',
                    receiver_name: 'admin',
                    content: '花城真的太帅了！'
                },
                {
                    sender_name: 'admin',
                    receiver_name: 'demo_user',
                    content: '是的！花城的角色设计确实很棒，深受读者喜爱。'
                }
            ];
            
            for (const msg of sampleMessages) {
                await db.executeOn('web_admindao',
                    'INSERT INTO admin_chat_messages (sender_name, receiver_name, content) VALUES (?, ?, ?)',
                    [msg.sender_name, msg.receiver_name, msg.content]
                );
            }
            
            console.log('管理员聊天示例数据初始化完成');
        } catch (error) {
            console.error('初始化管理员聊天示例数据失败:', error);
        }
    }
}

module.exports = AdminChatModel;

// 自动初始化示例数据
setTimeout(() => {
    AdminChatModel.initSampleData().catch(console.error);
}, 1000);