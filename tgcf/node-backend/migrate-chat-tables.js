const UserChatModel = require('./models/userChat.model');
const AdminChatModel = require('./models/adminChat.model');
const db = require('./config/db');

async function migrateChatTables() {
    try {
        console.log('开始迁移聊天表...');
        
        // 创建用户聊天表
        await UserChatModel.createTable();
        console.log('✅ 用户聊天表创建成功');
        
        // 创建管理员聊天表
        await AdminChatModel.createTable();
        console.log('✅ 管理员聊天表创建成功');
        
        // 如果需要迁移旧数据，可以在这里添加迁移逻辑
        // 例如：从web_project.chat_messages迁移到新表
        
        console.log('✅ 聊天表迁移完成');
        process.exit(0);
    } catch (error) {
        console.error('❌ 聊天表迁移失败:', error);
        process.exit(1);
    }
}

// 运行迁移
migrateChatTables();