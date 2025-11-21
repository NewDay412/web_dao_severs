/**
 * 生产环境主应用文件
 * 支持域名访问、SSL和性能优化
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const fs = require('fs');
const https = require('https');

// 导入生产环境配置
const config = require('./config/production');

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
 * 域名验证中间件
 * 确保只允许配置的域名访问
 */
const domainValidation = (req, res, next) => {
  const host = req.headers.host;
  const origin = req.headers.origin;
  
  // 允许直接IP访问和配置的域名
  const allowedHosts = [
    '47.83.203.60',
    'localhost:3003',
    'localhost'
  ].concat(config.server.domains);
  
  // 检查host是否在允许列表中
  const isAllowed = allowedHosts.some(allowedHost => {
    return host === allowedHost || host.startsWith(allowedHost + ':') || 
           host.includes(allowedHost);
  });
  
  if (!isAllowed) {
    console.warn(`非法域名访问: ${host} from ${req.ip}`);
    return res.status(403).json({
      status: 'error',
      message: '访问被拒绝：域名未授权'
    });
  }
  
  next();
};

/**
 * 安全中间件配置 - 生产环境增强版
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

/**
 * 生产环境跨域配置
 */
const corsOptions = {
  origin: function (origin, callback) {
    // 允许没有origin的请求
    if (!origin) return callback(null, true);
    
    // 检查是否在允许的域名列表中
    const allowedOrigins = config.security.cors.allowedOrigins;
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`非法跨域请求: ${origin}`);
      callback(new Error('跨域请求被拒绝'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 3600
};
app.use(cors(corsOptions));

/**
 * 域名验证
 */
app.use(domainValidation);

/**
 * 性能优化中间件
 */
app.use(compression()); // Gzip压缩

/**
 * 生产环境请求日志
 */
app.use(morgan('combined', {
  stream: fs.createWriteStream(path.join(__dirname, 'logs/access.log'), { flags: 'a' })
}));

// 控制台输出简化日志
app.use(morgan('tiny'));

/**
 * 数据解析中间件
 */
app.use(express.json({ limit: config.security.upload.maxFileSize }));
app.use(express.urlencoded({ extended: true, limit: config.security.upload.maxFileSize }));

/**
 * 静态文件服务 - 生产环境优化
 */
app.use(express.static(path.join(__dirname, '..'), {
  maxAge: config.performance.cache.maxAge * 1000, // 缓存1小时
  etag: true,
  lastModified: true
}));

app.use('/user-web', express.static(path.join(__dirname, '../user-web'), {
  maxAge: config.performance.cache.maxAge * 1000
}));

app.use('/admin-web', express.static(path.join(__dirname, '../admin-web'), {
  maxAge: config.performance.cache.maxAge * 1000
}));

app.use('/img', express.static(path.join(__dirname, '../img'), {
  maxAge: config.performance.cache.maxAge * 1000
}));

app.use('/css', express.static(path.join(__dirname, '../css'), {
  maxAge: config.performance.cache.maxAge * 1000
}));

app.use('/js', express.static(path.join(__dirname, '../js'), {
  maxAge: config.performance.cache.maxAge * 1000
}));

// 图片上传目录
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: config.performance.cache.maxAge * 1000
}));

/**
 * 健康检查接口
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: '生产环境服务运行正常',
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
    version: '1.0.0',
    environment: 'production',
    domain: req.headers.host
  });
});

/**
 * 根路径重定向
 */
app.get('/', (req, res) => {
  res.redirect('/user-web/天官赐福首页.html');
});

/**
 * 统一登录接口
 */
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      status: 'error',
      message: '用户名和密码不能为空'
    });
  }
  
  try {
    // 导入模型
    const { UserModel } = require('./models/user.model');
    const AdminModel = require('./models/admin.model');
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = config.security.jwtSecret;
    
    // 先尝试管理员登录
    try {
      const admin = await AdminModel.login(username, password);
      const token = jwt.sign(
        { username: admin.username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '2h' }
      );
      
      return res.json({
        status: 'success',
        token,
        user: { username: admin.username, role: 'admin' },
        message: '管理员登录成功'
      });
    } catch (adminError) {
      // 管理员登录失败，尝试用户登录
      try {
        const user = await UserModel.login(username, password);
        const token = jwt.sign(
          { username: user.username, role: 'user' },
          JWT_SECRET,
          { expiresIn: '2h' }
        );
        
        return res.json({
          status: 'success',
          token,
          user: { username: user.username, role: 'user' },
          message: '用户登录成功'
        });
      } catch (userError) {
        // 两种登录都失败
        if (adminError.message === 'USER_NOT_FOUND' && userError.message === 'USER_NOT_FOUND') {
          return res.status(404).json({
            status: 'error',
            message: '该用户不存在，请注册'
          });
        } else {
          return res.status(401).json({
            status: 'error',
            message: '用户名或密码错误'
          });
        }
      }
    }
  } catch (error) {
    console.error('登录失败:', error);
    return res.status(500).json({
      status: 'error',
      message: '登录失败，请稍后重试'
    });
  }
});

/**
 * 路由配置
 */
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user-chat', userChatRoutes);
app.use('/api/admin-chat', adminChatRoutes);

/**
 * 404错误处理
 */
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: '请求的资源不存在',
    path: req.originalUrl
  });
});

/**
 * 全局错误处理中间件
 */
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({
    status: 'error',
    message: '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

/**
 * 启动服务器
 */
const startServer = () => {
  const PORT = config.server.port;
  const HOST = config.server.host;
  
  if (config.server.ssl.enabled) {
    // HTTPS服务器
    try {
      const privateKey = fs.readFileSync(config.server.ssl.keyPath, 'utf8');
      const certificate = fs.readFileSync(config.server.ssl.certPath, 'utf8');
      const credentials = { key: privateKey, cert: certificate };
      
      const httpsServer = https.createServer(credentials, app);
      
      httpsServer.listen(PORT, HOST, () => {
        console.log(`🚀 HTTPS服务器启动成功`);
        console.log(`📍 服务地址: https://${HOST}:${PORT}`);
        console.log(`🌐 支持域名: ${config.server.domains.join(', ')}`);
        console.log(`🔒 SSL模式: 已启用`);
        console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
        console.log('='.repeat(60));
      });
      
      return httpsServer;
    } catch (sslError) {
      console.error('SSL证书加载失败:', sslError.message);
      console.log('回退到HTTP模式...');
    }
  }
  
  // HTTP服务器
  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 HTTP服务器启动成功`);
    console.log(`📍 服务地址: http://${HOST}:${PORT}`);
    console.log(`🌐 支持域名: ${config.server.domains.join(', ')}`);
    console.log(`🔒 SSL模式: ${config.server.ssl.enabled ? '启用失败，使用HTTP' : '未启用'}`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
    console.log('='.repeat(60));
  });
  
  return server;
};

// 导出应用和启动函数
module.exports = { app, startServer };

// 如果直接运行此文件，则启动服务器
if (require.main === module) {
  startServer();
}