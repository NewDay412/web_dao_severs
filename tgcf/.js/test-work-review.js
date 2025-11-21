const db = require('./node-backend/config/db');

async function testWorkReview() {
  try {
    console.log('=== 检查work_reviews表结构 ===');
    const [structure] = await db.execute('DESCRIBE work_reviews');
    console.log('表结构:');
    structure.forEach(row => {
      console.log(`${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Key} ${row.Default || ''}`);
    });

    console.log('\n=== 测试添加作品评价 ===');
    const testData = {
      username: '测试用户',
      rating: 5,
      content: '这是一个测试评价',
      tags: '测试,评价',
      status: 'pending'
    };

    console.log('测试数据:', testData);

    // 检查是否有tags字段
    const hasTagsField = structure.some(row => row.Field === 'tags');
    console.log('是否有tags字段:', hasTagsField);

    if (!hasTagsField) {
      console.log('添加tags字段...');
      await db.execute('ALTER TABLE work_reviews ADD COLUMN tags VARCHAR(255) AFTER content');
      console.log('✅ tags字段添加成功');
    }

    // 尝试插入数据
    const [result] = await db.execute(
      `INSERT INTO work_reviews (username, rating, content, tags, status, create_time, update_time)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [testData.username, testData.rating, testData.content, testData.tags, testData.status]
    );

    console.log('✅ 插入成功，ID:', result.insertId);

    // 查询刚插入的数据
    const [rows] = await db.execute('SELECT * FROM work_reviews WHERE id = ?', [result.insertId]);
    console.log('插入的数据:', rows[0]);

    // 清理测试数据
    await db.execute('DELETE FROM work_reviews WHERE id = ?', [result.insertId]);
    console.log('✅ 测试数据已清理');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
  process.exit(0);
}

testWorkReview();