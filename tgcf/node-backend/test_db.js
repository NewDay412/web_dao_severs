const mysql = require('mysql2/promise');

/**
 * 测试数据库连接和表结构
 */
async function testDatabase() {
  const config = {
    host: 'localhost',
    user: 'root',
    password: 'Mysql',
    database: 'web_project'
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功');
    
    // 检查work_reviews表是否存在
    const [tables] = await connection.execute('SHOW TABLES LIKE "work_reviews"');
    if (tables.length === 0) {
      console.log('❌ work_reviews表不存在');
    } else {
      console.log('✅ work_reviews表存在');
    }
    
    // 检查work_reviews表结构
    const [columns] = await connection.execute('DESCRIBE work_reviews');
    console.log('📋 work_reviews表结构:');
    columns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });
    
    // 检查work_reviews表数据
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM work_reviews');
    console.log(`📊 work_reviews表数据量: ${rows[0].count} 条记录`);
    
    // 检查是否有approved状态的数据
    const [approvedRows] = await connection.execute('SELECT COUNT(*) as count FROM work_reviews WHERE status = "approved"');
    console.log(`✅ approved状态数据量: ${approvedRows[0].count} 条记录`);
    
    // 检查表数据详情
    if (rows[0].count > 0) {
      const [dataRows] = await connection.execute('SELECT * FROM work_reviews LIMIT 5');
      console.log('📝 前5条数据:');
      dataRows.forEach(row => {
        console.log(`  ID: ${row.id}, 用户名: ${row.username}, 评分: ${row.rating}, 状态: ${row.status}`);
      });
    }
    
    await connection.end();
    console.log('✅ 数据库测试完成');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.error('详细错误信息:', error);
  }
}

// 执行测试
testDatabase();