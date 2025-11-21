/**
 * 生产环境配置文件
 * 用于支持域名访问和SSL配置
 */

const path = require('path');

module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3003,
    host: process.env.HOST || '0.0.0.0',
    // 支持的域名列表
    domains: [
      'dao.longlong.baby',
      'longlong.baby',
      '47.83.203.60',
      'localhost'
    ],
    // SSL配置
    ssl: {
      enabled: process.env.SSL_ENABLED === 'true',
      keyPath: process.env.SSL_KEY_PATH || '/path/to/private.key',
      certPath: process.env.SSL_CERT_PATH || '/path/to/certificate.crt'
    }
  },
  
  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'web_dao',
    // 生产环境连接池配置
    pool: {
      max: 20,
      min: 5,
      acquire: 30030,
      idle: 10000
    }
  },
  
  // 安全配置
  security: {
    jwtSecret: process.env.JWT_SECRET || 'production_secret_key_2024',
    cors: {
      // 生产环境允许的域名
      allowedOrigins: [
        'https://dao.longlong.baby',
        'https://longlong.baby',
        'http://47.83.203.60',
        'https://47.83.203.60'
      ]
    },
    // 文件上传限制
    upload: {
      maxFileSize: '10mb',
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ]
    }
  },
  
  // 日志配置
  logging: {
    level: 'info',
    file: {
      enabled: true,
      path: path.join(__dirname, '../logs/production.log'),
      maxSize: '10m',
      maxFiles: 10
    }
  },
  
  // 性能优化配置
  performance: {
    compression: true,
    cache: {
      static: true,
      maxAge: 3600
    },
    // 集群模式配置
    cluster: {
      enabled: false,
      workers: require('os').cpus().length
    }
  }
};