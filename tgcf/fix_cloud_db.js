const fs = require('fs');

/**
 * 修复云服务器db.js文件中work_reviews表创建语句的语法错误
 */
function fixCloudDbFile() {
  const dbFilePath = '/var/www/tgcf/node-backend/config/db.js';
  
  try {
    // 读取文件内容
    let content = fs.readFileSync(dbFilePath, 'utf8');
    
    console.log('🔍 正在修复work_reviews表语法错误...');
    
    // 查找并修复work_reviews表的创建语句
    const workReviewsPattern = /(CREATE TABLE IF NOT EXISTS work_reviews \([\s\S]*?\);)/g;
    const match = content.match(workReviewsPattern);
    
    if (match) {
      console.log('✅ 找到work_reviews表创建语句');
      
      // 修复语法错误：移除字段定义后的多余分号
      const originalStatement = match[0];
      const fixedStatement = originalStatement
        .replace(/id INT AUTO_INCREMENT PRIMARY KEY\);/, 'id INT AUTO_INCREMENT PRIMARY KEY,')
        .replace(/username VARCHAR\(100\) NOT NULL\);/, 'username VARCHAR(100) NOT NULL,')
        .replace(/rating INT CHECK \(rating BETWEEN 1 AND 5\)\);/, 'rating INT CHECK (rating BETWEEN 1 AND 5),')
        .replace(/content TEXT NOT NULL\);/, 'content TEXT NOT NULL,')
        .replace(/status ENUM\('approved', 'pending', 'rejected'\) DEFAULT 'pending'\);/, 'status ENUM(\'approved\', \'pending\', \'rejected\') DEFAULT \'pending\',')
        .replace(/create_time DATETIME NOT NULL\);/, 'create_time DATETIME NOT NULL,')
        .replace(/update_time DATETIME NOT NULL\s*\);/, 'update_time DATETIME NOT NULL\n      );');
      
      // 替换原内容
      content = content.replace(originalStatement, fixedStatement);
      
      // 写入修复后的文件
      fs.writeFileSync(dbFilePath, content, 'utf8');
      console.log('✅ work_reviews表语法错误已修复');
      
      // 验证修复结果
      const fixedContent = fs.readFileSync(dbFilePath, 'utf8');
      const fixedMatch = fixedContent.match(workReviewsPattern);
      if (fixedMatch) {
        console.log('📋 修复后的语句:');
        console.log(fixedMatch[0]);
      }
    } else {
      console.log('❌ 未找到work_reviews表创建语句');
    }
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

// 执行修复
fixCloudDbFile();