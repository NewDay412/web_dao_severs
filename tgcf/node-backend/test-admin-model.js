const { AdminModel } = require('./models/user.model');

async function testAdminModel() {
  try {
    console.log('🔍 直接测试AdminModel...\n');

    const result = await AdminModel.login('admin', 'admin123');
    console.log('✅ AdminModel登录成功:', result);

  } catch (error) {
    console.error('❌ AdminModel登录失败:', error.message);
    console.error('错误详情:', error);
  }
}

testAdminModel();