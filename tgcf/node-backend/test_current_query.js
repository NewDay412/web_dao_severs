const db = require('./config/db');

async function testCurrentQuery() {
  try {
    console.log('测试当前查询逻辑...');
    
    // 模拟 getAllReviews 方法的逻辑
    let query = 'SELECT * FROM work_reviews';
    let conditions = [];
    let params = [];
    
    // 没有status参数的情况
    console.log('测试1: 没有status参数');
    
    query += ' ORDER BY create_time DESC';
    
    // 添加LIMIT和OFFSET（直接拼接）
    const pageSize = 10;
    const page = 1;
    const offset = (page - 1) * pageSize;
    query += ` LIMIT ${pageSize} OFFSET ${offset}`;
    
    console.log('查询语句:', query);
    console.log('参数数组:', params);
    
    const [rows] = await db.execute(query, params);
    console.log('结果:', rows.length, '条记录');
    
    console.log('测试完成');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testCurrentQuery();