const fs = require('fs');

/**
 * 修复status字段的语法错误
 */
function fixStatusField() {
  const dbFilePath = '/var/www/tgcf/node-backend/config/db.js';
  
  try {
    // 读取文件内容
    let content = fs.readFileSync(dbFilePath, 'utf8');
    
    console.log('🔍 正在修复status字段语法错误...');
    
    // 查找并修复status字段
    const statusPattern = /status ENUM\('approved', 'pending', 'rejected'\) DEFAULT 'pending'\);/g;
    const fixedStatus = "status ENUM('approved', 'pending', 'rejected') DEFAULT 'pending',";
    
    content = content.replace(statusPattern, fixedStatus);
    
    // 写入修复后的文件
    fs.writeFileSync(dbFilePath, content, 'utf8');
    console.log('✅ status字段语法错误已修复');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

// 执行修复
fixStatusField();