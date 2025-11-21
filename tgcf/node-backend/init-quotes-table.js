const db = require('./config/db');
const CharacterQuotesModel = require('./models/characterQuotes.model');

async function initQuotesTable() {
  try {
    console.log('开始创建人物语录表...');
    
    // 创建人物语录表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS character_quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        character_name VARCHAR(100) NOT NULL COMMENT '角色名称',
        content TEXT NOT NULL COMMENT '语录内容',
        image_url VARCHAR(500) COMMENT '角色头像URL',
        display_order INT DEFAULT 0 COMMENT '显示顺序',
        status ENUM('published', 'draft') DEFAULT 'published' COMMENT '状态',
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_status (status),
        INDEX idx_display_order (display_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人物经典语录表'
    `);
    
    console.log('人物语录表创建成功');
    
    // 初始化默认数据
    await CharacterQuotesModel.initDefaultData();
    
    console.log('人物语录功能初始化完成');
    process.exit(0);
  } catch (error) {
    console.error('初始化人物语录表失败:', error);
    process.exit(1);
  }
}

initQuotesTable();