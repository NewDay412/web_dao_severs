const mysql = require('mysql2/promise');

/**
 * 向work_reviews表插入示例数据
 */
async function insertWorkReviewsData() {
  const config = {
    host: 'localhost',
    user: 'root',
    password: 'Mysql',
    database: 'web_project'
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功');
    
    // 检查表是否存在
    try {
      await connection.execute('SELECT 1 FROM work_reviews LIMIT 1');
      console.log('✅ work_reviews表存在');
    } catch (error) {
      console.log('❌ work_reviews表不存在，需要先创建表');
      await connection.end();
      return;
    }
    
    // 检查表中是否有数据
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM work_reviews');
    console.log(`📊 work_reviews表当前数据量: ${rows[0].count} 条记录`);
    
    if (rows[0].count === 0) {
      // 插入示例数据
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
      
      console.log('✅ 已插入5条读者评价示例数据');
      
      // 验证数据插入
      const [newRows] = await connection.execute('SELECT COUNT(*) as count FROM work_reviews');
      console.log(`📊 work_reviews表数据量: ${newRows[0].count} 条记录`);
      
      const [approvedRows] = await connection.execute('SELECT COUNT(*) as count FROM work_reviews WHERE status = "approved"');
      console.log(`✅ approved状态数据量: ${approvedRows[0].count} 条记录`);
      
      // 显示插入的数据
      const [dataRows] = await connection.execute('SELECT * FROM work_reviews ORDER BY create_time DESC');
      console.log('📋 插入的读者评价数据:');
      dataRows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.username} (评分: ${row.rating}): ${row.content} [${row.status}]`);
      });
    } else {
      console.log('📊 work_reviews表已有数据，跳过插入');
      
      // 显示现有数据
      const [dataRows] = await connection.execute('SELECT * FROM work_reviews ORDER BY create_time DESC LIMIT 5');
      console.log('📋 现有的读者评价数据:');
      dataRows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.username} (评分: ${row.rating}): ${row.content} [${row.status}]`);
      });
    }
    
    await connection.end();
    console.log('✅ 读者评价数据处理完成');
  } catch (error) {
    console.error('❌ 数据库操作失败:', error.message);
  }
}

// 执行插入
insertWorkReviewsData();