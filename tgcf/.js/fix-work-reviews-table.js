const db = require('./node-backend/config/db');

async function fixWorkReviewsTable() {
  try {
    console.log('=== 修复work_reviews表结构 ===');
    
    // 检查表结构
    const [structure] = await db.execute('DESCRIBE work_reviews');
    console.log('当前表结构:');
    structure.forEach(row => {
      console.log(`${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Key} ${row.Default || ''}`);
    });

    // 检查是否有tags字段
    const hasTagsField = structure.some(row => row.Field === 'tags');
    
    if (!hasTagsField) {
      console.log('\n添加tags字段...');
      await db.execute('ALTER TABLE work_reviews ADD COLUMN tags VARCHAR(255) AFTER content');
      console.log('✅ tags字段添加成功');
    } else {
      console.log('✅ tags字段已存在');
    }

    // 验证表结构
    console.log('\n=== 验证修复后的表结构 ===');
    const [newStructure] = await db.execute('DESCRIBE work_reviews');
    newStructure.forEach(row => {
      console.log(`${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Key} ${row.Default || ''}`);
    });

    console.log('\n✅ work_reviews表结构修复完成');

  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
  process.exit(0);
}

fixWorkReviewsTable();