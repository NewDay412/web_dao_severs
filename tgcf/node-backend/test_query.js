const db = require('./config/db');

async function testQuery() {
  try {
    console.log('测试简单查询...');
    
    // 测试1: 不带参数的查询
    console.log('测试1: 不带参数的查询');
    const [rows1] = await db.execute('SELECT * FROM work_reviews ORDER BY create_time DESC');
    console.log('结果1:', rows1.length, '条记录');
    
    // 测试2: 带LIMIT和OFFSET的查询
    console.log('测试2: 带LIMIT和OFFSET的查询');
    const [rows2] = await db.execute('SELECT * FROM work_reviews ORDER BY create_time DESC LIMIT 10 OFFSET 0');
    console.log('结果2:', rows2.length, '条记录');
    
    // 测试3: 使用占位符的查询
    console.log('测试3: 使用占位符的查询');
    const [rows3] = await db.execute('SELECT * FROM work_reviews ORDER BY create_time DESC LIMIT ? OFFSET ?', [10, 0]);
    console.log('结果3:', rows3.length, '条记录');
    
    console.log('所有测试完成');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testQuery();