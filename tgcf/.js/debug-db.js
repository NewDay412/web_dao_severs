const db = require('./node-backend/config/db');

async function testDatabase() {
    try {
        console.log('测试数据库连接...');
        
        // 测试连接
        const [rows] = await db.execute('SELECT 1 as test');
        console.log('✅ 数据库连接成功');
        
        // 检查message_board表结构
        const [tableInfo] = await db.execute('DESCRIBE message_board');
        console.log('📋 message_board表结构:');
        tableInfo.forEach(column => {
            console.log(`  ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(可空)' : '(非空)'} ${column.Default ? `默认值: ${column.Default}` : ''}`);
        });
        
        // 测试插入数据
        console.log('\n🧪 测试插入留言...');
        const testData = {
            username: '测试用户',
            email: 'test@example.com',
            phone: '13800138000',
            content: '这是一条测试留言'
        };
        
        const [result] = await db.execute(
            `INSERT INTO message_board (username, email, phone, content, status, create_time, update_time)
             VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())`,
            [testData.username, testData.email, testData.phone, testData.content]
        );
        
        console.log('✅ 插入成功，ID:', result.insertId);
        
        // 查询刚插入的数据
        const [messages] = await db.execute('SELECT * FROM message_board WHERE id = ?', [result.insertId]);
        console.log('📝 插入的数据:', messages[0]);
        
        // 清理测试数据
        await db.execute('DELETE FROM message_board WHERE id = ?', [result.insertId]);
        console.log('🧹 测试数据已清理');
        
    } catch (error) {
        console.error('❌ 数据库测试失败:', error);
    } finally {
        process.exit(0);
    }
}

testDatabase();