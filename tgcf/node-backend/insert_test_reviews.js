const mysql = require('mysql2/promise');

/**
 * 向work_reviews表插入测试数据
 */
async function insertTestReviews() {
  const config = {
    host: 'localhost',
    user: 'root',
    password: 'Mysql',
    database: 'web_project'
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功');
    
    // 清空现有数据
    await connection.execute('DELETE FROM work_reviews');
    console.log('✅ 已清空work_reviews表');
    
    // 插入测试数据
    const testReviews = [
      { username: '读者A', rating: 5, content: '非常精彩的作品，人物塑造很成功！', status: 'approved' },
      { username: '读者B', rating: 4, content: '剧情紧凑，期待后续发展。', status: 'approved' },
      { username: '读者C', rating: 5, content: '花城和谢怜的感情线太感人了！', status: 'approved' },
      { username: '读者D', rating: 3, content: '还不错，但有些地方可以改进。', status: 'pending' },
      { username: '读者E', rating: 4, content: '角色性格鲜明，故事引人入胜。', status: 'approved' }
    ];
    
    for (const review of testReviews) {
      await connection.execute(
        'INSERT INTO work_reviews (username, rating, content, status, create_time, update_time) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [review.username, review.rating, review.content, review.status]
      );
    }
    
    console.log('✅ 已插入测试数据');
    
    // 验证数据插入
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM work_reviews');
    console.log(`📊 work_reviews表数据量: ${rows[0].count} 条记录`);
    
    const [approvedRows] = await connection.execute('SELECT COUNT(*) as count FROM work_reviews WHERE status = "approved"');
    console.log(`✅ approved状态数据量: ${approvedRows[0].count} 条记录`);
    
    await connection.end();
    console.log('✅ 测试数据插入完成');
  } catch (error) {
    console.error('❌ 数据库操作失败:', error.message);
  }
}

// 执行插入
insertTestReviews();