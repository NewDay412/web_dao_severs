// 这个文件包含修复登录接口的脚本
// 执行方式: 在服务器上运行此脚本

const fs = require('fs');
const path = require('path');

// 修复登录接口的错误处理
const fixLoginApi = () => {
  const filePath = '/var/www/tgcf/node-backend/api/user.routes.js';
  
  // 读取原始文件内容
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 定义修复后的登录接口代码
  const loginApiCode = `/**
 * 用户登录接口
 * @route POST /api/user/login
 * @param {object} req.body - 包含username和password
 * @returns {object} 包含token的响应
 */
router.post('/login', asyncHandler(async (req, res) => {
  const validation = validateParams(req.body, {
    username: { required: true, type: 'string', minLength: 1, maxLength: 50 },
    password: { required: true, type: 'string', minLength: 1 }
  });

  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }

  const { username, password } = req.body;

  try {
    const user = await UserModel.login(username, password);

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );

    return successResponse(res, { token, user }, '登录成功');
  } catch (error) {
    console.error('登录失败:', error);
    if (error.message === 'USER_NOT_FOUND') {
      return errorResponse(res, '用户不存在', 404);
    } else if (error.message === 'INVALID_PASSWORD') {
      return errorResponse(res, '密码错误', 401);
    }
    return errorResponse(res, '登录失败，请稍后重试', 500);
  }
}));`;
  
  // 使用正则表达式替换登录接口
  const loginApiRegex = /\/\*\*[\s\S]*?user\.routes\.js[\s\S]*?\/api\/user\/login[\s\S]*?@returns[\s\S]*?\*\/[\s\S]*?router\.post\(['"]\/login['"][\s\S]*?}\);/;
  
  content = content.replace(loginApiRegex, loginApiCode);
  
  // 写回文件
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('登录接口修复完成！');
};

// 检查注册接口是否存在
const checkRegisterApi = () => {
  const filePath = '/var/www/tgcf/node-backend/api/user.routes.js';
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('router.post(\'/register\'')) {
    console.log('注册接口已存在');
  } else {
    console.log('警告：注册接口不存在，需要添加');
  }
};

// 执行修复
if (require.main === module) {
  console.log('开始修复登录和注册问题...');
  try {
    fixLoginApi();
    checkRegisterApi();
    console.log('修复完成！请重启Node.js服务以应用更改。');
    console.log('重启命令: pm2 restart app');
  } catch (error) {
    console.error('修复失败:', error.message);
  }
}
