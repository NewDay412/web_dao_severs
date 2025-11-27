// 最终修复脚本 - 修复user.routes.js中的导入错误并添加所需中间件

const fs = require('fs');
const path = require('path');

/**
 * 创建中间件目录和common.js文件
 * @returns {boolean} 是否创建成功
 */
function createMiddlewareFile() {
    console.log('开始创建middleware目录和common.js文件...');
    const middlewareDir = '/var/www/tgcf/node-backend/middleware';
    const commonFilePath = path.join(middlewareDir, 'common.js');
    
    try {
        // 创建目录
        if (!fs.existsSync(middlewareDir)) {
            fs.mkdirSync(middlewareDir, { recursive: true });
            console.log('已创建middleware目录');
        }
        
        // 创建common.js文件
        const commonJsContent = `/**
 * 通用中间件函数
 * 提供异步错误处理等常用中间件
 */

/**
 * 异步错误处理中间件
 * 自动捕获异步路由处理函数中的错误并传递给错误处理中间件
 * @param {Function} fn - 异步路由处理函数
 * @returns {Function} - 包装后的中间件函数
 */
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 验证参数中间件
 * 验证请求参数是否符合要求
 * @param {object} req - Express请求对象
 * @param {object} rules - 验证规则对象
 * @param {string} [location='body'] - 验证位置 ('body', 'query', 'params')
 * @returns {object} - 验证结果对象
 */
function validateParams(req, rules, location = 'body') {
  const params = req[location];
  const errors = {};
  
  // 确保参数是对象
  if (!params || typeof params !== 'object') {
    return {
      valid: false,
      errors: { params: '无效的请求参数' }
    };
  }
  
  // 确保规则是对象
  if (!rules || typeof rules !== 'object') {
    return {
      valid: false,
      errors: { rules: '无效的验证规则' }
    };
  }
  
  // 遍历规则进行验证
  for (const [field, rule] of Object.entries(rules)) {
    const value = params[field];
    
    // 必填字段检查
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors[field] = rule.message || field + '是必填项';
      continue;
    }
    
    // 如果字段不存在或值为空，但不是必填，跳过后续验证
    if ((value === undefined || value === null || value === '') && !rule.required) {
      continue;
    }
    
    // 类型检查
    if (rule.type && typeof value !== rule.type) {
      errors[field] = rule.message || field + '类型错误';
      continue;
    }
    
    // 最小长度检查
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      errors[field] = rule.message || field + '长度不能小于' + rule.minLength;
      continue;
    }
    
    // 最大长度检查
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      errors[field] = rule.message || field + '长度不能大于' + rule.maxLength;
      continue;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

module.exports = {
  asyncHandler,
  validateParams
};
`;
        
        fs.writeFileSync(commonFilePath, commonJsContent, 'utf8');
        console.log('已创建common.js文件');
        return true;
    } catch (err) {
        console.error('创建中间件文件失败:', err.message);
        return false;
    }
}

/**
 * 修复user.routes.js文件
 * @returns {boolean} 是否修复成功
 */
function fixUserRoutes() {
    console.log('开始修复user.routes.js文件...');
    const filePath = '/var/www/tgcf/node-backend/api/user.routes.js';
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        console.error('错误：找不到user.routes.js文件');
        return false;
    }
    
    // 备份原始文件
    const backupPath = filePath + '.final.bak';
    try {
        fs.copyFileSync(filePath, backupPath);
        console.log('已备份原始文件到:', backupPath);
    } catch (err) {
        console.error('备份文件失败:', err.message);
        return false;
    }
    
    // 定义完整的修复后内容
    const fixedContent = `const { 
  successResponse, 
  errorResponse, 
  validationErrorResponse, 
  paginatedResponse 
} = require('../utils/response.utils');
const { validateParams, asyncHandler } = require('../middleware/common');
const UserModel = require('../models/user.model');
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
        console.log('user.routes.js文件已完全重写，修复了所有问题');
        return true;
    } catch (err) {
        console.error('写入文件失败:', err.message);
        return false;
    }
}

/**
 * 检查并修复UserModel导入路径
 * @returns {boolean} 是否修复成功
 */
function checkUserModelPath() {
    console.log('检查UserModel导入路径...');
    const filePath = '/var/www/tgcf/node-backend/api/user.routes.js';
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 如果使用的是UserModel，修改为user.model
        if (content.includes("UserModel")) {
            // 保持导入语句不变，但检查文件是否存在
            const userModelPath = '/var/www/tgcf/node-backend/models/user.model.js';
            if (fs.existsSync(userModelPath)) {
                console.log('UserModel导入路径正确');
                return true;
            } else {
                // 如果user.model.js不存在，尝试找正确的文件名
                const modelsDir = '/var/www/tgcf/node-backend/models';
                const files = fs.readdirSync(modelsDir);
                const userModelFile = files.find(function(file) { return file.toLowerCase().includes('user'); });
                
                if (userModelFile) {
                    const newImportPath = '../models/' + userModelFile.replace('.js', '');
                    const oldImportStr = 'const UserModel = require("../models/user.model");';
                    const newImportStr = 'const UserModel = require("' + newImportPath + '");';
                    content = content.split(oldImportStr).join(newImportStr);
                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log('已修复UserModel导入路径为: ' + newImportPath);
                    return true;
                } else {
                    console.error('找不到用户模型文件');
                    return false;
                }
            }
        }
        return true;
    } catch (err) {
        console.error('检查UserModel路径失败:', err.message);
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
        let pm2List = '';
        try {
            pm2List = execSync('pm2 list', { encoding: 'utf8' });
            console.log(pm2List);
        } catch (err) {
            console.log('无法获取PM2进程列表，尝试直接重启');
        }
        
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
        
        // 尝试其他方式重启
        try {
            console.log('尝试直接使用node启动服务...');
            execSync('cd /var/www/tgcf/node-backend && pm2 start app.js --name node-backend', { stdio: 'inherit' });
            console.log('服务启动成功');
            return true;
        } catch (startErr) {
            console.error('直接启动服务也失败了:', startErr.message);
            return false;
        }
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
        console.log('未发现node进程监听的端口，尝试其他方式...');
        try {
            const { execSync } = require('child_process');
            const output = execSync('lsof -i :3003', { encoding: 'utf8' });
            console.log(output);
        } catch (lsofErr) {
            console.log('端口3003未被监听');
        }
    }
}

/**
 * 测试API接口
 */
function testApi() {
    console.log('\n测试API接口:');
    try {
        const { execSync } = require('child_process');
        
        console.log('\n测试不存在用户登录:');
        const loginOutput = execSync('curl -X POST http://localhost:3003/api/user/login -H "Content-Type: application/json" -d "{\"username\":\"test_user_123\",\"password\":\"test123\"}"', { encoding: 'utf8' });
        console.log(loginOutput);
        
        console.log('\n测试注册接口:');
        const registerOutput = execSync('curl -X POST http://localhost:3003/api/user/register -H "Content-Type: application/json" -d "{\"username\":\"new_test_user_123\",\"password\":\"password123\"}"', { encoding: 'utf8' });
        console.log(registerOutput);
        
    } catch (err) {
        console.error('API测试失败:', err.message);
    }
}

/**
 * 主函数
 */
function main() {
    console.log('开始执行最终修复...');
    
    // 1. 创建中间件文件
    if (createMiddlewareFile()) {
        console.log('\n中间件文件创建完成');
        
        // 2. 修复user.routes.js
        if (fixUserRoutes()) {
            console.log('\nuser.routes.js修复完成');
            
            // 3. 检查UserModel路径
            if (checkUserModelPath()) {
                console.log('\nUserModel路径检查完成');
                
                // 4. 重启服务
                if (restartService()) {
                    console.log('\n服务重启成功');
                    
                    // 5. 检查服务状态
                    checkServiceStatus();
                    checkPortListening();
                    
                    // 6. 等待服务启动
                    console.log('\n等待3秒让服务完全启动...');
                    setTimeout(() => {
                        // 7. 测试API
                        testApi();
                        
                        console.log('\n✅ 最终修复完成！请检查API测试结果。');
                    }, 3000);
                } else {
                    console.error('❌ 服务重启失败，请手动重启服务');
                }
            } else {
                console.error('❌ UserModel路径检查失败');
            }
        } else {
            console.error('❌ user.routes.js修复失败');
        }
    } else {
        console.error('❌ 中间件文件创建失败');
    }
}

// 执行主函数
main();