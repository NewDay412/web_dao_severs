const fs = require('fs');
const path = require('path');

/**
 * 修复db.js文件中work_reviews表创建语句的语法错误
 */
function fixWorkReviewsSyntax() {
  const dbFilePath = path.join(__dirname, 'node-backend', 'config', 'db.js');
  
  try {
    // 读取文件内容
    let content = fs.readFileSync(dbFilePath, 'utf8');
    
    // 查找work_reviews表的创建语句
    const workReviewsPattern = /CREATE TABLE IF NOT EXISTS work_reviews \([\s\S]*?\);/g;
    const match = content.match(workReviewsPattern);
    
    if (match) {
      console.log('🔍 找到work_reviews表创建语句');
      
      // 修复语法错误：移除字段定义后的多余分号
      const fixedStatement = match[0]
        .replace(/\s+PRIMARY KEY\);\s*$/gm, ' PRIMARY KEY,')
        .replace(/NOT NULL\);\s*$/gm, ' NOT NULL,')
        .replace(/BETWEEN 1 AND 5\);\s*$/gm, ' BETWEEN 1 AND 5,')
        .replace(/DEFAULT \'pending\'\);\s*$/gm, ' DEFAULT \'pending\',')
        .replace(/NOT NULL\);\s*$/gm, ' NOT NULL,')
        .replace(/NOT NULL\s*\);/gm, ' NOT NULL\n      );');
      
      // 替换原内容
      content = content.replace(workReviewsPattern, fixedStatement);
      
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
fixWorkReviewsSyntax();