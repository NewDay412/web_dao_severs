const mysql = require('mysql2/promise');
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Mysql'
};
console.log(' 数据库配置:');
console.log('   主机:', config.host);
console.log('   用户:', config.user);
console.log('   密码:', config.password ? '已配置' : '未配置');
if (process.env.DB_PASSWORD) {
  console.log('    使用环境变量中的密码');
} else {
  console.log('    使用默认密码，如需修改请设置环境变量 DB_PASSWORD');
}
async function testDatabaseConnection() {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      timeout: 60000,
      acquireTimeout: 60000,
      reconnect: true
    });
    console.log(' 数据库连接成功');
    await connection.end();
    return true;
  } catch (error) {
    console.error(' 数据库连接失败:', error.message);
    console.log(' 请检查以下配置:');
    console.log('   主机:', config.host);
    console.log('   用户名:', config.user);
    console.log('   密码:', config.password);
    console.log(' 如果密码不正确，请设置环境变量 DB_PASSWORD=你的密码');
    return false;
  }
}
const pools = {
  web_project: mysql.createPool({
    ...config,
    database: 'web_project',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  }),
  web_userdao: mysql.createPool({
    ...config,
    database: 'web_userdao',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  }),
  web_admindao: mysql.createPool({
    ...config,
    database: 'web_admindao',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  })
};
const pool = pools.web_project;
async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      charset: 'utf8mb4'
    });
    await connection.query('CREATE DATABASE IF NOT EXISTS web_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('CREATE DATABASE IF NOT EXISTS web_userdao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('CREATE DATABASE IF NOT EXISTS web_admindao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log(' 创建数据库完成');
    await connection.query('USE web_project');
    await connection.query('CREATE TABLE IF NOT EXISTS home_content (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, content TEXT, image_url VARCHAR(255), link_url VARCHAR(255), sort_order INT DEFAULT 0, is_active TINYINT DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
    await connection.query('CREATE TABLE IF NOT EXISTS carousel (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, image_url VARCHAR(255) NOT NULL, link_url VARCHAR(255), description TEXT, sort_order INT DEFAULT 0, is_active TINYINT DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
    await connection.query('CREATE TABLE IF NOT EXISTS quotes (id INT AUTO_INCREMENT PRIMARY KEY, content TEXT NOT NULL, author VARCHAR(255), source VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
    await connection.query('USE web_userdao');
    await connection.query('CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE, avatar VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
    await connection.query('USE web_admindao');
    await connection.query('CREATE TABLE IF NOT EXISTS admins (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE, role ENUM(\'admin\', \'super_admin\') DEFAULT \'admin\', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
    console.log(' 创建数据库表完成');
    await connection.query('USE web_project');
    try {
      // 检查home_content表是否为空
      const [homeContentCount] = await connection.query('SELECT COUNT(*) as count FROM home_content');
      if (homeContentCount[0].count === 0) {
        await connection.query('INSERT INTO home_content (title, content, image_url, link_url, sort_order, is_active) VALUES (天官赐福, 墨香铜臭创作的古风小说, ../img/cover.jpg, /user-web/天官赐福首页.html, 1, 1), (角色介绍, 小说中的主要角色信息, ../img/角色.jpg, /user-web/角色介绍.html, 2, 1), (剧情简介, 小说的主要剧情内容, ../img/剧情.jpg, /user-web/剧情简介.html, 3, 1)');
        console.log(' 插入首页内容数据');
      } else {
        console.log('首页内容表不为空，跳过插入');
      }
    } catch (err) {
      console.log('首页内容数据插入失败:', err.message);
    }
    try {
      // 检查carousel表是否为空
      const [carouselCount] = await connection.query('SELECT COUNT(*) as count FROM carousel');
      if (carouselCount[0].count === 0) {
        await connection.query('INSERT INTO carousel (title, image_url, link_url, description, sort_order, is_active) VALUES (天官赐福, ../img/轮播1.png, /user-web/天官赐福首页.html, 墨香铜臭创作的古风小说, 1, 1), (角色介绍, ../img/轮播2.png, /user-web/角色介绍.html, 小说中的主要角色信息, 2, 1), (剧情简介, ../img/轮播3.png, /user-web/剧情简介.html, 小说的主要剧情内容, 3, 1), (读者评价, ../img/轮播4.png, /user-web/读者评价.html, 读者的精彩评价和感想, 4, 1), (同人创作, ../img/轮播5.png, /user-web/同人创作.html, 粉丝创作的同人作品, 5, 1), (最新动态, ../img/轮播6.png, /user-web/最新动态.html, 小说和动漫的最新消息, 6, 1)');
        console.log(' 插入轮播图数据');
      } else {
        console.log('轮播图表不为空，跳过插入');
      }
    } catch (err) {
      console.log('轮播图数据插入失败:', err.message);
    }
    const [homeContentRows] = await connection.query('SELECT COUNT(*) as count FROM home_content');
    const [sampleRows] = await connection.query('SELECT title FROM home_content LIMIT 3');
    console.log(' home_content表中共有', homeContentRows[0].count, '条记录');
    console.log(' 示例内容:', sampleRows.map(row => row.title));
    await connection.query('USE web_userdao');
    const [userRows] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [sampleUsers] = await connection.query('SELECT username FROM users LIMIT 3');
    console.log(' web_userdao.users表中共有', userRows[0].count, '个用户');
    console.log(' 示例用户:', sampleUsers.map(row => row.username));
    await connection.query('USE web_admindao');
    const [adminRows] = await connection.query('SELECT COUNT(*) as count FROM admins');
    const [sampleAdmins] = await connection.query('SELECT username FROM admins LIMIT 3');
    console.log(' web_admindao.admins表中共有', adminRows[0].count, '个管理员');
    console.log(' 示例管理员:', sampleAdmins.map(row => row.username));
    await connection.end();
    console.log(' 数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
}
module.exports = {
  pool,
  pools,
  execute: async (sql, params = []) => {
    return await pool.execute(sql, params);
  },
  executeOn: async (database, sql, params = []) => {
    return await pools[database].execute(sql, params);
  },
  initializeDatabase
};
