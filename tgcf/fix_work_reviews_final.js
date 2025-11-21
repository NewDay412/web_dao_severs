const fs = require('fs');

/**
 * 修复work_reviews表语法错误并添加示例数据
 */
function fixWorkReviews() {
  const dbFilePath = '/var/www/tgcf/node-backend/config/db.js';
  
  try {
    // 读取文件内容
    let content = fs.readFileSync(dbFilePath, 'utf8');
    
    console.log('🔍 开始修复work_reviews表问题...');
    
    // 1. 修复work_reviews表的创建语句语法错误
    const workReviewsCreate = `      CREATE TABLE IF NOT EXISTS work_reviews (\n        id INT AUTO_INCREMENT PRIMARY KEY,\n        username VARCHAR(100) NOT NULL,\n        rating INT CHECK (rating BETWEEN 1 AND 5),\n        content TEXT NOT NULL,\n        status ENUM('approved', 'pending', 'rejected') DEFAULT 'pending',\n        create_time DATETIME NOT NULL,\n        update_time DATETIME NOT NULL\n      );`;
    
    // 替换错误的创建语句
    const oldCreatePattern = /CREATE TABLE IF NOT EXISTS work_reviews \([\s\S]*?\);/g;
    content = content.replace(oldCreatePattern, workReviewsCreate);
    console.log('✅ work_reviews表创建语句已修复');
    
    // 2. 检查是否已存在示例数据插入逻辑
    const hasWorkReviewsData = content.includes('INSERT INTO work_reviews');
    
    if (!hasWorkReviewsData) {
      console.log('📝 添加work_reviews表示例数据插入逻辑');
      
      // 查找home_content表插入逻辑的位置
      const homeContentPattern = /INSERT INTO home_content[\s\S]*?\);\s*\n\s*console\.log\('✅ 插入首页内容数据'\);/g;
      const homeContentMatch = content.match(homeContentPattern);
      
      if (homeContentMatch) {
        // 在home_content插入逻辑后添加work_reviews插入逻辑
        const workReviewsInsert = `\n\n    // 插入作品评价示例数据\n    try {\n      const [reviewRows] = await connection.execute('SELECT COUNT(*) as count FROM work_reviews');\n      if (reviewRows[0].count === 0) {\n        await connection.execute(\`\n          INSERT INTO work_reviews (username, rating, content, status, create_time, update_time) VALUES\n          ('读者A', 5, '非常精彩的作品，人物塑造很成功！', 'approved', NOW(), NOW()),\n          ('读者B', 4, '剧情紧凑，期待后续发展。', 'approved', NOW(), NOW()),\n          ('读者C', 5, '花城和谢怜的感情线太感人了！', 'approved', NOW(), NOW()),\n          ('读者D', 3, '还不错，但有些地方可以改进。', 'pending', NOW(), NOW()),\n          ('读者E', 4, '角色性格鲜明，故事引人入胜。', 'approved', NOW(), NOW())\n        \`);\n        console.log('✅ 插入作品评价数据');\n      } else {\n        console.log('📊 作品评价表已有数据，跳过插入');\n      }\n    } catch (error) {\n      console.log('作品评价数据插入失败:', error.message);\n    }`;
        
        // 在home_content插入逻辑后添加work_reviews插入逻辑
        content = content.replace(homeContentPattern, homeContentMatch[0] + workReviewsInsert);
        console.log('✅ 已添加work_reviews表示例数据插入逻辑');
      }
    }
    
    // 写入修复后的文件
    fs.writeFileSync(dbFilePath, content, 'utf8');
    console.log('✅ work_reviews表问题修复完成');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

// 执行修复
fixWorkReviews();