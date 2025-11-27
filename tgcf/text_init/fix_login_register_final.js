/**
 * 最终修复登录和注册接口脚本
 * 修复内容：
 * 1. 使用正确的响应工具导入路径
 * 2. 修复登录接口的错误处理
 * 3. 确保注册接口正常工作
 * 4. 重启服务并测试功能
 */

const fs = require('fs');
const { execSync } = require('child_process');

// 本地验证文件内容
const userRoutesContent = `const express = require('express');
const router = express.Router();
const UserModel = require('../models/user.model');
const { successResponse, errorResponse, validationErrorResponse, asyncHandler } = require('../utils/response.utils');
const { validateParams } = require('../utils/validation.utils');
const jwt = require('jsonwebtoken');

/**
 * 用户注册接口
 * @route POST /api/user/register
 * @param {object} req.body - 包含username、password、email等信息
 * @returns {object} 注册结果
 */
router.post('/register', asyncHandler(async (req, res) => {
  const validation = validateParams(req.body, {
    username: { required: true, type: 'string', minLength: 1, maxLength: 50 },
    password: { required: true, type: 'string', minLength: 6 },
    email: { required: true, type: 'string', pattern: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/ }
  });

  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }

  const { username, password, email } = req.body;

  try {
    const user = await UserModel.register(username, password, email);
    return successResponse(res, { user }, '注册成功');
  } catch (error) {
    console.error('注册失败:', error);
    if (error.message === 'USERNAME_EXISTS') {
      return errorResponse(res, '用户名已存在', 400);
    }
    return errorResponse(res, '注册失败，请稍后重试', 500);
  }
}));

/**
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
}));

module.exports = router;
`;

// 保存本地文件进行验证
fs.writeFileSync('./validated-user.routes.js', userRoutesContent);
console.log('已在本地生成验证文件: validated-user.routes.js');

// 创建SSH修复脚本
const sshFixScript = `#!/bin/bash

# 备份原始文件
cp /var/www/tgcf/node-backend/api/user.routes.js /var/www/tgcf/node-backend/api/user.routes.js.bak_final

# 创建修复后的文件
cat > /var/www/tgcf/node-backend/api/user.routes.js << 'EOF'
${userRoutesContent}
EOF

# 重启服务
echo '重启服务...'
pm2 restart node-backend

# 等待服务启动
sleep 5

# 检查服务状态
echo '检查服务状态:'
pm2 status

# 检查端口监听
echo '检查端口监听:'
netstat -tlnp | grep 3003

# 测试登录接口（使用正确的JSON格式）
echo '\n测试登录接口:'
curl -X POST http://localhost:3003/api/user/login -H "Content-Type: application/json" -d '{"username":"user1","password":"password123"}'

# 测试不存在用户登录
echo '\n测试不存在用户登录:'
curl -X POST http://localhost:3003/api/user/login -H "Content-Type: application/json" -d '{"username":"nonexistent","password":"123"}'

# 测试注册接口
echo '\n测试注册接口:'
curl -X POST http://localhost:3003/api/user/register -H "Content-Type: application/json" -d '{"username":"testuser_new","password":"test123456","email":"test_new@example.com"}'

echo '\n修复完成！请检查上面的测试结果。'
`;

// 保存SSH修复脚本
fs.writeFileSync('./remote-fix.sh', sshFixScript);
console.log('已生成远程修复脚本: remote-fix.sh');
console.log('\n执行以下命令在远程服务器上运行修复脚本:');
console.log('ssh root@47.83.203.60 "cat > /root/fix.sh && chmod +x /root/fix.sh && /root/fix.sh" < ./remote-fix.sh');
