const { AdminModel } = require('./models/user.model');
const bcrypt = require('bcrypt');

async function test() {
  try {
    const admin = await AdminModel.getAdminByUsername('admin');
    console.log('管理员信息:', admin);
    const match = await bcrypt.compare('admin123', admin.password);
    console.log('密码匹配:', match);
  } catch (error) {
    console.error('错误:', error);
  }
}

test();
