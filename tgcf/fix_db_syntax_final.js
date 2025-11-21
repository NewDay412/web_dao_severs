const fs = require('fs');
const path = require('path');

/**
 * 修复数据库初始化脚本中的语法错误
 * 主要修复字段定义后多余的分号问题
 */
function fixDbSyntax() {
    try {
        // 读取数据库初始化脚本
        const dbPath = '/var/www/tgcf/node-backend/config/db.js';
        let content = fs.readFileSync(dbPath, 'utf8');
        
        console.log('正在修复数据库初始化脚本语法错误...');
        
        // 修复 work_reviews 表的语法错误
        content = content.replace(
            /status ENUM\('approved', 'pending', 'rejected'\) DEFAULT 'pending'\);/g,
            "status ENUM('approved', 'pending', 'rejected') DEFAULT 'pending',"
        );
        
        // 修复 message_board 表的语法错误
        content = content.replace(
            /email VARCHAR\(255\)\);/g,
            'email VARCHAR(255),'
        );
        
        content = content.replace(
            /phone VARCHAR\(20\)\);/g,
            'phone VARCHAR(20),'
        );
        
        content = content.replace(
            /status ENUM\('published', 'pending', 'hidden'\) DEFAULT 'pending'\);/g,
            "status ENUM('published', 'pending', 'hidden') DEFAULT 'pending',"
        );
        
        content = content.replace(
            /reply TEXT\);/g,
            'reply TEXT,'
        );
        
        // 写入修复后的内容
        fs.writeFileSync(dbPath, content, 'utf8');
        
        console.log('数据库初始化脚本语法错误修复完成！');
        
        // 验证修复结果
        const fixedContent = fs.readFileSync(dbPath, 'utf8');
        
        // 检查 work_reviews 表
        const workReviewsMatch = fixedContent.match(/CREATE TABLE IF NOT EXISTS work_reviews \([\s\S]*?\);/);
        if (workReviewsMatch) {
            console.log('✅ work_reviews 表语法已修复');
        } else {
            console.log('❌ work_reviews 表语法修复失败');
        }
        
        // 检查 message_board 表
        const messageBoardMatch = fixedContent.match(/CREATE TABLE IF NOT EXISTS message_board \([\s\S]*?\);/);
        if (messageBoardMatch) {
            console.log('✅ message_board 表语法已修复');
        } else {
            console.log('❌ message_board 表语法修复失败');
        }
        
    } catch (error) {
        console.error('修复过程中出现错误:', error.message);
    }
}

// 执行修复
fixDbSyntax();