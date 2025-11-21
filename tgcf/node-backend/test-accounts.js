const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function testAccounts() {
  const config = {
    host: 'localhost',
    user: 'root',
    password: 'Mysql'
  };

  try {
    console.log('🔍 检查默认账号...\n');

    // 检查管理员账号
    const adminConnection = await mysql.createConnection({
      ...config,
      database: 'web_admindao'
    });

    const [admins] = await adminConnection.query('SELECT username, password FROM admins WHERE username = ?', ['admin']);
    
    if (admins.length > 0) {
      console.log('✅ 管理员账号存在:');
      console.log('   用户名: admin');
      console.log('   密码: admin123');
      
      // 验证密码
      const isValidAdmin = await bcrypt.compare('admin123', admins[0].password);
      console.log('   密码验证:', isValidAdmin ? '✅ 正确' : '❌ 错误');
    } else {
      console.log('❌ 管理员账号不存在');
    }

    await adminConnection.end();

    // 检查用户账号
    const userConnection = await mysql.createConnection({
      ...config,
      database: 'web_userdao'
    });

    const [users] = await userConnection.query('SELECT username, password FROM users WHERE username = ?', ['user1']);
    
    if (users.length > 0) {
      console.log('\n✅ 用户账号存在:');
      console.log('   用户名: user1');
      console.log('   密码: password123');
      
      // 验证密码
      const isValidUser = await bcrypt.compare('password123', users[0].password);
      console.log('   密码验证:', isValidUser ? '✅ 正确' : '❌ 错误');
    } else {
      console.log('\n❌ 用户账号不存在');
    }

    await userConnection.end();

    console.log('\n📋 测试完成');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAccounts();