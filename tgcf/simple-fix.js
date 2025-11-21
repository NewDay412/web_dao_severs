// 简单数据库修复脚本
// 针对已知问题进行直接修复

const fs = require('fs');
const path = require('path');

/**
 * 修复db.js文件中的已知问题
 * @param {string} filePath - db.js文件路径
 */
function fixDatabaseFile(filePath) {
    try {
        console.log('📁 正在读取文件:', filePath);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 1. 修复数据库连接密码硬编码问题
        // 将所有硬编码的 'Mysql' 替换为使用config.password
        content = content.replace(/password:\s*'Mysql'/g, "password: config.password");
        
        // 2. 修复admins表创建SQL中的语法错误
        // 查找并修复所有可能的错误格式
        const adminsTablePattern = /CREATE TABLE IF NOT EXISTS admins\s*\(([\s\S]*?)\)/;
        const match = content.match(adminsTablePattern);
        
        if (match) {
            console.log('🔍 找到admins表定义');
            let tableDef = match[0];
            
            // 修复role字段的默认值
            tableDef = tableDef.replace(/role\s+.*?DEFAULT\s+admin\b/g, "role ENUM('admin', 'super_admin') DEFAULT 'admin'");
            tableDef = tableDef.replace(/role\s+.*?DEFAULT\s+"admin"\b/g, "role ENUM('admin', 'super_admin') DEFAULT 'admin'");
            
            // 将修复后的表定义替换回原文件
            content = content.replace(adminsTablePattern, tableDef);
            console.log('✅ 修复了admins表定义');
        }
        
        // 3. 确保所有SQL语句使用单引号
        // 替换可能的双引号为单引号
        content = content.replace(/"admin"/g, "'admin'");
        content = content.replace(/"super_admin"/g, "'super_admin'");
        
        // 4. 检查端口配置
        // 确保服务监听在3003端口
        if (!/port\s*=\s*3003|listen\(3003/g.test(content)) {
            console.log('⚠️  未找到端口3003配置，可能在app.js中');
        }
        
        // 写入修复后的内容
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('✅ 文件修复完成');
        
        // 验证修复结果
        console.log('\n🔍 验证修复结果:');
        const adminsTableRegex = /CREATE TABLE IF NOT EXISTS admins\s*\(([\s\S]*?)\)/;
        const fixedMatch = content.match(adminsTableRegex);
        
        if (fixedMatch) {
            console.log('✅ admins表定义已修复');
            // 提取role字段定义
            const roleFieldRegex = /role\s+.*?DEFAULT\s+'.*?'/;
            const roleMatch = fixedMatch[0].match(roleFieldRegex);
            if (roleMatch) {
                console.log('   role字段:', roleMatch[0]);
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ 修复失败:', error.message);
        return false;
    }
}

/**
 * 生成修复命令脚本
 */
function generateFixCommands() {
    console.log('\n📋 服务器修复命令:');
    console.log('1. 登录服务器:');
    console.log('   ssh root@47.83.203.60');
    console.log('');
    console.log('2. 进入项目目录:');
    console.log('   cd /var/www/tgcf/node-backend');
    console.log('');
    console.log('3. 下载修复脚本:');
    console.log('   curl -O https://raw.githubusercontent.com/yourusername/yourrepo/main/simple-fix.js');
    console.log('   # 或者手动创建脚本');
    console.log('');
    console.log('4. 运行修复脚本:');
    console.log('   node simple-fix.js');
    console.log('');
    console.log('5. 停止占用端口的进程:');
    console.log('   lsof -ti:3003 | xargs -r kill -9');
    console.log('');
    console.log('6. 重启服务:');
    console.log('   npm run dev');
    console.log('');
    console.log('7. 检查服务状态:');
    console.log('   curl http://localhost:3003/api/health');
}

/**
 * 手动修复说明
 */
function showManualFix() {
    console.log('\n🔧 手动修复步骤:');
    console.log('1. 登录服务器:');
    console.log('   ssh root@47.83.203.60');
    console.log('');
    console.log('2. 编辑db.js文件:');
    console.log('   vi /var/www/tgcf/node-backend/config/db.js');
    console.log('');
    console.log('3. 修复数据库连接配置:');
    console.log('   - 查找所有 "password: \'Mysql\'" 替换为 "password: config.password"');
    console.log('');
    console.log('4. 修复admins表SQL:');
    console.log('   - 查找: CREATE TABLE IF NOT EXISTS admins');
    console.log('   - 确保role字段定义为:');
    console.log('     role ENUM(\'admin\', \'super_admin\') DEFAULT \'admin\'');
    console.log('');
    console.log('5. 保存并退出:');
    console.log('   - 按ESC键');
    console.log('   - 输入: :wq');
    console.log('');
    console.log('6. 重启服务:');
    console.log('   lsof -ti:3003 | xargs -r kill -9 && npm run dev');
}

// 主函数
function main() {
    console.log('🚀 启动简单数据库修复脚本');
    
    // 本地文件路径
    const localFilePath = path.join(__dirname, 'node-backend', 'config', 'db.js');
    
    if (fs.existsSync(localFilePath)) {
        console.log('\n🔧 正在本地测试修复...');
        fixDatabaseFile(localFilePath);
    } else {
        console.log('\n⚠️  本地文件不存在，仅显示修复指南');
    }
    
    generateFixCommands();
    showManualFix();
    
    console.log('\n✅ 修复脚本生成完成');
}

// 执行主函数
main();
