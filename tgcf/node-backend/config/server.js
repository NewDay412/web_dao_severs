// 此文件已废弃，请使用根目录的app.js作为服务器入口
// 服务器配置已迁移到app.js，此文件保留用于参考
console.warn('警告：config/server.js已废弃，请使用根目录的app.js');
module.exports = {};

// 数据库配置 - 开发环境配置
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Mysql', // 根据用户要求设置密码
  database: 'web_userdao', // 更新为用户指定的数据库名称
  multipleStatements: true, // 允许执行多语句
  waitForConnections: true,
  connectionLimit: 10,       // 连接池最大连接数
  queueLimit: 0,             // 队列限制
  // 添加容错配置
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 10000
};

// 管理员数据库配置
const adminDbConfig = {
   host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Mysql', // 如 root123456
  database: 'web_admindao', // 管理员数据库名称
  multipleStatements: true, // 允许执行多语句
  waitForConnections: true,
  connectionLimit: 10,       // 连接池最大连接数
  queueLimit: 0,             // 队列限制
  // 添加容错配置
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 10000
};

// 用户数据库连接池
const userPool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 管理员数据库连接池
const adminPool = mysql.createPool({
  host: adminDbConfig.host,
  user: adminDbConfig.user,
  password: adminDbConfig.password,
  database: adminDbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 获取用户数据库连接
async function getUserConnection() {
  return await userPool.getConnection();
}

// 获取管理员数据库连接
async function getAdminConnection() {
  return await adminPool.getConnection();
}

/**
 * 检查数据库连接
 */
async function checkDatabaseConnection() {
  try {
    console.log('开始检查数据库连接...');
    
    // 初始化用户数据库
    const userResult = await initializeUserDatabase();
    
    // 初始化管理员数据库
    const adminResult = await initializeAdminDatabase();
    
    console.log('数据库检查和初始化完成');
  } catch (error) {
    console.error('数据库连接或初始化失败:', error);
    console.log('服务器将继续运行，但某些功能可能受限');
    // 10秒后重试连接
    setTimeout(checkDatabaseConnection, 10000);
  }
}

/**
 * 初始化用户数据库
 */
async function initializeUserDatabase() {
  try {
    // 首先尝试连接MySQL服务器（不指定数据库）
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    // 检查数据库是否存在，如果不存在则创建
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await tempConnection.end();
    
    const connection = await getUserConnection();
    console.log('成功连接到用户数据库');
    
    // 创建用户数据库必要的表结构
    await createTablesIfNotExist(connection);
    
    // 创建默认用户账户
    await checkAndCreateDefaultUser(connection);
    
    // 释放连接
    connection.release();
    return true;
  } catch (error) {
    console.error('用户数据库初始化失败:', error);
    return false;
  }
}

/**
 * 初始化管理员数据库
 */
async function initializeAdminDatabase() {
  try {
    // 首先尝试连接MySQL服务器（不指定数据库）
    const tempConnection = await mysql.createConnection({
      host: adminDbConfig.host,
      port: adminDbConfig.port,
      user: adminDbConfig.user,
      password: adminDbConfig.password
    });
    
    // 检查数据库是否存在，如果不存在则创建
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${adminDbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await tempConnection.end();
    
    const connection = await getAdminConnection();
    console.log('成功连接到管理员数据库');
    
    // 创建管理员数据库必要的表结构
    await createAdminTables(connection);
    
    // 检查并创建默认管理员账户
    try {
      await checkAndCreateAdminUser(connection);
    } catch (adminError) {
      console.error('管理员账户初始化失败:', adminError.message);
      // 仅记录错误，不中断整个流程
    }
    
    // 释放连接
    connection.release();
    return true;
  } catch (error) {
    console.error('管理员数据库初始化失败:', error);
    return false;
  }
}

/**
 * 创建用户数据库表结构
 */
async function createUserTables(connection) {
  try {
    // 创建用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        iPhone VARCHAR(20),
        salt VARCHAR(50) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 创建留言表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        isReplied BOOLEAN DEFAULT FALSE
      );
    `);
    
    // 创建活动日志表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        action VARCHAR(100) NOT NULL,
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 创建页面内容表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_name VARCHAR(50) NOT NULL UNIQUE,
        section_name VARCHAR(50) NOT NULL,
        content TEXT,
        content_type VARCHAR(20) DEFAULT 'html',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_page_section (page_name, section_name)
      );
    `);
    
    console.log('用户数据库表结构检查/创建完成');
  } catch (error) {
    console.error('创建用户数据库表结构时出错:', error);
    throw error;
  }
}

/**
 * 创建管理员数据库表结构
 */
async function createAdminTables(connection) {
  try {
    // 创建管理员表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        salt VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    
    // 创建管理员活动日志表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT,
        action VARCHAR(100) NOT NULL,
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('管理员数据库表结构检查/创建完成');
  } catch (error) {
    console.error('创建管理员数据库表结构时出错:', error);
    throw error;
  }
}

/**
 * 创建数据库表结构（如果不存在）- 兼容旧代码
 */
async function createTablesIfNotExist(connection) {
  try {
    // 尝试创建用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        iPhone VARCHAR(20),
        salt VARCHAR(50) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 创建必要的基础表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        action VARCHAR(100) NOT NULL,
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('兼容表结构创建完成');
  } catch (error) {
    console.error('创建兼容表结构时出错:', error);
    // 不抛出错误，允许程序继续运行
  }
}

/**
 * 检查并创建默认管理员账户
 */
async function checkAndCreateAdminUser(connection) {
  try {
    // 检查是否已存在管理员账户
    const [rows] = await connection.query('SELECT id FROM admins WHERE username = ?', ['admin']);
    
    if (rows.length === 0) {
      // 生成密码哈希
      const password = '123456'; // 默认密码
      const hashedPasswordObj = hashPassword(password);
      
      // 创建默认管理员账户
      await connection.query(
        'INSERT INTO admins (username, password, salt) VALUES (?, ?, ?)',
        ['admin', hashedPasswordObj.password, hashedPasswordObj.salt]
      );
      
      console.log('默认管理员账户创建成功: username=admin, password=123456');
    } else {
      console.log('管理员账户已存在');
    }
  } catch (error) {
    console.error('检查或创建管理员账户时出错:', error);
    throw error;
  }
}

/**
 * 检查并创建默认用户账户
 */
async function checkAndCreateDefaultUser(connection) {
  try {
    // 检查是否已存在默认用户账户
    const [rows] = await connection.query('SELECT id FROM users WHERE username = ?', ['user1']);
    
    if (rows.length === 0) {
      // 生成密码哈希
      const password = '123456'; // 默认密码
      const hashedPasswordObj = hashPassword(password);
      
      // 创建默认用户账户
      await connection.query(
        'INSERT INTO users (username, password, salt, iPhone) VALUES (?, ?, ?, ?)',
        ['user1', hashedPasswordObj.password, hashedPasswordObj.salt, '12345678910']
      );
      
      console.log('默认用户账户创建成功: username=user1, password=123456');
    } else {
      console.log('默认用户账户已存在');
    }
  } catch (error) {
    console.error('检查或创建默认用户账户时出错:', error);
    throw error;
  }
}

/**
 * 检查表结构并添加缺失的列 - 兼容旧代码
 */
async function checkAndAddColumns(connection) {
  try {
    // 检查role列是否存在，如果不存在则添加
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role'"
    );
    
    if (columns.length === 0) {
      await connection.query("ALTER TABLE users ADD COLUMN role ENUM('admin', 'user') DEFAULT 'user'");
      console.log('添加了role列到users表');
    }
    
    // 更新所有现有用户的role值为'user'（除了admin用户）
    await connection.query("UPDATE users SET role = 'user' WHERE username != 'admin' OR role IS NULL");
    
    // 如果存在admin用户，确保其role值为'admin'
    await connection.query("UPDATE users SET role = 'admin' WHERE username = 'admin'");
  } catch (error) {
    console.error('检查表结构时出错:', error);
    // 不抛出错误，允许程序继续运行
  }
}

/**
 * 生成密码哈希和盐值
 * @param {string} password - 原始密码
 * @returns {Object} 包含盐值和哈希密码的对象
 */
function hashPassword(password) {
  try {
    // 验证密码参数
    if (!password || typeof password !== 'string') {
      throw new Error('密码必须是有效的字符串');
    }
    
    // 生成较短的盐值
    const salt = crypto.randomBytes(8).toString('hex'); // 从16字节减少到8字节
    
    // 使用较少的迭代次数生成较短的哈希
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 5000, 32, 'sha512') // 减少迭代次数和输出长度
      .toString('hex');
    
    return { salt, password: hashedPassword };
  } catch (error) {
    console.error('密码哈希生成失败:', error.message);
    throw error;
  }
}

/**
 * 验证密码
 * @param {string} password - 输入的密码
 * @param {string} hashedPassword - 存储的哈希密码
 * @param {string} salt - 存储的盐值
 * @returns {boolean} 密码是否匹配
 */
function verifyPassword(password, hashedPassword, salt) {
  try {
    // 检查参数有效性
    if (!password || !hashedPassword) {
      console.log('密码验证失败: 缺少必要参数');
      return false;
    }
    
    // 确保salt是字符串类型
    const saltStr = salt || '';
    console.log('密码验证开始: salt长度=' + saltStr.length);
    
    // 生成测试哈希值
    const hash = crypto
      .pbkdf2Sync(password, saltStr, 5000, 32, 'sha512')
      .toString('hex');
    
    // 记录部分哈希值用于调试
    const result = hash === hashedPassword;
    console.log('密码验证结果: ' + result);
    return result;
  } catch (error) {
    console.error('验证密码时出错:', error);
    return false;
  }
}

/**
 * 记录管理员活动日志
 */
async function logAdminActivity(adminId, action, ipAddress) {
  try {
    const connection = await getAdminConnection();
    await connection.execute(
      'INSERT INTO admin_activities (admin_id, activity_type, activity_details, ip_address) VALUES (?, ?, ?, ?)',
      [adminId, action, '', ipAddress || '']
    );
    connection.release();
  } catch (error) {
    console.error('记录管理员活动日志失败:', error);
    // 不抛出错误，允许程序继续运行
  }
}

/**
 * 记录活动日志
 */
async function logActivity(username, action) {
  try {
    const connection = await userPool.getConnection();
    await connection.execute(
      'INSERT INTO activity_logs (username, action) VALUES (?, ?)',
      [username, action]
    );
    connection.release();
  } catch (error) {
    console.error('记录活动日志失败:', error);
  }
}

// 创建Express应用实例
const app = express();
const PORT = 3003;

// 中间件配置
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码的请求体

/**
 * 静态文件服务中间件
 * 提供前端HTML、CSS、JavaScript等静态资源
 */
app.use(express.static(__dirname));

// 数据库已配置完成，不再需要模拟数据

/**
 * 健康检查接口
 * @route GET /api/health
 * @returns {Object} 服务器状态信息
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: '服务器运行正常',
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
  });
});

/**
 * 用户注册接口
 * @route POST /api/register
 * @param {Object} req.body - 包含username和password
 * @returns {Object} 注册结果和用户信息
 */
app.post('/api/register', async (req, res) => {
  let connection;
  try {
    const { username, password, iPhone } = req.body;
    
    // 类型检查
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ 
        status: 'error', 
        message: '用户名和密码不能为空且必须是字符串' 
      });
    }
    
    // 验证用户名和密码长度
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ 
        status: 'error', 
        message: '用户名长度必须在3-20个字符之间' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        status: 'error', 
        message: '密码长度必须至少为6个字符' 
      });
    }
    
    connection = await userPool.getConnection();
    
    // 检查用户名是否已存在
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: '用户名已存在' 
      });
    }
    
    // 生成密码哈希和盐值
    const { salt, password: hashedPassword } = hashPassword(password);
    
    // 创建新用户 - 包含iPhone字段
    const [result] = await connection.execute(
      'INSERT INTO users (username, password, iPhone, salt, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, iPhone || null, salt, 'user']
    );
    
    // 记录注册活动
    await logActivity(username, '用户注册');
    
    // 生成模拟token（实际应用中应使用JWT）
    const token = `token_${Date.now()}_${username}_${crypto.randomBytes(8).toString('hex')}`;
    
    res.status(201).json({
      status: 'success',
      message: '注册成功',
      user: {
        id: result.insertId,
        username: username,
        iPhone: iPhone || null,
        role: 'user'
      },
      token: token
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      status: 'error',
      message: '注册失败，请稍后重试'
    });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * 用户登录接口 - 支持用户和管理员登录
 * @route POST /api/login
 * @param {Object} req.body - 包含username和password
 * @returns {Object} 登录结果和用户信息
 */
app.post('/api/login', async (req, res) => {
  try {
    // 获取请求参数
    const { username, password } = req.body;
    
    // 参数验证
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: '用户名和密码不能为空且必须是字符串'
      });
    }
    
    // 1. 先尝试从管理员数据库验证
    let isAdmin = false;
    let userInfo = null;
    let token = null;
    
    try {
      const adminConnection = await getAdminConnection();
      const [adminRows] = await adminConnection.execute('SELECT * FROM admins WHERE username = ?', [username]);
      
      if (adminRows.length > 0) {
        const admin = adminRows[0];
        // 检查salt是否存在，如果存在则使用带salt的验证，否则使用bcrypt验证
        console.log('管理员登录验证:', { username, hasSalt: !!admin.salt });
        
        let passwordMatch = false;
        if (admin.salt) {
          // 使用crypto.pbkdf2Sync验证（旧密码格式）
          passwordMatch = verifyPassword(password, admin.password, admin.salt);
        } else {
          // 使用bcrypt验证（新密码格式）
          const bcrypt = require('bcrypt');
          passwordMatch = await bcrypt.compare(password, admin.password);
        }
        
        console.log('管理员密码验证结果:', passwordMatch);
          
        if (passwordMatch) {
          isAdmin = true;
          userInfo = {
            id: admin.id,
            username: admin.username,
            role: 'admin'
          };
          
          // 生成token
          token = `token_${Date.now()}_${username}_${crypto.randomBytes(16).toString('hex')}`;
          
          // 记录管理员登录活动
          try {
            await adminConnection.execute(
              'INSERT INTO admin_activities (admin_id, action) VALUES (?, ?)',
              [admin.id, '管理员登录']
            );
          } catch (logError) {
            console.warn('记录管理员登录活动失败:', logError);
          }
        }
      }
      adminConnection.release();
    } catch (adminError) {
      console.warn('管理员数据库验证失败，但继续尝试用户数据库:', adminError);
    }
    
    // 2. 如果不是管理员，尝试从用户数据库验证
    if (!isAdmin) {
      console.log('开始用户数据库验证，用户名:', username);
      const userConnection = await getUserConnection();
      
      try {
        console.log('成功获取用户数据库连接');
        console.log('执行SQL查询: SELECT id, username, password, salt, role FROM users WHERE username = ?');
        console.log('查询参数:', username);
        
        const [userRows] = await userConnection.execute(
          'SELECT id, username, password, salt, role FROM users WHERE username = ?',
          [username]
        );
        
        console.log('查询结果行数:', userRows.length);
        
        if (userRows.length === 0) {
          // 用户不存在
          console.log('用户不存在:', username);
          userConnection.release();
          return res.status(401).json({
            status: 'error',
            message: '用户名或密码错误'
          });
        }
        
        const user = userRows[0];
        console.log('找到用户:', { id: user.id, username: user.username, hasSalt: !!user.salt, saltLength: user.salt ? user.salt.length : 0 });
        
        // 验证密码
        console.log('准备验证密码，password:', password, 'salt:', user.salt);
        const isValidPassword = verifyPassword(password, user.password, user.salt);
        console.log('用户密码验证结果:', isValidPassword);
        
        if (!isValidPassword) {
          // 记录登录失败活动
          try {
            await userConnection.execute(
              'INSERT INTO activity_logs (username, action) VALUES (?, ?)',
              [username, '登录失败：密码错误']
            );
          } catch (logError) {
            console.warn('记录登录失败活动失败:', logError);
          }
          userConnection.release();
          return res.status(401).json({ status: 'error', message: '用户名或密码错误' });
        }
        
        userInfo = {
          id: user.id,
          username: user.username,
          role: user.role
        };
        
        // 生成token
        token = `token_${Date.now()}_${username}_${crypto.randomBytes(16).toString('hex')}`;
        
        // 记录用户登录活动
        try {
          await userConnection.execute(
            'INSERT INTO activity_logs (username, action) VALUES (?, ?)',
            [username, `用户登录，角色: ${user.role}`]
          );
        } catch (logError) {
          console.warn('记录用户登录活动失败:', logError);
        }
      } catch (dbError) {
        console.error('用户数据库验证过程中发生错误:', dbError);
        try {
          userConnection.release();
        } catch (releaseError) {
          console.warn('释放数据库连接失败:', releaseError);
        }
        return res.status(500).json({
          status: 'error',
          message: '服务器内部错误'
        });
      } finally {
        try {
          userConnection.release();
        } catch (releaseError) {
          console.warn('在finally块中释放数据库连接失败:', releaseError);
        }
      }
    }
    
    // 返回成功响应
    return res.json({
      status: 'success',
      message: '登录成功',
      user: userInfo,
      token: token,
      redirectUrl: isAdmin ? '/admin/dashboard.html' : '/index.html'
    });
  } catch (error) {
    console.error('登录错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

/**
 * 更新管理员密码API
 */
app.post('/api/admin/update-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers['authorization'] || req.headers['token'] || '';
    
    // 验证token
    if (!token || !token.startsWith('token_')) {
      return res.status(401).json({
        status: 'error',
        message: '未授权的访问'
      });
    }
    
    // 从token中提取用户名信息
    const tokenParts = token.split('_');
    if (tokenParts.length < 3) {
      return res.status(401).json({
        status: 'error',
        message: '无效的token'
      });
    }
    
    const username = tokenParts[2];
    
    // 验证参数
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: '当前密码和新密码不能为空'
      });
    }
    
    // 获取管理员信息
    const adminConnection = await getAdminConnection();
    const [rows] = await adminConnection.execute('SELECT * FROM admins WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      adminConnection.release();
      return res.status(404).json({
        status: 'error',
        message: '管理员不存在'
      });
    }
    
    const admin = rows[0];
    
    // 验证当前密码
    const passwordMatch = admin.salt 
      ? verifyPassword(currentPassword, admin.password, admin.salt) 
      : verifyPassword(currentPassword, admin.password, '');
      
    if (!passwordMatch) {
      adminConnection.release();
      return res.status(401).json({
        status: 'error',
        message: '当前密码错误'
      });
    }
    
    // 更新密码
    const hashedPasswordObj = hashPassword(newPassword);
    await adminConnection.execute(
      'UPDATE admins SET password = ?, salt = ? WHERE username = ?',
      [hashedPasswordObj.password, hashedPasswordObj.salt, username]
    );
    
    // 记录活动
    await adminConnection.execute(
      'INSERT INTO admin_activities (admin_id, action) VALUES (?, ?)',
      [admin.id, '更新密码']
    );
    
    adminConnection.release();
    
    return res.json({
      status: 'success',
      message: '密码更新成功'
    });
  } catch (error) {
    console.error('更新管理员密码错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

/**
 * 添加管理员账户API
 */
app.post('/api/admin/add-admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const token = req.headers['authorization'] || req.headers['token'] || '';
    
    // 验证token
    if (!token || !token.startsWith('token_')) {
      return res.status(401).json({
        status: 'error',
        message: '未授权的访问'
      });
    }
    
    // 从token中提取用户名信息
    const tokenParts = token.split('_');
    if (tokenParts.length < 3) {
      return res.status(401).json({
        status: 'error',
        message: '无效的token'
      });
    }
    
    const currentAdminUsername = tokenParts[2];
    
    // 验证参数
    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: '用户名和密码不能为空'
      });
    }
    
    const adminConnection = await getAdminConnection();
    
    // 检查当前用户是否为管理员
    const [currentAdmin] = await adminConnection.execute('SELECT * FROM admins WHERE username = ?', [currentAdminUsername]);
    if (currentAdmin.length === 0) {
      adminConnection.release();
      return res.status(401).json({
        status: 'error',
        message: '只有管理员才能添加新管理员'
      });
    }
    
    // 检查用户名是否已存在
    const [existingAdmins] = await adminConnection.execute('SELECT id FROM admins WHERE username = ?', [username]);
    if (existingAdmins.length > 0) {
      adminConnection.release();
      return res.status(409).json({
        status: 'error',
        message: '用户名已存在'
      });
    }
    
    // 创建新管理员
    const hashedPasswordObj = hashPassword(password);
    await adminConnection.execute(
      'INSERT INTO admins (username, password, salt) VALUES (?, ?, ?)',
      [username, hashedPasswordObj.password, hashedPasswordObj.salt]
    );
    
    // 记录活动
    await adminConnection.execute(
      'INSERT INTO admin_activities (admin_id, action) VALUES (?, ?)',
      [currentAdmin[0].id, `添加新管理员: ${username}`]
    );
    
    adminConnection.release();
    
    return res.json({
      status: 'success',
      message: '管理员添加成功'
    });
  } catch (error) {
    console.error('添加管理员错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

/**
 * 获取所有留言接口
 * @route GET /api/messages
 * @returns {Array} 留言列表
 */
app.get('/api/messages', async (req, res) => {
  let connection;
  try {
    connection = await userPool.getConnection();
    
    // 查询所有留言，按时间倒序排列
    const [messages] = await connection.execute(
      'SELECT id, username, content, DATE_FORMAT(time, "%Y-%m-%d %H:%i:%s") as time, isReplied FROM messages ORDER BY time DESC'
    );
    
    res.status(200).json({
      status: 'success',
      data: messages
    });
  } catch (error) {
    console.error('获取留言时发生错误:', error);
    res.status(500).json({ status: 'error', message: '服务器内部错误' });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * 添加新留言接口
 * @route POST /api/messages
 * @param {Object} req.body - 包含username和content
 * @returns {Object} 添加结果和新留言信息
 */
app.post('/api/messages', async (req, res) => {
  let connection;
  try {
    const { username, content } = req.body;
    
    // 类型检查
    if (!username || !content || typeof username !== 'string' || typeof content !== 'string') {
      return res.status(400).json({ status: 'error', message: '用户名和留言内容不能为空且必须是字符串' });
    }
    
    // 验证内容长度
    if (content.length < 1 || content.length > 1000) {
      return res.status(400).json({ status: 'error', message: '留言内容长度必须在1-1000个字符之间' });
    }

    connection = await userPool.getConnection();
    
    // 插入新留言
    const [result] = await connection.execute(
      'INSERT INTO messages (username, content) VALUES (?, ?)',
      [username, content]
    );
    
    // 查询新添加的留言
    const [newMessages] = await connection.execute(
      'SELECT id, username, content, DATE_FORMAT(time, "%Y-%m-%d %H:%i:%s") as time, isReplied FROM messages WHERE id = ?',
      [result.insertId]
    );
    
    const newMessage = newMessages[0];
    
    // 记录留言活动
    await logActivity(username, '添加留言');
    
    res.status(201).json({
      status: 'success',
      message: '留言添加成功',
      data: newMessage
    });
  } catch (error) {
    console.error('添加留言时发生错误:', error);
    res.status(500).json({ status: 'error', message: '服务器内部错误' });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * 删除留言接口
 * @route DELETE /api/messages/:id
 * @param {number} req.params.id - 留言ID
 * @returns {Object} 删除结果
 */
app.delete('/api/messages/:id', async (req, res) => {
  let connection;
  try {
    const messageId = parseInt(req.params.id);
    
    // 验证ID是否有效
    if (isNaN(messageId) || messageId <= 0) {
      return res.status(400).json({ status: 'error', message: '无效的留言ID' });
    }
    
    connection = await userPool.getConnection();
    
    // 先查询留言信息以记录活动
    const [messages] = await connection.execute('SELECT username FROM messages WHERE id = ?', [messageId]);
    if (messages.length === 0) {
      return res.status(404).json({ status: 'error', message: '留言不存在' });
    }
    const messageUsername = messages[0].username;
    
    // 执行删除操作
    const [result] = await connection.execute(
      'DELETE FROM messages WHERE id = ?',
      [messageId]
    );
    
    // 记录删除留言活动
    await logActivity(req.headers['x-username'] || 'system', `删除留言，留言作者: ${messageUsername}`);
    
    res.status(200).json({
      status: 'success',
      message: '留言删除成功'
    });
  } catch (error) {
    console.error('删除留言时发生错误:', error);
    res.status(500).json({ status: 'error', message: '服务器内部错误' });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * 更新留言状态接口
 * @route PUT /api/messages/:id/status
 * @param {number} req.params.id - 留言ID
 * @param {Object} req.body - 包含isReplied状态
 * @returns {Object} 更新结果
 */
app.put('/api/messages/:id/status', async (req, res) => {
  let connection;
  try {
    const messageId = parseInt(req.params.id);
    const { isReplied } = req.body;
    
    // 验证参数
    if (isNaN(messageId) || messageId <= 0) {
      return res.status(400).json({ status: 'error', message: '无效的留言ID' });
    }
    
    if (typeof isReplied !== 'boolean') {
      return res.status(400).json({ status: 'error', message: 'isReplied必须是布尔值' });
    }
    
    connection = await userPool.getConnection();
    
    // 更新留言状态
    const [result] = await connection.execute(
      'UPDATE messages SET isReplied = ? WHERE id = ?',
      [isReplied, messageId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: '留言不存在' });
    }
    
    // 记录更新留言状态活动
    await logActivity(req.headers['x-username'] || 'system', `更新留言状态为${isReplied ? '已回复' : '未回复'}`);
    
    res.status(200).json({
      status: 'success',
      message: '留言状态更新成功'
    });
  } catch (error) {
    console.error('更新留言状态时发生错误:', error);
    res.status(500).json({ status: 'error', message: '服务器内部错误' });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * 获取所有用户接口
 * @route GET /api/users
 * @returns {Array} 用户列表
 */
app.get('/api/users', async (req, res) => {
  let connection;
  try {
    connection = await userPool.getConnection();
    
    // 查询所有用户，但不返回密码和盐值信息 - 包含iPhone字段
    const [users] = await connection.execute(
      'SELECT id, username, iPhone, role, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (error) {
    console.error('获取用户列表时发生错误:', error);
    res.status(500).json({ status: 'error', message: '服务器内部错误' });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * 删除用户接口
 * @route DELETE /api/users/:id
 * @param {number} req.params.id - 用户ID
 * @returns {Object} 删除结果
 */
app.delete('/api/users/:id', async (req, res) => {
  let connection;
  try {
    const userId = parseInt(req.params.id);
    
    // 验证ID是否有效
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ status: 'error', message: '无效的用户ID' });
    }
    
    // 不允许删除默认管理员账户（ID=1）
    if (userId === 1) {
      return res.status(403).json({ status: 'error', message: '不允许删除默认管理员账户' });
    }
    
    connection = await userPool.getConnection();
    
    // 检查是否为管理员用户
    const [adminCheck] = await connection.execute(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );
    
    if (adminCheck.length > 0 && adminCheck[0].role === 'admin') {
      return res.status(403).json({ status: 'error', message: '不能删除管理员账号' });
    }
    
    // 先查询用户信息以记录活动
    const [users] = await connection.execute('SELECT username FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ status: 'error', message: '用户不存在' });
    }
    const username = users[0].username;
    
    // 执行删除操作
    const [result] = await connection.execute(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    
    // 记录删除用户活动
    await logActivity(req.headers['x-username'] || 'system', `删除用户: ${username}`);
    
    res.status(200).json({
      status: 'success',
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户时发生错误:', error);
    res.status(500).json({ status: 'error', message: '服务器内部错误' });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * 添加用户接口（管理员功能）
 * @route POST /api/users
 * @param {Object} req.body - 包含username、password和role
 * @returns {Object} 添加结果和新用户信息
 */
app.post('/api/users', async (req, res) => {
  let connection;
  try {
    const { username, password, role, iPhone } = req.body;
    
    // 类型检查
    if (!username || !password || !role || 
        typeof username !== 'string' || 
        typeof password !== 'string' || 
        typeof role !== 'string') {
      return res.status(400).json({ status: 'error', message: '用户名、密码和角色不能为空且必须是字符串' });
    }
    
    // 验证输入长度和角色合法性
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ status: 'error', message: '用户名长度必须在3-20个字符之间' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ status: 'error', message: '密码长度不能少于6个字符' });
    }
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ status: 'error', message: '角色必须是user或admin' });
    }

    connection = await userPool.getConnection();
    
    // 检查用户名是否已存在
    const [existingUsers] = await connection.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ status: 'error', message: '用户名已存在' });
    }
    
    // 生成密码盐和哈希
    const { salt, password: hashedPassword } = hashPassword(password);
    
    // 插入新用户 - 包含iPhone字段
    const [result] = await connection.execute(
      'INSERT INTO users (username, password, iPhone, salt, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, iPhone || null, salt, role]
    );
    
    // 查询新添加的用户 - 包含iPhone字段
    const [newUsers] = await connection.execute(
      'SELECT id, username, iPhone, role, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") as created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    
    // 记录添加用户活动
    await logActivity(req.headers['x-username'] || 'system', `添加用户: ${username}，角色: ${role}`);
    
    res.status(201).json({
      status: 'success',
      message: '用户添加成功',
      data: newUsers[0]
    });
  } catch (error) {
    console.error('添加用户时发生错误:', error);
    res.status(500).json({ status: 'error', message: '服务器内部错误' });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * 更新用户接口（管理员功能）
 * @route PUT /api/users/:id
 * @param {number} req.params.id - 用户ID
 * @param {Object} req.body - 包含username、password和role等更新信息
 * @returns {Object} 更新结果
 */
app.put('/api/users/:id', async (req, res) => {
  let connection;
  try {
    const userId = parseInt(req.params.id);
    const { username, password, role, iPhone } = req.body;
    
    // 类型检查
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ status: 'error', message: '用户ID必须是有效的数字' });
    }
    
    // 不允许修改默认管理员账户
    if (userId === 1) {
      return res.status(403).json({ status: 'error', message: '不允许修改默认管理员账户' });
    }

    connection = await userPool.getConnection();
    
    // 检查用户是否存在
    const [existingUsers] = await connection.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ status: 'error', message: '用户不存在' });
    }
    
    // 准备更新数据
    const updateFields = [];
    const updateValues = [];
    
    if (username && typeof username === 'string') {
      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ status: 'error', message: '用户名长度必须在3-20个字符之间' });
      }
      // 检查新用户名是否已被其他用户使用
      const [otherUsers] = await connection.execute(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );
      if (otherUsers.length > 0) {
        return res.status(409).json({ status: 'error', message: '用户名已被使用' });
      }
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    
    if (password && typeof password === 'string') {
      if (password.length < 6) {
        return res.status(400).json({ status: 'error', message: '密码长度不能少于6个字符' });
      }
      const { salt, password: hashedPassword } = hashPassword(password);
      updateFields.push('password = ?, salt = ?');
      updateValues.push(hashedPassword, salt);
    }
    
    if (role && typeof role === 'string') {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ status: 'error', message: '角色必须是user或admin' });
      }
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    
    // 处理iPhone字段更新
    if (iPhone !== undefined) {
      // iPhone可以设置为null，但如果提供了值必须是字符串
      if (iPhone !== null && typeof iPhone !== 'string') {
        return res.status(400).json({ status: 'error', message: 'iPhone必须是字符串或null' });
      }
      // 验证iPhone长度
      if (iPhone && iPhone.length > 20) {
        return res.status(400).json({ status: 'error', message: 'iPhone长度不能超过20个字符' });
      }
      updateFields.push('iPhone = ?');
      updateValues.push(iPhone);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ status: 'error', message: '没有提供要更新的字段' });
    }
    
    // 执行更新操作
    updateValues.push(userId);
    await connection.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    // 查询更新后的用户 - 包含iPhone字段
    const [updatedUsers] = await connection.execute(
      'SELECT id, username, iPhone, role, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") as created_at FROM users WHERE id = ?',
      [userId]
    );
    
    // 记录更新用户活动
    await logActivity(req.headers['x-username'] || 'system', `更新用户信息，用户ID: ${userId}`);
    
    res.status(200).json({
      status: 'success',
      message: '用户更新成功',
      data: updatedUsers[0]
    });
  } catch (error) {
    console.error('更新用户时发生错误:', error);
    res.status(500).json({ status: 'error', message: '服务器内部错误' });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * 获取活动日志接口
 * @route GET /api/activities
 * @returns {Array} 活动日志列表
 */
app.get('/api/activities', async (req, res) => {
  let connection;
  try {
    connection = await userPool.getConnection();
    
    // 查询活动日志，按时间倒序排列
    const [activities] = await connection.execute(
      'SELECT id, username, action, DATE_FORMAT(time, "%Y-%m-%d %H:%i:%s") as time FROM activity_logs ORDER BY time DESC LIMIT 100'
    );
    
    res.status(200).json({
      status: 'success',
      data: activities
    });
  } catch (error) {
    console.error('获取活动日志时发生错误:', error);
    res.status(500).json({ status: 'error', message: '服务器内部错误' });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * 获取统计数据接口
 * @route GET /api/statistics
 * @returns {Object} 统计数据
 */
/**
 * 获取页面内容接口
 * @route GET /api/pages/:pageName/:sectionName
 * @param {string} req.params.pageName - 页面名称
 * @param {string} req.params.sectionName - 内容区域名称
 * @returns {Object} 页面内容
 */
app.get('/api/pages/:pageName/:sectionName', async (req, res) => {
  let connection;
  try {
    const { pageName, sectionName } = req.params;
    
    // 类型检查
    if (!pageName || !sectionName || typeof pageName !== 'string' || typeof sectionName !== 'string') {
      return res.status(400).json({ status: 'error', message: '页面名称和区域名称不能为空且必须是字符串' });
    }
    
    connection = await userPool.getConnection();
    
    const [results] = await connection.execute(
      'SELECT * FROM pages WHERE page_name = ? AND section_name = ?',
      [pageName, sectionName]
    );
    
    if (results.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: null,
        message: '内容不存在，返回空'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: results[0]
    });
  } catch (error) {
    console.error('获取页面内容时发生错误:', error);
    res.status(500).json({ status: 'error', message: '服务器内部错误' });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * 更新页面内容接口
 * @route PUT /api/pages/:pageName/:sectionName
 * @param {string} req.params.pageName - 页面名称
 * @param {string} req.params.sectionName - 内容区域名称
 * @param {Object} req.body - 包含content和可选的contentType
 * @returns {Object} 更新结果
 */
app.put('/api/pages/:pageName/:sectionName', async (req, res) => {
  let connection;
  try {
    const { pageName, sectionName } = req.params;
    const { content, contentType = 'html' } = req.body;
    
    // 类型检查
    if (!pageName || !sectionName || typeof pageName !== 'string' || typeof sectionName !== 'string') {
      return res.status(400).json({ status: 'error', message: '页面名称和区域名称不能为空且必须是字符串' });
    }
    
    if (content === undefined || content === null) {
      return res.status(400).json({ status: 'error', message: '内容不能为空' });
    }
    
    connection = await userPool.getConnection();
    
    // 尝试更新，如果不存在则插入
    const [updateResult] = await connection.execute(
      `INSERT INTO pages (page_name, section_name, content, content_type) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE content = VALUES(content), content_type = VALUES(content_type)`,
      [pageName, sectionName, content, contentType]
    );
    
    // 记录活动日志
    await logActivity(req.headers['x-username'] || 'admin', `更新页面内容: ${pageName} - ${sectionName}`);
    
    res.status(200).json({
      status: 'success',
      message: updateResult.affectedRows > 0 ? '页面内容更新成功' : '页面内容未发生变化'
    });
  } catch (error) {
    console.error('更新页面内容时发生错误:', error);
    res.status(500).json({ status: 'error', message: '服务器内部错误' });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * 获取特定页面的所有内容部分
 * @route GET /api/pages/:pageName
 * @param {string} req.params.pageName - 页面名称
 * @returns {Array} 页面所有内容部分
 */
app.get('/api/pages/:pageName', async (req, res) => {
  let connection;
  try {
    const { pageName } = req.params;
    
    // 类型检查
    if (!pageName || typeof pageName !== 'string') {
      return res.status(400).json({ status: 'error', message: '页面名称不能为空且必须是字符串' });
    }
    
    connection = await userPool.getConnection();
    
    const [results] = await connection.execute(
      'SELECT * FROM pages WHERE page_name = ? ORDER BY section_name',
      [pageName]
    );
    
    res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (error) {
    console.error('获取页面所有内容时发生错误:', error);
    res.status(500).json({ status: 'error', message: '服务器内部错误' });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * 删除页面内容接口
 * @route DELETE /api/pages/:pageName/:sectionName
 * @param {string} req.params.pageName - 页面名称
 * @param {string} req.params.sectionName - 内容区域名称
 * @returns {Object} 删除结果
 */
app.delete('/api/pages/:pageName/:sectionName', async (req, res) => {
  let connection;
  try {
    const { pageName, sectionName } = req.params;
    
    // 类型检查
    if (!pageName || !sectionName || typeof pageName !== 'string' || typeof sectionName !== 'string') {
      return res.status(400).json({ status: 'error', message: '页面名称和区域名称不能为空且必须是字符串' });
    }
    
    connection = await userPool.getConnection();
    
    const [result] = await connection.execute(
      'DELETE FROM pages WHERE page_name = ? AND section_name = ?',
      [pageName, sectionName]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: '指定的页面内容不存在' });
    }
    
    // 记录活动日志
    await logActivity(req.headers['x-username'] || 'admin', `删除页面内容: ${pageName} - ${sectionName}`);
    
    res.status(200).json({
      status: 'success',
      message: '页面内容删除成功'
    });
  } catch (error) {
    console.error('删除页面内容时发生错误:', error);
    res.status(500).json({ status: 'error', message: '服务器内部错误' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/statistics', async (req, res) => {
  let connection;
  try {
    connection = await userPool.getConnection();
    
    // 获取用户总数
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    // 获取留言总数
    const [messageCount] = await connection.execute('SELECT COUNT(*) as count FROM messages');
    
    // 获取今日留言数
    const [todayMessageCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM messages WHERE DATE(time) = CURDATE()'
    );
    
    // 获取未回复留言数
    const [unrepliedMessageCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM messages WHERE isReplied = 0'
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        totalUsers: userCount[0].count,
        totalMessages: messageCount[0].count,
        todayMessages: todayMessageCount[0].count,
        unrepliedMessages: unrepliedMessageCount[0].count
      }
    });
  } catch (error) {
    console.error('获取统计数据时发生错误:', error);
    res.status(500).json({ status: 'error', message: '服务器内部错误' });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * 验证Token接口
 * @route POST /api/validate-token
 * @param {Object} req.body - 包含token
 * @returns {Object} Token验证结果
 */
app.post('/api/validate-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Token不能为空' });
    }
    
    // 简单的token验证逻辑
    // 实际应用中应使用JWT并验证过期时间和签名
    if (token.startsWith('token_')) {
      // 从token中提取用户名信息（格式: token_timestamp_username_random）
      const tokenParts = token.split('_');
      const username = tokenParts[2];
      
      // 检查用户是否存在
      let connection = await userPool.getConnection();
      const [users] = await connection.execute('SELECT username, role FROM users WHERE username = ?', [username]);
      connection.release();
      
      if (users.length > 0) {
        return res.status(200).json({
          status: 'success',
          valid: true,
          user: {
            username: users[0].username,
            role: users[0].role
          }
        });
      }
    }
    
    res.status(401).json({
      status: 'error',
      valid: false,
      message: 'Token无效或已过期'
    });
  } catch (error) {
    console.error('验证Token时发生错误:', error);
    res.status(500).json({ status: 'error', message: '服务器内部错误' });
  }
});

/**
 * 404处理中间件
 * 当请求的路由不存在时返回404响应
 */
app.use((req, res, next) => {
  // 尝试直接提供HTML文件
  const filePath = path.join(__dirname, req.path);
  
  if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
    res.sendFile(filePath);
  } else {
    // 如果是API请求，返回404 JSON响应
    if (req.path.startsWith('/api')) {
      res.status(404).json({ status: 'error', message: '接口不存在' });
    } else {
      // 否则返回404页面
      res.status(404).send('页面不存在');
    }
  }
});

/**
 * 错误处理中间件
 * 捕获并处理应用中的所有错误
 */
app.use((err, req, res, next) => {
  console.error('未捕获的错误:', err);
  res.status(500).json({ status: 'error', message: '服务器内部错误' });
});

// 根路径重定向到天官赐福首页
app.get('/', (req, res) => {
  res.redirect('/天官赐福首页.html');
});

// 启动服务器
app.listen(PORT, async () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  // 启动时检查数据库连接，但不阻塞服务器启动
  checkDatabaseConnection().catch(err => {
    console.error('数据库初始化失败:', err);
  });
  console.log('静态文件服务已启动，可以访问HTML页面');
});