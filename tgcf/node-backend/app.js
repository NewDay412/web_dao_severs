const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 导入路由
const userRoutes = require('./api/user.routes');
const adminRoutes = require('./api/admin.routes');
const chatRoutes = require('./api/chat.routes');
const userChatRoutes = require('./api/userChat.routes');
const adminChatRoutes = require('./api/adminChat.routes');

// 导入数据库配置
const db = require('./config/db');

// 创建Express应用实例
const app = express();


/**
 * 数据解析中间件
 */
app.use(express.json({ limit: '10mb' })); // JSON解析，设置大小限制
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL编码解析const PORT = process.env.PORT || 3003;
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // 统一JWT密钥

// 数据库基础配置（抽离到外部，避免重复定义）
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Mysql'
};

/**
 * 统一登录接口
 * 逻辑优先级：1. 管理员数据库验证 → 2. 用户数据库验证 → 3. 硬编码账号兜底
 */
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 1. 校验请求参数
    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: '用户名和密码不能为空'
      });
    }

    let userInfo = null;
    let isAdmin = false;
    
    // 2. 尝试从管理员数据库验证（web_admindao → admins表）
    try {
      const adminConnection = await mysql.createConnection({
        ...dbConfig,
        database: 'web_admindao'
      });
      
      console.log('尝试管理员登录，用户名:', username);
      
      // 查询管理员信息（LIMIT 1 避免多条数据）
      const [adminRows] = await adminConnection.execute(
        'SELECT id, username, password, role FROM admins WHERE username = ? LIMIT 1',
        [username.trim()] // 去除用户名首尾空格，避免查询失败
      );
      
      await adminConnection.end(); // 关闭连接
      
      // 验证管理员密码
      if (adminRows.length > 0) {
        const admin = adminRows[0];
        console.log('找到管理员账号，进行密码验证...');
        
        let passwordMatch;
        try {
          // 优先使用bcrypt验证（数据库密码应为加密格式）
          passwordMatch = await bcrypt.compare(password, admin.password);
        } catch (e) {
          // bcrypt验证失败时，降级为明文比较（兼容旧数据）
          passwordMatch = (password === admin.password);
          console.log('bcrypt验证失败，使用明文密码比较');
        }
        
        if (passwordMatch) {
          isAdmin = true;
          userInfo = {
            id: admin.id,
            username: admin.username,
            role: admin.role || 'admin'
          };
        }
      }
    } catch (adminError) {
      console.warn('管理员数据库验证失败，继续尝试用户数据库:', adminError.message);
    }
    
    // 3. 管理员验证失败，尝试从用户数据库验证（web_userdao → users表）
    if (!userInfo) {
      try {
        const userConnection = await mysql.createConnection({
          ...dbConfig,
          database: 'web_userdao'
        });
        
        console.log('尝试用户登录，用户名:', username);
        
        // 查询用户信息
        const [userRows] = await userConnection.execute(
          'SELECT id, username, password FROM users WHERE username = ? LIMIT 1',
          [username.trim()]
        );
        
        await userConnection.end(); // 关闭连接
        
        // 验证用户密码
        if (userRows.length > 0) {
          const user = userRows[0];
          console.log('找到用户账号，进行密码验证...');
          
          let passwordMatch;
          try {
            passwordMatch = await bcrypt.compare(password, user.password);
          } catch (e) {
            passwordMatch = (password === user.password);
            console.log('bcrypt验证失败，使用明文密码比较');
          }
          
          if (passwordMatch) {
            userInfo = {
              id: user.id,
              username: user.username,
              role: 'user'
            };
          }
        }
      } catch (userError) {
        console.warn('用户数据库验证失败:', userError.message);
      }
    }
    
    // 4. 数据库验证失败，使用硬编码账号兜底（兼容测试场景）
    if (!userInfo) {
      console.log('数据库验证失败，尝试硬编码账号验证');
      
      // 硬编码管理员账号
      if (username === 'admin' && password === 'admin123') {
        userInfo = { username: 'admin', role: 'admin' };
        isAdmin = true;
      }
      // 硬编码普通用户账号
      else if (username === 'user1' && password === 'password123') {
        userInfo = { username: 'user1', role: 'user' };
      }
    }
    
    // 5. 验证成功：生成JWT Token并返回
    if (userInfo) {
      const token = jwt.sign(
        { username: userInfo.username, role: userInfo.role },
        JWT_SECRET,
        { expiresIn: '2h' } // Token有效期2小时
      );
      
      return res.json({
        status: 'success',
        token,
        user: { 
          id: userInfo.id || 'default-' + Date.now(), // 兜底ID
          username: userInfo.username, 
          role: userInfo.role 
        },
        message: isAdmin ? '管理员登录成功' : '用户登录成功'
      });
    }
    
    // 6. 所有验证均失败
    console.log('登录失败：用户名或密码错误，用户名:', username);
    return res.status(401).json({
      status: 'error',
      message: '用户名或密码错误'
    });
    
  } catch (error) {
    console.error('登录接口异常:', error);
    return res.status(500).json({
      status: 'error',
      message: '登录失败，请稍后重试'
    });
  }
});

/**
 * 中间件配置（补充缺失的核心中间件）
 */
app.use(cors({
  origin: ['https://longlong.baby', 'http://dao.longlong.baby', 'http://longlong.baby1', 'http://localhost:3003', 'http://47.83.203.60', 'http://localhost:8080', 'http://localhost:8000', 'http://localhost'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet()); // 安全头部配置
app.use(morgan('dev')); // 日志中间件

/**
 * 静态文件服务配置
 */
app.use('/user-web', express.static(path.join(__dirname, '../user-web')));
app.use('/admin-web', express.static(path.join(__dirname, '../admin-web')));
app.use('/img', express.static(path.join(__dirname, '../img')));
// 优先使用node-backend/uploads目录（包含实际文件）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// 其次使用根目录uploads目录（备用）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));



/**
 * 路由配置
 */
app.use('/api/user', userRoutes); // 用户接口
app.use('/api/admin', adminRoutes); // 管理员接口
app.use('/api/chat', chatRoutes); // 聊天接口（保留兼容性）
app.use('/api/user-chat', userChatRoutes); // 用户聊天接口
app.use('/api/admin-chat', adminChatRoutes); // 管理员聊天接口

/**
 * 404处理中间件
 */
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: '接口不存在',
    path: req.path,
    method: req.method,
    message: `请求的接口 ${req.method} ${req.path} 不存在`
  });
});

/**
 * 全局错误处理中间件
 */
app.use((err, req, res, next) => {
  // 记录详细错误信息
  console.error('服务器错误:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // 防止头部已发送错误
  if (res.headersSent) {
    return next(err);
  }
  
  // 返回友好的错误响应
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: '服务器内部错误，请稍后重试',
    errorId: new Date().getTime()
  });
});

/**
 * 启动服务器函数
 * @returns {Promise<void>}
 */
async function startServer() {
  try {
    // 确保PORT在函数作用域内可用
    const PORT = process.env.PORT || 3003;
    // 初始化数据库
    await db.initializeDatabase();
    console.log('✅ 数据库初始化成功');

    // 启动HTTP服务器 - 绑定到所有IP地址以支持外部访问
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 后端服务启动成功，监听端口: ${PORT}`);
      console.log(`🔍 本地访问: http://localhost:${PORT}`);
      console.log(`🌐 IP访问: http://47.83.203.60:${PORT}`);
      console.log(`🌐 域名访问: http://dao.longlong.baby:${PORT}`);
      console.log(`🌐 域名访问: http://longlong.baby:${PORT}`);
      console.log(`👤 API接口: /api/user | /api/admin | /api/login（统一登录）`);
    });

    // 设置服务器超时
    server.timeout = 120000; // 2分钟超时
    server.keepAliveTimeout = 65000; // Keep-alive超时
    server.headersTimeout = 66000; // 头部超时

    // 返回服务器实例，便于测试和关闭操作
    return server;
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

/**
 * 优雅关闭处理
 * 确保在退出时关闭数据库连接
 */
function setupGracefulShutdown() {
  process.on('SIGINT', async () => {
    console.log('正在关闭服务器...');
    try {
      if (db.pool) {
        await db.pool.end();
        console.log('✅ 数据库连接已关闭');
      }
      process.exit(0);
    } catch (err) {
      console.error('❌ 关闭数据库连接失败:', err);
      process.exit(1);
    }
  });
}

// 启动应用
if (require.main === module) {
  setupGracefulShutdown();
  startServer();
}

// 导出模块，便于测试
module.exports = {
  app,
  startServer
};