const mysql = require('mysql2/promise');

// 创建数据库连接池
// 数据库连接配置
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Mysql'
};

// 显示当前数据库配置（不显示密码）
console.log('📊 数据库配置:');
console.log(`   主机: ${config.host}`);
console.log(`   用户: ${config.user}`);
console.log(`   密码: ${config.password ? '已配置' : '未配置'}`);
if (process.env.DB_PASSWORD) {
  console.log('   💡 使用环境变量中的密码');
} else {
  console.log('   💡 使用默认密码，如需修改请设置环境变量 DB_PASSWORD');
}

// 检查数据库连接是否正常
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
    console.log('✅ 数据库连接成功');
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.log('💡 请检查以下配置:');
    console.log(`   主机: ${config.host}`);
    console.log(`   用户名: ${config.user}`);
    console.log(`   密码: ${config.password}`);
    console.log('💡 如果密码不正确，请设置环境变量 DB_PASSWORD=你的密码');
    return false;
  }
}
// 创建多个数据库连接池
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

// 默认连接池（向后兼容）
const pool = pools.web_project;

// 检查并创建数据库和表
async function initializeDatabase() {
  try {
    // 先创建连接（不指定数据库）
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password
    });
    
    // 创建所有数据库
    await connection.query('CREATE DATABASE IF NOT EXISTS web_project');
    await connection.query('CREATE DATABASE IF NOT EXISTS web_userdao');
    await connection.query('CREATE DATABASE IF NOT EXISTS web_admindao');
    
    // 初始化web_project数据库
    await connection.query('USE web_project');
    
    // 创建首页内容表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS home_content (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        image_url VARCHAR(255),
        link_url VARCHAR(255),
        display_order INT DEFAULT 0,
        status ENUM('published', 'draft') DEFAULT 'published',
        create_time DATETIME NOT NULL,
        update_time DATETIME NOT NULL
      );
    `);
    
    // 创建剧情简介表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS story_intro (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        chapter_number INT DEFAULT 0,
        display_order INT DEFAULT 0,
        status ENUM('published', 'draft') DEFAULT 'published',
        create_time DATETIME NOT NULL,
        update_time DATETIME NOT NULL
      );
    `);
    
    // 插入默认剧情简介（仅在表为空时）
    try {
      const [storyCount] = await connection.query('SELECT COUNT(*) as count FROM story_intro');
      if (storyCount[0].count === 0) {
        await connection.query(`
          INSERT INTO story_intro (title, content, chapter_number, display_order, status, create_time, update_time)
          VALUES 
          ('天官赐福剧情简介', '八百年前，谢怜是金枝玉叶的太子殿下，风光无限的天之骄子。谁知一朝得道飞升，成为万人供奉的武神后，命途竟是急转直下，一贬再贬贬无可贬。八百年后，谢怜又双叒飞升了，这一次没有信徒也没有香火。某日收破烂归来的路上，他将一个神秘少年捡回家中，而这个少年，居然就是那位三界谈之色变的鬼王——花城。', 1, 1, 'published', NOW(), NOW()),
          ('第一章', '谢怜十七岁时，在仙乐国上元祭天游上担任扮演神武大帝的悦神武者。当华台绕城游行到第三圈，城楼上一名小儿不慎坠落，千钧一发之际，谢怜纵身跃出，如白影般逆空而上接住小儿，落地时脸上的黄金面具掉落，露出俊朗面容，引得万众欢呼。不过这一举动打乱了祭天游流程，国师和大臣们忧心不祥，想让他面壁悔过，却被谢怜以 "救人无错，无需向错误的上天道歉" 拒绝。', 2, 1, 'published', NOW(), NOW())
        `);
        console.log('✅ 插入默认剧情简介');
      }
    } catch (err) {
      console.log('剧情简介数据已存在，跳过插入');
    }
    
    // 创建角色介绍表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS character_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        image_url VARCHAR(255),
        personality TEXT,
        role_importance ENUM('main', 'supporting', 'guest') DEFAULT 'supporting',
        display_order INT DEFAULT 0,
        status ENUM('published', 'draft') DEFAULT 'published',
        create_time DATETIME NOT NULL,
        update_time DATETIME NOT NULL
      );
    `);
    
    // 创建作品评价表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS work_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        rating INT CHECK (rating BETWEEN 1 AND 5),
        content TEXT NOT NULL,
        status ENUM('approved', 'pending', 'rejected') DEFAULT 'pending',
        create_time DATETIME NOT NULL,
        update_time DATETIME NOT NULL
      );
    `);
    
    // 创建留言板表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS message_board (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        content TEXT NOT NULL,
        status ENUM('published', 'pending', 'hidden') DEFAULT 'pending',
        reply TEXT,
        create_time DATETIME NOT NULL,
        update_time DATETIME NOT NULL
      );
    `);
    
    // 检查并添加phone字段（如果表已存在但没有phone字段）
    try {
      await connection.query(`
        ALTER TABLE message_board ADD COLUMN phone VARCHAR(20) AFTER email
      `);
      console.log('✅ 已为message_board表添加phone字段');
    } catch (err) {
      // 字段已存在，忽略错误
      if (!err.message.includes('Duplicate column name')) {
        console.log('phone字段已存在或添加失败:', err.message);
      }
    }
    
    // 更新status字段枚举值（如果需要）
    try {
      await connection.query(`
        ALTER TABLE message_board MODIFY COLUMN status ENUM('published', 'pending', 'hidden') DEFAULT 'pending'
      `);
      console.log('✅ 已更新message_board表status字段枚举值');
    } catch (err) {
      console.log('更新status字段失败:', err.message);
    }
    
    // 创建导航菜单表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS navigation_menu (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        url VARCHAR(255) NOT NULL,
        parent_id INT DEFAULT NULL,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        create_time DATETIME NOT NULL,
        update_time DATETIME NOT NULL,
        FOREIGN KEY (parent_id) REFERENCES navigation_menu(id) ON DELETE CASCADE
      );
    `);
    
    // 创建基本信息表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS basic_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        label VARCHAR(100) NOT NULL,
        value TEXT NOT NULL,
        display_order INT DEFAULT 0,
        create_time DATETIME NOT NULL,
        update_time DATETIME NOT NULL
      );
    `);
    
    // 创建人物语录表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS character_quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        character_name VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        image_url VARCHAR(255),
        display_order INT DEFAULT 0,
        status ENUM('published', 'draft') DEFAULT 'published',
        create_time DATETIME NOT NULL,
        update_time DATETIME NOT NULL
      );
    `);
    
    // 创建轮播图表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS carousel_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL COMMENT '轮播图标题',
        image_url VARCHAR(500) NOT NULL COMMENT '图片URL',
        link_url VARCHAR(500) DEFAULT NULL COMMENT '点击跳转链接',
        description TEXT DEFAULT NULL COMMENT '描述',
        display_order INT DEFAULT 0 COMMENT '显示顺序',
        is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图表';
    `);
    
    // 检查并修正字段结构（兼容旧表结构）
    try {
      // 检查是否存在旧字段quote_text，如果存在则重命名为content
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'web_project' AND TABLE_NAME = 'character_quotes' AND COLUMN_NAME = 'quote_text'
      `);
      if (columns.length > 0) {
        await connection.query('ALTER TABLE character_quotes CHANGE quote_text content TEXT NOT NULL');
        console.log('✅ 已将quote_text字段重命名为content');
      }
    } catch (err) {
      console.log('quote_text字段处理:', err.message);
    }
    
    try {
      // 检查是否存在旧字段source，如果存在则重命名为image_url
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'web_project' AND TABLE_NAME = 'character_quotes' AND COLUMN_NAME = 'source'
      `);
      if (columns.length > 0) {
        await connection.query('ALTER TABLE character_quotes CHANGE source image_url VARCHAR(255)');
        console.log('✅ 已将source字段重命名为image_url');
      }
    } catch (err) {
      console.log('source字段处理:', err.message);
    }
    
    try {
      // 添加display_order字段（如果不存在）
      await connection.query('ALTER TABLE character_quotes ADD COLUMN display_order INT DEFAULT 0 AFTER image_url');
      console.log('✅ 已为character_quotes表添加display_order字段');
    } catch (err) {
      if (!err.message.includes('Duplicate column name')) {
        console.log('display_order字段处理:', err.message);
      }
    }
    
    try {
      // 删除旧的is_published字段（如果存在）
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'web_project' AND TABLE_NAME = 'character_quotes' AND COLUMN_NAME = 'is_published'
      `);
      if (columns.length > 0) {
        await connection.query('ALTER TABLE character_quotes DROP COLUMN is_published');
        console.log('✅ 已删除is_published字段');
      }
    } catch (err) {
      console.log('is_published字段处理:', err.message);
    }
    
    try {
      // 添加status字段（如果不存在）
      await connection.query('ALTER TABLE character_quotes ADD COLUMN status ENUM("published", "draft") DEFAULT "published" AFTER display_order');
      console.log('✅ 已为character_quotes表添加status字段');
    } catch (err) {
      if (!err.message.includes('Duplicate column name')) {
        console.log('status字段处理:', err.message);
      }
    }
    
    try {
      // 确保status字段类型正确
      await connection.query('ALTER TABLE character_quotes MODIFY COLUMN status ENUM("published", "draft") DEFAULT "published"');
      console.log('✅ 已修正character_quotes表status字段类型');
    } catch (err) {
      console.log('status字段类型修正:', err.message);
    }
    
    // 初始化web_userdao数据库
    await connection.query('USE web_userdao');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        sex ENUM('male', 'female', 'other') NOT NULL,
        create_time DATETIME NOT NULL,
        update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    
    // 创建用户聊天消息表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_name VARCHAR(100) NOT NULL,
        receiver_name VARCHAR(100) NOT NULL DEFAULT 'all',
        content TEXT,
        image_url VARCHAR(500),
        video_url VARCHAR(500),
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 检查并添加sex字段（如果表已存在但没有sex字段）
    try {
      await connection.query(`
        ALTER TABLE users ADD COLUMN sex ENUM('male', 'female', 'other') NOT NULL DEFAULT 'other'
      `);
      console.log('✅ 已为users表添加sex字段');
    } catch (err) {
      // 字段已存在，忽略错误
      if (!err.message.includes('Duplicate column name')) {
        console.log('sex字段已存在或添加失败:', err.message);
      }
    }
    
    // 检查并添加create_time字段（如果表已存在但没有create_time字段）
    try {
      await connection.query(`
        ALTER TABLE users ADD COLUMN create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ 已为users表添加create_time字段');
    } catch (err) {
      // 字段已存在，忽略错误
      if (!err.message.includes('Duplicate column name')) {
        console.log('create_time字段已存在或添加失败:', err.message);
      }
    }
    
    // 检查并添加update_time字段（如果表已存在但没有update_time字段）
    try {
      await connection.query(`
        ALTER TABLE users ADD COLUMN update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log('✅ 已为users表添加update_time字段');
    } catch (err) {
      // 字段已存在，忽略错误
      if (!err.message.includes('Duplicate column name')) {
        console.log('update_time字段已存在或添加失败:', err.message);
      }
    }
    
    // 初始化web_admindao数据库
    await connection.query('USE web_admindao');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'super_admin') DEFAULT 'admin',
        create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    
    // 创建管理员聊天消息表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_name VARCHAR(100) NOT NULL,
        receiver_name VARCHAR(100) NOT NULL DEFAULT 'all',
        content TEXT,
        image_url VARCHAR(500),
        video_url VARCHAR(500),
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 检查并添加role字段（如果表已存在但没有role字段）
    try {
      await connection.query(`
        ALTER TABLE admins ADD COLUMN role ENUM('admin', 'super_admin') DEFAULT 'admin'
      `);
      console.log('✅ 已为admins表添加role字段');
    } catch (err) {
      // 字段已存在，忽略错误
      if (!err.message.includes('Duplicate column name')) {
        console.log('role字段已存在或添加失败:', err.message);
      }
    }
    
    // 检查并添加create_time字段（如果表已存在但没有create_time字段）
    try {
      await connection.query(`
        ALTER TABLE admins ADD COLUMN create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ 已为admins表添加create_time字段');
    } catch (err) {
      // 字段已存在，忽略错误
      if (!err.message.includes('Duplicate column name')) {
        console.log('create_time字段已存在或添加失败:', err.message);
      }
    }
    
    // 检查并添加update_time字段（如果表已存在但没有update_time字段）
    try {
      await connection.query(`
        ALTER TABLE admins ADD COLUMN update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log('✅ 已为admins表添加update_time字段');
    } catch (err) {
      // 字段已存在，忽略错误
      if (!err.message.includes('Duplicate column name')) {
        console.log('update_time字段已存在或添加失败:', err.message);
      }
    }
    
    // 插入默认管理员账号
    try {
      const bcrypt = require('bcrypt');
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      await connection.query(`
        INSERT IGNORE INTO admins (username, password, role, create_time)
        VALUES ('admin', ?, 'super_admin', NOW())
      `, [hashedAdminPassword]);
      console.log('✅ 默认管理员账号已创建');
    } catch (err) {
      console.log('管理员账号创建失败或已存在');
    }
    
    // 切换到用户数据库插入默认用户
    await connection.query('USE web_userdao');
    try {
      const bcrypt = require('bcrypt');
      const hashedUserPassword = await bcrypt.hash('password123', 10);
      await connection.query(`
        INSERT IGNORE INTO users (username, password, sex, create_time)
        VALUES ('user1', ?, 'male', NOW())
      `, [hashedUserPassword]);
      console.log('✅ 默认用户账号已创建');
    } catch (err) {
      console.log('用户账号创建失败或已存在');
    }
    
    // 创建聊天消息表
    await connection.query('USE web_project');
    // 先删除旧表（如果存在）
    await connection.query('DROP TABLE IF EXISTS chat_messages');
    // 重新创建包含receiver_name字段的新表
    await connection.query(`
      CREATE TABLE chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_name VARCHAR(100) NOT NULL,
        receiver_name VARCHAR(100) NOT NULL DEFAULT 'all',
        content TEXT,
        image_url VARCHAR(500),
        video_url VARCHAR(500),
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ 聊天消息表已重新创建（包含receiver_name字段）');
    
    // 切换回web_project数据库继续其他操作
    await connection.query('USE web_project');
    
    // 插入首页内容（仅在表为空时）
    try {
      const [homeCount] = await connection.query('SELECT COUNT(*) as count FROM home_content');
      if (homeCount[0].count === 0) {
        await connection.query(`
          INSERT INTO home_content (title, content, image_url, status, create_time, update_time)
          VALUES 
            ('天官赐福新章节更新', '最新章节已经发布，讲述了谢怜和花城的新冒险。这一章中，他们将面临更大的挑战和考验。', '../img/a5.png', 'published', NOW(), NOW()),
            ('作品评价精选', '精选了一些读者的精彩评价和感想。这些评价从不同角度分析了作品的亮点和特色。', '../img/轮播6.png', 'published', NOW(), NOW()),
            ('角色介绍更新', '新增了更多角色的详细介绍和背景故事。包括主要角色的性格特点、成长经历和人物关系。', '../img/a6.png', 'published', NOW(), NOW())
        `);
        console.log('✅ 插入首页内容数据');
      }
    } catch (err) {
      console.log('首页内容数据已存在，跳过插入');
    }
    
    // 插入导航菜单数据（仅在表为空时）
    try {
      const [menuCount] = await connection.query('SELECT COUNT(*) as count FROM navigation_menu');
      if (menuCount[0].count === 0) {
        await connection.query(`
          INSERT INTO navigation_menu (name, url, display_order, is_active, create_time, update_time)
          VALUES 
            ('首页', '/user-web/天官赐福首页.html', 1, true, NOW(), NOW()),
            ('角色介绍', '/user-web/角色介绍.html', 2, true, NOW(), NOW()),
            ('剧情简介', '/user-web/剧情简介.html', 3, true, NOW(), NOW()),
            ('作品评价', '/user-web/作品评价.html', 4, true, NOW(), NOW()),
            ('留言板', '/user-web/留言板.html', 5, true, NOW(), NOW())
        `);
        console.log('✅ 插入导航菜单数据');
      }
    } catch (err) {
      console.log('导航菜单数据已存在，跳过插入');
    }
    
    // 插入角色数据（仅在表为空时）
    try {
      const [charCount] = await connection.query('SELECT COUNT(*) as count FROM character_info');
      if (charCount[0].count === 0) {
        await connection.query(`
          INSERT INTO character_info (name, description, image_url, personality, role_importance, display_order, status, create_time, update_time)
          VALUES 
            ('谢怜', '仙乐国太子。一心想拯救苍生，却连自己的国家和父母都守护不了。', '../img/谢伶1.png', '温文尔雅，慈悲为怀', 'main', 1, 'published', NOW(), NOW()),
            ('花城', '从小受尽虐待，憎恶世界，后成为绝境鬼王。', '../img/花城1.png', '深情专一，无所不能', 'main', 2, 'published', NOW(), NOW()),
            ('君吾', '两千年前是乌庸国的太子，天资过人，文武双全。', '../img/君吾.png', '霸气威严，武功绝世', 'main', 3, 'published', NOW(), NOW()),
            ('师青玄', '出身于豪门经商之家，性情如风，喜欢结交朋友。', '../img/师青玄.png', '热心肠，正直有同情心', 'supporting', 4, 'published', NOW(), NOW()),
            ('风信', '仙乐太子的心腹下属，贴身侍卫，一起长大、登天、被贬和流放。', '../img/风信 1.png', '忠诚勇敢，但有时性急', 'supporting', 5, 'published', NOW(), NOW()),
            ('慕情', '原为仙乐国太极大观扫地杂役，后因受到谢怜的赏识得以修炼。', '../img/慕情.png', '深沉稳重，忠诚可靠', 'supporting', 6, 'published', NOW(), NOW())
        `);
        console.log('✅ 插入角色示例数据');
      }
    } catch (err) {
      console.log('角色示例数据已存在，跳过插入');
    }
    
    // 插入基本信息数据（仅在表为空时）
    try {
      const [basicCount] = await connection.query('SELECT COUNT(*) as count FROM basic_info');
      if (basicCount[0].count === 0) {
        await connection.query(`
          INSERT INTO basic_info (label, value, display_order, create_time, update_time)
          VALUES 
            ('作品名称', '天官赐福', 1, NOW(), NOW()),
            ('发表时间', '2017-06-16', 2, NOW(), NOW()),
            ('作品别名', '纯情太子妖艳妃', 3, NOW(), NOW()),
            ('主    角', '谢怜、花城', 4, NOW(), NOW()),
            ('作    者', '墨香铜臭', 5, NOW(), NOW()),
            ('最新章节', '第252章：鬼王的生辰', 6, NOW(), NOW()),
            ('文学体裁', '小说', 7, NOW(), NOW()),
            ('连载状态', '正文及番外均已完结', 8, NOW(), NOW()),
            ('连载平台', '晋江文学城', 9, NOW(), NOW()),
            ('出版状态', '已出版（全六册）', 10, NOW(), NOW()),
            ('类    型', '原创-纯爱-架空历史-爱情', 11, NOW(), NOW()),
            ('全文字数', '1144742字', 12, NOW(), NOW())
        `);
        console.log('✅ 插入基本信息数据');
      }
    } catch (err) {
      console.log('基本信息数据已存在，跳过插入');
    }
    
    // 插入人物语录数据（仅在表为空时）
    try {
      const [quoteCount] = await connection.query('SELECT COUNT(*) as count FROM character_quotes');
      if (quoteCount[0].count === 0) {
        await connection.query(`
          INSERT INTO character_quotes (character_name, content, image_url, display_order, status, create_time, update_time)
          VALUES 
            ('🌟 谢怜', '身在无间，心在桃源。
            是非在己，毁誉由人，得失不论。
            我虽身在无间，却心向桃源。但如果桃源本身就是无间呢？
            拯救苍生那种事，对我来说太遥远了。我只想保护好我想保护的人。
            人上有人，天外有天，风光的背后，不是沧桑，就是肮脏。', '../img/谢伶1.png', 1, 'published', NOW(), NOW()),
            ('🔥 花城', '为你明灯三千，为你花开满城。
            我永远是你最忠诚的信徒。
            殿下，我没有骗你，我真的…… 等了你八百年。
            上元佳节，神武大街，惊鸿一瞥，百世沦陷。
            殿下，你这可真是…… 要了我的命了。
            天下无不散之筵席，但我永远不会离开你。', '../img/花城1.png', 2, 'published', NOW(), NOW()),
            ('📿 君吾（白无相）', '身在无间，心在无间。
            谢怜，你真是…… 让我恶心。
            我曾是神，也是人，最后，成了怪物。
            没有人能审判我，除了我自己。', '../img/君吾1.png', 3, 'published', NOW(), NOW()),
            ('🦋 师青玄', '风光无限是你，跌落尘埃也是你，重点是你，而不是怎样的你。
            交朋友，看的是心，不是身份。
            管他什么黑水白水文文黑黑，本风师大人看上的朋友，就是最好的朋友！', '../img/师青玄.png', 4, 'published', NOW(), NOW()),
            ('💧 贺玄（黑水沉舟）', '欠债还钱，天经地义。
            我这一生，所求不多，只要该有的，都还给我就好。
            有些债，必须亲自讨回来。', '../img/贺玄.png', 5, 'published', NOW(), NOW()),
            ('🦊 风信', '殿下，你善良是好事，但你的善良，有时候真的很伤人。
            这么多年了，你还是老样子，一点都没变。
            我虽然离开你了，但我从来没怪过你。', '../img/风信 1.png', 6, 'published', NOW(), NOW()),
            ('🐶 慕情', '能力不够，就别硬撑。
            我慕情做事，问心无愧。
            有些人，有些事，不是想忘就能忘的。', '../img/慕情.png', 7, 'published', NOW(), NOW())
        `);
        console.log('✅ 插入人物语录数据');
      }
    } catch (err) {
      console.log('人物语录数据已存在，跳过插入');
    }
    
    // 插入轮播图数据（仅在表为空时）
    try {
      const [carouselCount] = await connection.query('SELECT COUNT(*) as count FROM carousel_images');
      if (carouselCount[0].count === 0) {
        await connection.query(`
          INSERT INTO carousel_images (title, image_url, link_url, description, display_order, is_active)
          VALUES 
            ('天官赐福百无禁忌', '../img/轮播8.png', '/user-web/天官赐福首页.html', '谢怜和花城的仙侠爱情故事', 1, 1),
            ('角色介绍', '../img/轮播4.png', '/user-web/角色介绍.html', '了解作品中的精彩角色', 2, 1),
            ('天官赐福百无禁忌', '../img/轮播6.png', '/user-web/天官赐福首页.html#作品评价', '读者的精彩评价和感想', 3, 1),
            ('天官赐福百无禁忌', '../img/轮播3.png', '/user-web/天官赐福首页.html', '读者的精彩评价和感想', 4, 1),
            ('天官赐福百无禁忌', '../img/轮播1.png', '/user-web/天官赐福首页.html', '读者的精彩评价和感想', 5, 1),
            ('天官赐福百无禁忌', '../img/轮播9.png', '/user-web/角色介绍.html', '读者的精彩评价和感想', 6, 1)
        `);
        console.log('✅ 插入轮播图数据');
      }
    } catch (err) {
      console.log('轮播图数据已存在，跳过插入');
    }
    
    // 检查数据是否成功插入
    const [homeContentRows] = await connection.query('SELECT COUNT(*) as count FROM home_content');
    const [sampleRows] = await connection.query('SELECT title FROM home_content LIMIT 3');
    console.log(`✅ home_content表中共有 ${homeContentRows[0].count} 条记录`);
    console.log('✅ 示例内容:', sampleRows.map(row => row.title));
    
    // 检查各数据库表
    await connection.query('USE web_userdao');
    const [userRows] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [sampleUsers] = await connection.query('SELECT username FROM users LIMIT 3');
    console.log(`✅ web_userdao.users表中共有 ${userRows[0].count} 个用户`);
    console.log('✅ 示例用户:', sampleUsers.map(row => row.username));
    
    await connection.query('USE web_admindao');
    const [adminRows] = await connection.query('SELECT COUNT(*) as count FROM admins');
    const [sampleAdmins] = await connection.query('SELECT username FROM admins LIMIT 3');
    console.log(`✅ web_admindao.admins表中共有 ${adminRows[0].count} 个管理员`);
    console.log('✅ 示例管理员:', sampleAdmins.map(row => row.username));
    
    await connection.end();
    console.log('✅ 数据库初始化完成');
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