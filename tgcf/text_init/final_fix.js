// 完整修复登录和注册接口的脚本
// 此脚本将在服务器上执行，用于修复登录接口错误处理并添加缺失的注册接口
// 包含正确的响应工具模块引入路径

const fs = require('fs');
const path = require('path');

/**
 * 修复登录接口错误处理
 * @returns {boolean} 是否修复成功
 */
function fixLoginApi() {
    console.log('开始修复登录接口...');
    const filePath = '/var/www/tgcf/node-backend/api/user.routes.js';
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        console.error('错误：找不到user.routes.js文件');
        return false;
    }
    
    // 备份原始文件
    const backupPath = filePath + '.bak';
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
    
    // 检查并修复导入语句
    if (!content.includes('utils/response.utils')) {
        // 替换或添加正确的导入语句
        const importsToAdd = `const { \
  successResponse, \
  errorResponse, \
  validationErrorResponse, \
  paginatedResponse \
} = require('../utils/response.utils');`;
        
        // 在文件顶部添加导入
        content = importsToAdd + '\n\n' + content;
        console.log('已添加响应工具模块导入');
    }
    
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
    
    // 替换登录接口
    const startMarker = 'router.post(\'/login\'\'';
    const endMarker = '});';
    
    let startIndex = content.indexOf(startMarker);
    if (startIndex === -1) {
        // 尝试另一种匹配方式
        startIndex = content.indexOf('router.post(\'/login\'');
    }
    
    if (startIndex !== -1) {
        let endIndex = content.indexOf(endMarker, startIndex);
        if (endIndex !== -1) {
            // 确保找到正确的结束位置
            let bracketCount = 1;
            endIndex += endMarker.length;
            
            content = content.substring(0, startIndex) + loginApiCode + content.substring(endIndex);
            console.log('登录接口修复完成');
        } else {
            console.error('找不到登录接口的结束标记');
            return false;
        }
    } else {
        console.log('未找到登录接口，将添加新的登录接口');
        // 如果找不到登录接口，则添加到文件末尾
        content += '\n\n' + loginApiCode;
    }
    
    // 检查并添加注册接口
    if (!content.includes('router.post(\'/register\'') && !content.includes('router.post(\'/register\'\'')) {
        const registerApiCode = `/**
 * 用户注册接口
 * @route POST /api/user/register
 * @param {object} req.body - 包含username、password和其他用户信息
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
}));`;
        
        content += '\n\n' + registerApiCode;
        console.log('注册接口已添加');
    } else {
        console.log('注册接口已存在');
    }
    
    // 写回文件
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('文件写入成功');
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
        execSync('pm2 restart node-backend', { stdio: 'inherit' });
        console.log('服务重启成功');
        return true;
    } catch (err) {
        console.error('服务重启失败:', err.message);
        return false;
    }
}

/**
 * 测试API接口
 */
function testApi() {
    console.log('开始测试API接口...');
    
    try {
        const { exec } = require('child_process');
        
        // 测试登录接口（不存在的用户）
        console.log('\n测试不存在用户登录:');
        exec('curl -X POST http://localhost:3003/api/user/login -H "Content-Type: application/json" -d "{\"username\":\"nonexistent_user\",\"password\":\"test123\"}"', (error, stdout, stderr) => {
            console.log('登录测试结果:', stdout);
            
            // 测试注册接口
            console.log('\n测试注册接口:');
            exec('curl -X POST http://localhost:3003/api/user/register -H "Content-Type: application/json" -d "{\"username\":\"test_user_$(date +%s)\",\"password\":\"password123\"}"', (error, stdout, stderr) => {
                console.log('注册测试结果:', stdout);
                
                // 查看服务状态
                console.log('\n服务状态:');
                exec('pm2 status', (error, stdout, stderr) => {
                    console.log(stdout);
                });
            });
        });
    } catch (err) {
        console.error('API测试失败:', err.message);
    }
}

/**
 * 主函数
 */
function main() {
    console.log('开始执行完整修复...');
    
    if (fixLoginApi()) {
        console.log('\n登录和注册接口修复完成');
        
        if (restartService()) {
            console.log('\n服务重启成功，等待3秒后开始测试...');
            
            // 等待服务完全启动
            setTimeout(() => {
                testApi();
            }, 3000);
        }
    } else {
        console.error('修复失败，请检查错误信息');
    }
}

// 执行主函数
main();