// 数据库修复脚本
// 用于修复服务器上db.js文件中的SQL语法错误

const fs = require('fs');
const path = require('path');

/**
 * 修复db.js文件中的SQL语法错误
 * @param {string} filePath - db.js文件路径
 */
function fixDatabaseFile(filePath) {
    try {
        // 读取文件内容
        let content = fs.readFileSync(filePath, 'utf8');
        
        console.log('📁 正在读取文件:', filePath);
        
        // 修复admins表创建SQL中的语法错误
        // 搜索所有可能的错误格式
        const errorPatterns = [
            // 错误格式1: DEFAULT admin (缺少引号)
            /DEFAULT\s+admin\b/g,
            // 错误格式2: DEFAULT admin, (缺少引号和多余逗号)
            /DEFAULT\s+admin\s*,/g,
            // 错误格式3: DEFAULT "admin" (使用了双引号)
            /DEFAULT\s+"admin"\b/g
        ];
        
        // 使用正确格式替换: DEFAULT 'admin'
        errorPatterns.forEach(pattern => {
            content = content.replace(pattern, "DEFAULT 'admin'");
        });
        
        // 特别检查ENUM类型的定义
        const enumPattern = /role\s+VARCHAR\s*\(20\)\s+DEFAULT\s+admin\b/g;
        if (enumPattern.test(content)) {
            console.log('🔍 发现role字段使用了VARCHAR类型，建议修改为ENUM类型');
            // 替换为更安全的ENUM类型
            content = content.replace(
                /role\s+VARCHAR\(20\)\s+DEFAULT\s+'admin'\b/g,
                "role ENUM('admin', 'super_admin') DEFAULT 'admin'"
            );
        }
        
        // 检查是否还有其他语法问题
        const syntaxIssues = [
            // 检查是否有未闭合的引号
            /'[^']*$/,  // 行尾有未闭合的单引号
            /"[^"]*$/  // 行尾有未闭合的双引号
        ];
        
        let hasSyntaxIssue = false;
        syntaxIssues.forEach(pattern => {
            if (pattern.test(content)) {
                console.error('❌ 发现未闭合的引号问题');
                hasSyntaxIssue = true;
            }
        });
        
        if (hasSyntaxIssue) {
            console.error('❌ 文件仍存在语法问题，请手动检查');
            return false;
        }
        
        // 写入修复后的内容
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('✅ 文件修复完成');
        
        // 验证修复结果
        const fixedContent = fs.readFileSync(filePath, 'utf8');
        const adminsTableRegex = /CREATE TABLE IF NOT EXISTS admins\s*\(([\s\S]*?)\)/;
        const match = fixedContent.match(adminsTableRegex);
        
        if (match) {
            console.log('📋 修复后的admins表结构:');
            console.log(match[1]);
        } else {
            console.error('❌ 未找到admins表定义');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ 修复失败:', error.message);
        return false;
    }
}

/**
 * 检查端口占用并停止进程
 * @param {number} port - 端口号
 */
async function stopPortProcess(port) {
    try {
        const { exec } = require('child_process');
        
        console.log(`🔍 检查端口 ${port} 是否被占用`);
        
        // 使用lsof查找占用端口的进程
        const lsofCommand = `lsof -ti:${port}`;
        
        exec(lsofCommand, (error, stdout, stderr) => {
            if (error) {
                console.log(`✅ 端口 ${port} 未被占用`);
                return;
            }
            
            const pids = stdout.trim().split('\n').filter(pid => pid);
            
            if (pids.length > 0) {
                console.log(`⚠️  发现 ${pids.length} 个进程占用端口 ${port}: ${pids.join(', ')}`);
                
                // 停止所有占用端口的进程
                const killCommand = `kill -9 ${pids.join(' ')}`;
                
                exec(killCommand, (killError, killStdout, killStderr) => {
                    if (killError) {
                        console.error('❌ 停止进程失败:', killError.message);
                        return;
                    }
                    
                    console.log(`✅ 已停止占用端口 ${port} 的进程`);
                });
            }
        });
        
    } catch (error) {
        console.error('❌ 检查端口占用失败:', error.message);
    }
}

/**
 * 主函数
 */
function main() {
    console.log('🚀 启动数据库修复脚本');
    
    // 本地测试：如果在本地运行，可以指定本地文件路径
    const localFilePath = path.join(__dirname, 'node-backend', 'config', 'db.js');
    
    if (fs.existsSync(localFilePath)) {
        console.log('🔧 正在本地测试修复...');
        fixDatabaseFile(localFilePath);
        
        console.log('\n📋 使用说明：');
        console.log('1. 将此脚本上传到服务器上的项目根目录');
        console.log('2. 在服务器上执行：node fix-db.js');
        console.log('3. 脚本将自动修复db.js文件中的SQL语法错误');
        console.log('4. 修复后执行：lsof -ti:3003 | xargs -r kill -9 && npm run dev');
        
    } else {
        console.log('\n📋 使用说明：');
        console.log('1. 将此脚本上传到服务器上的项目根目录');
        console.log('2. 在服务器上执行：node fix-db.js');
        console.log('3. 脚本将自动修复db.js文件中的SQL语法错误');
        console.log('4. 修复后执行：lsof -ti:3003 | xargs -r kill -9 && npm run dev');
    }
    
    // 提示用户如何手动修复
    console.log('\n🔧 手动修复方法：');
    console.log('1. 使用SSH登录服务器：ssh root@47.83.203.60');
    console.log('2. 编辑db.js文件：vi /var/www/tgcf/node-backend/config/db.js');
    console.log('3. 搜索包含 "CREATE TABLE IF NOT EXISTS admins" 的行');
    console.log('4. 确保role字段的默认值有引号：DEFAULT \'admin\'');
    console.log('5. 保存文件并退出：按ESC，然后输入:wq');
    console.log('6. 停止占用3003端口的进程：lsof -ti:3003 | xargs -r kill -9');
    console.log('7. 重启服务：cd /var/www/tgcf/node-backend && npm run dev');
}

// 执行主函数
main();
