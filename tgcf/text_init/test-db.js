const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config({ path: './node-backend/.env' });

async function testDatabase() {
    console.log('正在测试数据库连接...');
    
    try {
        // 创建数据库连接
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Mysql',
            port: process.env.DB_PORT || 3306
        });
        
        console.log('✅ 数据库连接成功');
        
        // 检查数据库是否存在
        await connection.query('CREATE DATABASE IF NOT EXISTS web_project');
        console.log('✅ 数据库 web_project 存在或已创建');
        
        // 使用数据库
        await connection.query('USE web_project');
        
        // 检查轮播图表是否存在
        const [tables] = await connection.query(
            "SHOW TABLES LIKE 'carousel_images'"
        );
        
        if (tables.length > 0) {
            console.log('✅ 轮播图表 carousel_images 存在');
            
            // 查询表结构
            const [columns] = await connection.query(
                'DESCRIBE carousel_images'
            );
            console.log('\n📋 轮播图表结构:');
            columns.forEach(col => {
                console.log(`  ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default || ''} ${col.Extra || ''}`);
            });
            
            // 查询现有轮播图数据
            const [rows] = await connection.query(
                'SELECT * FROM carousel_images'
            );
            console.log(`\n📊 现有轮播图数量: ${rows.length}`);
            if (rows.length > 0) {
                console.log('\n🔍 轮播图数据示例:');
                rows.forEach(row => {
                    console.log(`  ID: ${row.id}, 标题: ${row.title}, 图片URL: ${row.image_url}`);
                });
            }
        } else {
            console.log('❌ 轮播图表 carousel_images 不存在');
            
            // 创建轮播图表
            await connection.query(`
                CREATE TABLE carousel_images (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL COMMENT '轮播图标题',
                    image_url VARCHAR(500) NOT NULL COMMENT '图片URL',
                    link_url VARCHAR(500) DEFAULT NULL COMMENT '点击跳转链接',
                    description TEXT DEFAULT NULL COMMENT '描述',
                    display_order INT DEFAULT 0 COMMENT '显示顺序',
                    is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
                    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图表'
            `);
            console.log('✅ 已创建轮播图表 carousel_images');
        }
        
        // 关闭连接
        await connection.end();
        console.log('\n✅ 测试完成');
        
    } catch (error) {
        console.error('❌ 数据库测试失败:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 可能的原因: 数据库用户名或密码错误');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('💡 可能的原因: 数据库不存在');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 可能的原因: MySQL服务器未启动或连接被拒绝');
        }
    }
}

testDatabase();