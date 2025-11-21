// 清理并修复user.routes.js文件中的导入错误和重复路由

const fs = require('fs');
const path = require('path');

/**
 * 清理并修复user.routes.js文件
 * @returns {boolean} 是否修复成功
 */
function cleanAndFixUserRoutes() {
    console.log('开始清理并修复user.routes.js文件...');
    const filePath = '/var/www/tgcf/node-backend/api/user.routes.js';
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        console.error('错误：找不到user.routes.js文件');
        return false;
    }
    
    // 备份原始文件
    const backupPath = filePath + '.clean.bak';
    try {
        fs.copyFileSync(filePath, backupPath);
        console.log('已备份原始文件到:', backupPath);
    } catch (err) {
        console.error('备份文件失败:', err.message);
        return false;
    }
    
    // 读取文件内容
    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        console.error('读取文件失败:', err.message);
        return false;
    }
    
    // 删除错误的导入语句（从../middleware/responseHandler导入的部分）
    content = content.replace(/const \{ validateParams, successResponse, errorResponse, validationErrorResponse, asyncHandler \} = require\('\.\.\/middleware\/responseHandler'\);/g, '');
    console.log('已删除错误的导入语句');
    
    // 检查是否已经有正确的validateParams和asyncHandler导入
    if (!content.includes('validateParams') || !content.includes('asyncHandler')) {
        // 添加必要的导入
        const additionalImports = 'const { validateParams, asyncHandler } = require(\'../middleware/common\');\n';
        content = additionalImports + content;
        console.log('已添加validateParams和asyncHandler导入');
    }
    
    // 定义完整的修复后内容
    const fixedContent = `const {   successResponse,   errorResponse,   validationErrorResponse,   paginatedResponse } = require('../utils/response.utils');
const { validateParams, asyncHandler } = require('../middleware/common');
const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const router = require('express').Router();

/**
 * 用户注册接口
 * @route POST /api/user/register
 * @param {object} req.body - 包含username和password
 * @returns {object} 包含新用户信息的响应
 */
router.post('/register', asyncHandler(async (req, res) => {
  const validation = validateParams(req.body, {
    username: { required: true, type: 'string', minLength: 1, maxLength: 50 },
    password: { required: true, type: 'string', minLength: 6 }
  });

  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }

  const { username, password } = req.body;

  try {
    // 检查用户名是否已存在
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return errorResponse(res, '用户名已存在', 400);
    }

    // 创建新用户
    const newUser = await UserModel.create({
      username,
      password
    });

    // 生成token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );

    return successResponse(res, { token, user: newUser }, '注册成功');
  } catch (error) {
    console.error('注册失败:', error);
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

module.exports = router;`;
    
    // 写回文件
    try {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log('文件已完全重写，修复了所有问题');
        return true;
    } catch (err) {
        console.error('写入文件失败:', err.message);
        return false;
    }
}

/**
 * 重启Node.js服务
 * @returns {boolean} 是否重启成功
 */
function restartService() {
    console.log('开始重启Node.js服务...');
    
    try {
        // 使用pm2重启服务
        const { execSync } = require('child_process');
        
        // 先检查PM2中的进程列表
        console.log('检查PM2进程列表...');
        const pm2List = execSync('pm2 list', { encoding: 'utf8' });
        console.log(pm2List);
        
        // 查找正确的进程名称
        let processName = 'app'; // 默认使用'app'
        if (pm2List.includes('node-backend')) {
            processName = 'node-backend';
        } else if (pm2List.includes('server')) {
            processName = 'server';
        }
        
        console.log(`使用进程名称: ${processName} 重启服务`);
        execSync(`pm2 restart ${processName}`, { stdio: 'inherit' });
        console.log('服务重启成功');
        return true;
    } catch (err) {
        console.error('服务重启失败:', err.message);
        return false;
    }
}

/**
 * 检查服务状态
 */
function checkServiceStatus() {
    console.log('\n检查服务状态:');
    try {
        const { execSync } = require('child_process');
        const output = execSync('pm2 status', { encoding: 'utf8' });
        console.log(output);
    } catch (err) {
        console.error('检查服务状态失败:', err.message);
    }
}

/**
 * 检查端口监听情况
 */
function checkPortListening() {
    console.log('\n检查端口监听情况:');
    try {
        const { execSync } = require('child_process');
        const output = execSync('netstat -tlnp | grep node', { encoding: 'utf8' });
        console.log(output);
    } catch (err) {
        console.log('未发现node进程监听的端口');
    }
}

/**
 * 主函数
 */
function main() {
    console.log('开始执行清理和修复...');
    
    if (cleanAndFixUserRoutes()) {
        console.log('\n文件清理和修复完成');
        
        if (restartService()) {
            console.log('\n服务重启成功');
            checkServiceStatus();
            checkPortListening();
            
            console.log('\n请等待服务完全启动后，手动测试API接口');
            console.log('建议使用以下命令测试:');
            console.log('1. 测试不存在用户登录: curl -X POST http://localhost:3003/api/user/login -H "Content-Type: application/json" -d "{\"username\":\"test_user\",\"password\":\"test123\"}"');
            console.log('2. 测试注册接口: curl -X POST http://localhost:3003/api/user/register -H "Content-Type: application/json" -d "{\"username\":\"new_user_123\",\"password\":\"password123\"}"');
        }
    } else {
        console.error('修复失败，请检查错误信息');
    }
}

// 执行主函数
main();