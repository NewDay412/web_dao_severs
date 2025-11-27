/**
 * 清理轮播图重复数据脚本
 * 功能：移除重复的轮播图记录，仅保留每个标题和显示顺序组合的最新记录
 */
const mysql = require('mysql2/promise');

// 数据库配置（远程服务器）
const config = {
  host: '47.83.203.60',
  user: 'root',
  password: 'Mysql',
  database: 'web_project'
};

/**
 * 连接数据库并清理重复轮播图数据
 */
async function cleanupDuplicateCarouselData() {
  let connection = null;
  
  try {
    // 建立数据库连接
    connection = await mysql.createConnection(config);
    console.log('✅ 成功连接到数据库');
    
    // 获取所有轮播图数据，按标题、显示顺序和创建时间排序
    const [allCarousels] = await connection.execute(
      `SELECT id, title, display_order, create_time 
       FROM carousel_images 
       ORDER BY title, display_order, create_time DESC`
    );
    
    // 使用Map跟踪每个标题和显示顺序组合的最新记录ID
    const uniqueRecords = new Map();
    const recordsToKeep = [];
    const recordsToDelete = [];
    
    // 遍历所有记录
    for (const carousel of allCarousels) {
      // 创建唯一键：标题 + 显示顺序
      const uniqueKey = `${carousel.title}_${carousel.display_order}`;
      
      if (!uniqueRecords.has(uniqueKey)) {
        // 如果是该组合的第一条记录（最新的），保留
        uniqueRecords.set(uniqueKey, carousel.id);
        recordsToKeep.push(carousel.id);
      } else {
        // 否则标记为删除
        recordsToDelete.push(carousel.id);
      }
    }
    
    // 输出清理计划
    console.log(`\n📊 清理计划：`);
    console.log(`   总记录数：${allCarousels.length}`);
    console.log(`   保留记录数：${recordsToKeep.length}`);
    console.log(`   删除记录数：${recordsToDelete.length}`);
    
    if (recordsToDelete.length === 0) {
      console.log('\n✅ 没有重复数据需要清理');
      return;
    }
    
    // 执行删除操作
    if (recordsToDelete.length > 0) {
      const deleteQuery = `DELETE FROM carousel_images WHERE id IN (?)`;
      const [result] = await connection.execute(deleteQuery, [recordsToDelete]);
      
      console.log(`\n✅ 成功删除 ${result.affectedRows} 条重复记录`);
      console.log(`   删除的记录ID：${recordsToDelete.join(', ')}`);
    }
    
    // 验证清理结果
    const [afterCleanup] = await connection.execute(
      `SELECT id, title, display_order, create_time 
       FROM carousel_images 
       ORDER BY title, display_order`
    );
    
    console.log(`\n📋 清理后的记录：`);
    afterCleanup.forEach(record => {
      console.log(`   ID: ${record.id}, 标题: ${record.title}, 顺序: ${record.display_order}`);
    });
    
    console.log('\n🎉 轮播图数据清理完成！');
    
  } catch (error) {
    console.error('❌ 清理过程中发生错误：', error.message);
    throw error;
  } finally {
    // 关闭数据库连接
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 执行清理函数
cleanupDuplicateCarouselData().catch(error => {
  console.error('❌ 脚本执行失败：', error.message);
  process.exit(1);
});