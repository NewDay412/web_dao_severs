const db = require('../config/db');

class ChatModel {
    // 发送消息
    static async sendMessage(data) {
        const { sender_name, receiver_name, content, image_url, video_url } = data;
        const [result] = await db.executeOn('web_project',
            'INSERT INTO chat_messages (sender_name, receiver_name, content, image_url, video_url, create_time) VALUES (?, ?, ?, ?, ?, NOW())',
            [sender_name, receiver_name || 'all', content || '', image_url || null, video_url || null]
        );
        return result.insertId;
    }

    // 获取聊天记录
    static async getMessages(limit = 50) {
        // 确保limit参数是数字类型
        const limitNum = parseInt(limit);
        // 直接使用字符串插值而不是参数化查询
        const [rows] = await db.executeOn('web_project',
            `SELECT * FROM chat_messages ORDER BY create_time DESC LIMIT ${limitNum}`
        );
        return rows.reverse();
    }

    // 获取用户列表
    static async getUserList() {
        const [rows] = await db.executeOn('web_project',
            `SELECT DISTINCT username, MAX(create_time) as last_message_time 
             FROM (
                 SELECT sender_name as username, create_time FROM chat_messages
                 UNION ALL
                 SELECT receiver_name as username, create_time FROM chat_messages
             ) as all_users 
             WHERE username != 'admin' AND username != 'all'
             GROUP BY username 
             ORDER BY last_message_time DESC`
        );
        return rows;
    }

    // 获取与特定用户的聊天记录
    static async getMessagesWithUser(username, limit = 50) {
        // 确保limit参数是数字类型
        const limitNum = parseInt(limit);
        // 直接使用字符串插值而不是参数化查询，避免LIMIT参数问题
        // 查询发送给该用户或由该用户发送的消息
        const [rows] = await db.executeOn('web_project',
            `SELECT * FROM chat_messages WHERE (sender_name = ? OR receiver_name = ?) ORDER BY create_time DESC LIMIT ${limitNum}`,
            [username, username]
        );
        return rows.reverse();
    }

    // 创建表
    static async createTable() {
        // 先删除旧表（如果存在）
        await db.executeOn('web_project', 'DROP TABLE IF EXISTS chat_messages');
        
        // 创建新表
        await db.executeOn('web_project', `
            CREATE TABLE chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_name VARCHAR(100) NOT NULL,
                receiver_name VARCHAR(100) NOT NULL,
                content TEXT,
                image_url VARCHAR(500),
                video_url VARCHAR(500),
                create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
}

module.exports = ChatModel;