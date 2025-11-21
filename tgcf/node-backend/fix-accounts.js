const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function fixAccounts() {
  const config = {
    host: 'localhost',
    user: 'root',
    password: 'Mysql'
  };

  try {
    console.log('🔧 修复默认账号密码...\n');

    // 修复管理员账号
    const adminConnection = await mysql.createConnection({
      ...config,
      database: 'web_admindao'
    });

    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    await adminConnection.query('UPDATE admins SET password = ? WHERE username = ?', [hashedAdminPassword, 'admin']);
    console.log('✅ 管理员密码已更新');

    await adminConnection.end();

    // 修复用户账号
    const userConnection = await mysql.createConnection({
      ...config,
      database: 'web_userdao'
    });

    const hashedUserPassword = await bcrypt.hash('password123', 10);
    await userConnection.query('UPDATE users SET password = ? WHERE username = ?', [hashedUserPassword, 'user1']);
    console.log('✅ 用户密码已更新');

    await userConnection.end();

    console.log('\n🎉 密码修复完成！');
    console.log('现在可以使用以下账号登录：');
    console.log('管理员: admin / admin123');
    console.log('用户: user1 / password123');

  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixAccounts();