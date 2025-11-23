const db = require('./config/db');

async function testDatabaseAccess() {
  console.log('开始测试数据库连接...');
  
  try {
    // 测试主数据库连接
    console.log('\n测试 web_project 数据库...');
    const [projectRows] = await db.execute('SHOW TABLES FROM web_project');
    console.log(`✅ web_project 数据库中存在 ${projectRows.length} 个表`);
    
    // 检查 home_content 表
    const [hasHomeContent] = await db.execute(
      "SHOW TABLES FROM web_project LIKE 'home_content'"
    );
    if (hasHomeContent.length > 0) {
      console.log('✅ home_content 表存在');
      // 尝试查询一条记录
      try {
        const [content] = await db.execute(
          'SELECT * FROM web_project.home_content LIMIT 1'
        );
        console.log(`✅ 成功查询到 ${content.length} 条首页内容记录`);
      } catch (error) {
        console.error('❌ 查询 home_content 表失败:', error.message);
      }
    } else {
      console.error('❌ home_content 表不存在');
    }
    
    // 测试用户数据库
    console.log('\n测试 web_userdao 数据库...');
    const [userRows] = await db.execute('SHOW TABLES FROM web_userdao');
    console.log(`✅ web_userdao 数据库中存在 ${userRows.length} 个表`);
    
    // 测试管理员数据库
    console.log('\n测试 web_admindao 数据库...');
    const [adminRows] = await db.execute('SHOW TABLES FROM web_admindao');
    console.log(`✅ web_admindao 数据库中存在 ${adminRows.length} 个表`);
    
    // 测试登录验证API的数据库表
    const [hasAdmins] = await db.execute(
      "SHOW TABLES FROM web_admindao LIKE 'admins'"
    );
    if (hasAdmins.length > 0) {
      console.log('✅ admins 表存在');
    }
    
  } catch (error) {
    console.error('❌ 数据库测试失败:', error.message);
    console.log('\n详细错误:', error);
  }
}

testDatabaseAccess().then(() => {
  console.log('\n测试完成');
  process.exit(0);
});