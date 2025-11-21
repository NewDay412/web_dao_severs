const db = require('../config/db');

class UserChatModel {
    // 发送消息
    static async sendMessage(data, fromSync = false) {
        const { sender_name, receiver_name = 'all', content, image_url, video_url } = data;
        
        // 1. 保存到用户聊天表
        const [result] = await db.executeOn('web_userdao',
            'INSERT INTO user_chat_messages (sender_name, receiver_name, content, image_url, video_url, create_time) VALUES (?, ?, ?, ?, ?, NOW())',
            [sender_name, receiver_name, content || '', image_url || null, video_url || null]
        );
        
        // 2. 如果不是来自同步，同步到管理员聊天表
        if (!fromSync) {
            try {
                const AdminChatModel = require('./adminChat.model');
                await AdminChatModel.sendMessage(data, true);
            } catch (error) {
                console.error('同步消息到管理员表失败:', error);
                // 同步失败不影响主流程，但需要记录错误
            }
        }
        
        return result.insertId;
    }

    // 获取聊天记录
    static async getMessages(limit = 50) {
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 50)); // 限制在1-100之间
        try {
            // 直接拼接limit值，避免参数传递问题
            const sql = `SELECT * FROM user_chat_messages ORDER BY create_time DESC LIMIT ${limitNum}`;
            const [rows] = await db.executeOn('web_userdao', sql);
            return rows.reverse();
        } catch (error) {
            console.error('获取用户聊天记录失败:', error);
            throw error;
        }
    }

    // 获取与特定用户的聊天记录
    static async getMessagesWithUser(username, limit = 50) {
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 50)); // 限制在1-100之间
        try {
            // 使用参数化查询处理用户名，直接拼接limit值
            const sql = `SELECT * FROM user_chat_messages WHERE sender_name = ? OR receiver_name = ? ORDER BY create_time DESC LIMIT ${limitNum}`;
            const [rows] = await db.executeOn('web_userdao', sql, [username, username]);
            return rows.reverse();
        } catch (error) {
            console.error('获取用户特定聊天记录失败:', error);
            throw error;
        }
    }

    // 创建表
    static async createTable() {
        await db.executeOn('web_userdao', 'DROP TABLE IF EXISTS user_chat_messages');
        await db.executeOn('web_userdao', `CREATE TABLE user_chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_name VARCHAR(100) NOT NULL,
                receiver_name VARCHAR(100) NOT NULL DEFAULT 'all',
                content TEXT,
                image_url VARCHAR(500),
                video_url VARCHAR(500),
                create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);
    }
}

module.exports = UserChatModel;