const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');

// 导入路由
const userRoutes = require('./api/user.routes');
const adminRoutes = require('./api/admin.routes');
const chatRoutes = require('./api/chat.routes');
const userChatRoutes = require('./api/userChat.routes');
const adminChatRoutes = require('./api/adminChat.routes');

// 导入数据库配置
const db = require('./config/db');

// 导入模型
const { UserModel, AdminModel } = require('./models/user.model');

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// 创建Express应用实例
const app = express();
const PORT = process.env.PORT || 3003;

/**
 * 安全中间件配置
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "*.baidu.com"],
      fontSrc: ["'self'", "data:", "fonts.gstatic.com"],
      connectSrc: ["'self'", "rumt-zh.com"],
    },
  },
})); // 安全头部设置

/**
 * 跨域配置
 * 支持前端开发常用端口
 */
const corsOptions = {
  origin: function (origin, callback) {
    // 允许所有来源访问（开发环境下）
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// 请求体解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 日志中间件
app.use(morgan('dev'));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * 健康检查接口
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: '服务运行正常',
  });
});

/**
 * 登录接口
 * 支持管理员和普通用户登录
 */
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const errorId = Date.now();

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: '用户名和密码不能为空',
        errorId
      });
    }

    // 先尝试管理员登录
    try {
      let user = await AdminModel.login(username, password);
      if (user) {
        const token = jwt.sign(
          { username: user.username, role: user.role },
          JWT_SECRET,
          { expiresIn: '2h' }
        );

        return res.json({
          success: true,
          token,
          user: { username: user.username, role: user.role },
          message: '管理员登录成功'
        });
      }
    } catch (err) {
      console.error(`[${errorId}] 管理员登录失败:`, err);
      // 不立即返回错误，继续尝试普通用户登录
    }

    // 再尝试普通用户登录
    try {
      let user = await UserModel.login(username, password);
      if (user) {
        const token = jwt.sign(
          { username: user.username, role: 'user' },
          JWT_SECRET,
          { expiresIn: '2h' }
        );

        return res.json({
          success: true,
          token,
          user: { username: user.username, role: 'user' },
          message: '用户登录成功'
        });
      }
    } catch (err) {
      console.error(`[${errorId}] 用户登录失败:`, err);
      // 不立即返回错误，继续尝试默认账号
    }

    // 默认管理员账号（保留兼容性）
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign(
        { username: 'admin', role: 'admin' },
        JWT_SECRET,
        { expiresIn: '2h' }
      );

      return res.json({
        success: true,
        token,
        user: { username: 'admin', role: 'admin' },
        message: '管理员登录成功'
      });
    }

    // 默认用户账号（保留兼容性）
    if (username === 'user1' && password === 'password123') {
      const token = jwt.sign(
        { username: 'user1', role: 'user' },
        JWT_SECRET,
        { expiresIn: '2h' }
      );

      return res.json({
        success: true,
        token,
        user: { username: 'user1', role: 'user' },
        message: '用户登录成功'
      });
    }

    // 登录失败
    return res.status(401).json({
      success: false,
      error: '用户名或密码错误',
      errorId
    });
  } catch (error) {
    // 记录错误日志
    const errorId = Date.now();
    console.error(`[${errorId}] 登录接口异常:`, error);
    // 返回友好的错误响应
    res.status(500).json({
      success: false,
      error: '服务器内部错误，请稍后重试',
      errorId
    });
  }
});

// 注册路由
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user/chat', userChatRoutes);
app.use('/api/admin/chat', adminChatRoutes);

/**
 * 404处理中间件
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在',
    errorId: new Date().getTime()
  });
});

/**
 * 全局错误处理中间件
 */
app.use((err, req, res, next) => {
  // 记录错误日志
  const errorId = new Date().getTime();
  console.error(`[${errorId}] 全局错误:`, err);

  // 返回友好的错误响应
  res.status(500).json({
    success: false,
    error: '服务器内部错误，请稍后重试',
    errorId
  });
});

/**
 * 启动服务器函数
 * @returns {Promise<void>}
 */
async function startServer() {
  try {
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
      console.log(`👤 API接口: /api/user | /api/admin`);
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
