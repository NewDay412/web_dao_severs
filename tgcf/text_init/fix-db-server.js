#!/usr/bin/env node

/**
 * 数据库配置修复脚本
 * 用于修复服务器上db.js文件中的SQL语法错误
 */

const fs = require('fs');
const path = require('path');

// 定义需要修复的文件路径
const dbFilePath = '/var/www/tgcf/node-backend/config/db.js';

// 修复函数：修复admins表role字段默认值缺少引号的问题
function fixAdminsTableSql() {
    console.log('🔍 正在读取db.js文件...');
    
    let content;
    try {
        content = fs.readFileSync(dbFilePath, 'utf8');
    } catch (error) {
        console.error('❌ 读取文件失败:', error.message);
        process.exit(1);
    }
    
    // 修复admins表role字段默认值缺少引号的问题
    console.log('🔧 正在修复admins表SQL语法...');
    
    // 匹配可能的错误格式：
    // 1. DEFAULT admin
    // 2. DEFAULT admin,
    // 3. DEFAULT  admin
    // 4. DEFAULT  admin,
    const fixedContent = content.replace(/role ENUM\('admin', 'super_admin'\) DEFAULT\s+admin(,?)/g, "role ENUM('admin', 'super_admin') DEFAULT 'admin'$1");
    
    // 检查是否成功修复
    if (fixedContent.includes("role ENUM('admin', 'super_admin') DEFAULT 'admin'")) {
        console.log('✅ 修复成功！admins表role字段默认值已添加引号');
    } else {
        console.log('⚠️  未找到需要修复的内容，可能已经是正确格式');
    }
    
    // 保存修复后的文件
    try {
        fs.writeFileSync(dbFilePath, fixedContent, 'utf8');
        console.log('💾 修复后的文件已保存');
    } catch (error) {
        console.error('❌ 保存文件失败:', error.message);
        process.exit(1);
    }
    
    return fixedContent;
}

// 显示修复前后的对比
function showDiff(originalContent, fixedContent) {
    console.log('\n📊 修复前后对比:');
    console.log('-' * 50);
    
    // 找到修复的行
    const originalLines = originalContent.split('\n');
    const fixedLines = fixedContent.split('\n');
    
    for (let i = 0; i < originalLines.length; i++) {
        if (originalLines[i] !== fixedLines[i] && fixedLines[i].includes("role ENUM('admin', 'super_admin') DEFAULT 'admin'")) {
            console.log(`行 ${i + 1}:`);
            console.log(`  修复前: ${originalLines[i].trim()}`);
            console.log(`  修复后: ${fixedLines[i].trim()}`);
            break;
        }
    }
    
    console.log('-' * 50);
}

// 终止占用3003端口的进程
function killPortProcess() {
    console.log('\n🔌 正在终止占用3003端口的进程...');
    
    const { execSync } = require('child_process');
    
    try {
        // 使用lsof查找端口占用进程并终止
        const output = execSync('lsof -ti:3003', { encoding: 'utf8' });
        if (output.trim()) {
            execSync('lsof -ti:3003 | xargs -r kill -9', { encoding: 'utf8' });
            console.log('✅ 已成功终止占用3003端口的进程');
        } else {
            console.log('ℹ️  3003端口未被占用');
        }
    } catch (error) {
        if (error.status === 1) {
            // lsof未找到进程的情况
            console.log('ℹ️  3003端口未被占用');
        } else {
            console.error('❌ 终止进程失败:', error.message);
        }
    }
}

// 主函数
function main() {
    console.log('🚀 数据库配置修复脚本启动');
    console.log('=' * 50);
    
    // 备份原始文件
    console.log('💾 正在备份原始文件...');
    try {
        const originalContent = fs.readFileSync(dbFilePath, 'utf8');
        const backupPath = `${dbFilePath}.bak`;
        fs.writeFileSync(backupPath, originalContent, 'utf8');
        console.log(`✅ 原始文件已备份到: ${backupPath}`);
    } catch (error) {
        console.error('⚠️  备份失败:', error.message);
        // 备份失败不影响继续修复
    }
    
    // 执行修复
    const originalContent = fs.readFileSync(dbFilePath, 'utf8');
    const fixedContent = fixAdminsTableSql();
    
    // 显示修复对比
    showDiff(originalContent, fixedContent);
    
    // 终止端口占用进程
    killPortProcess();
    
    console.log('\n🎉 修复完成！');
    console.log('💡 下一步：请手动重启后端服务');
    console.log('   命令：cd /var/www/tgcf/node-backend && npm start');
}

// 执行主函数
if (require.main === module) {
    main();
}

module.exports = { fixAdminsTableSql, killPortProcess };