const fs = require('fs');
const path = require('path');

/**
 * 修复数据库初始化脚本中的SQL语法错误
 * 主要修复home_content表的INSERT语句语法错误
 */
function fixDbSyntax() {
  try {
    // 读取本地db.js文件
    const dbPath = path.join(__dirname, 'node-backend', 'config', 'db.js');
    let content = fs.readFileSync(dbPath, 'utf8');
    
    // 查找并修复home_content的INSERT语句
    const homeContentStart = content.indexOf("INSERT INTO home_content");
    if (homeContentStart !== -1) {
      const homeContentEnd = content.indexOf("`);", homeContentStart) + 3;
      const homeContentSection = content.substring(homeContentStart, homeContentEnd);
      
      // 修复语法错误：移除多余的逗号和错误的括号
      let fixedSection = homeContentSection
        .replace(/\),\s*\);/g, ');')  // 修复多余的括号
        .replace(/,\s*`\);/g, '`);'); // 修复最后一个VALUES行的逗号
      
      // 替换修复后的内容
      content = content.substring(0, homeContentStart) + fixedSection + content.substring(homeContentEnd);
      
      console.log('✅ 本地db.js文件语法错误已修复');
    }
    
    // 保存修复后的文件
    fs.writeFileSync(dbPath, content, 'utf8');
    
    // 将修复后的文件上传到云服务器
    console.log('✅ 本地文件修复完成，准备上传到云服务器');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message);
  }
}

// 执行修复
fixDbSyntax();