const AdminChatModel = require('./models/adminChat.model');

async function initChatData() {
    try {
        console.log('开始初始化聊天数据...');
        
        // 创建表
        await AdminChatModel.createTable();
        console.log('聊天表创建成功');
        
        // 初始化示例数据
        await AdminChatModel.initSampleData();
        console.log('示例数据初始化成功');
        
        // 验证数据
        const users = await AdminChatModel.getUserList();
        console.log('用户列表:', users);
        
        const messages = await AdminChatModel.getMessages();
        console.log('消息列表:', messages);
        
        console.log('聊天数据初始化完成！');
        process.exit(0);
    } catch (error) {
        console.error('初始化聊天数据失败:', error);
        process.exit(1);
    }
}

initChatData();