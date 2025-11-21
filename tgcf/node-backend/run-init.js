const { initializeDatabase } = require('./config/db');

async function init() {
  console.log('开始初始化数据库...');
  await initializeDatabase();
  console.log('数据库初始化完成！');
}

init();
