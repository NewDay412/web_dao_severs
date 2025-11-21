#!/usr/bin/env node

/**
 * 修复命令生成脚本
 * 用于生成将修复脚本上传到服务器并执行的命令
 */

const fs = require('fs');

// 服务器配置
const serverConfig = {
    host: '47.83.203.60',
    user: 'root',
    remotePath: '/var/www/tgcf/node-backend/config/',
    backendPath: '/var/www/tgcf/node-backend/'
};

// 本地文件路径
const localPaths = {
    fixScript: './fix-db-server.js'
};

// 生成修复命令
function generateFixCommands() {
    console.log('🚀 数据库修复命令生成器');
    console.log('=' * 60);
    console.log('📋 修复步骤：');
    console.log('=' * 60);
    
    // 步骤1：检查本地修复脚本是否存在
    console.log('\n1️⃣  检查本地修复脚本：');
    console.log(`   脚本路径: ${localPaths.fixScript}`);
    
    try {
        if (fs.existsSync(localPaths.fixScript)) {
            console.log('   ✅ 修复脚本已存在');
        } else {
            console.log('   ❌ 修复脚本不存在，请先运行 generate-fix-commands.js');
            process.exit(1);
        }
    } catch (error) {
        console.log('   ❌ 检查脚本失败:', error.message);
        process.exit(1);
    }
    
    // 步骤2：上传修复脚本到服务器
    console.log('\n2️⃣  上传修复脚本到服务器：');
    const uploadCommand = `scp ${localPaths.fixScript} ${serverConfig.user}@${serverConfig.host}:${serverConfig.remotePath}`;
    console.log(`   命令: ${uploadCommand}`);
    
    // 步骤3：登录服务器并执行修复脚本
    console.log('\n3️⃣  登录服务器并执行修复脚本：');
    const sshCommands = [
        `ssh ${serverConfig.user}@${serverConfig.host}`,
        `cd ${serverConfig.remotePath}`,
        'chmod +x fix-db-server.js',
        'node fix-db-server.js'
    ];
    console.log('   命令:');
    sshCommands.forEach(cmd => console.log(`   ${cmd}`));
    
    // 步骤4：重启后端服务
    console.log('\n4️⃣  重启后端服务：');
    const restartCommands = [
        `cd ${serverConfig.backendPath}`,
        // 检查是否有pm2或其他进程管理工具
        'if command -v pm2 &> /dev/null; then',
        '  pm2 restart all',
        'else',
        '  # 如果没有pm2，使用npm start重新启动',
        '  # 先终止可能的运行进程',
        '  pkill -f "node app.js" || pkill -f "node server.js"',
        '  # 以后台方式启动',
        '  npm start &',
        'fi'
    ];
    console.log('   命令:');
    restartCommands.forEach(cmd => console.log(`   ${cmd}`));
    
    // 步骤5：验证修复结果
    console.log('\n5️⃣  验证修复结果：');
    const verifyCommands = [
        // 检查修复后的db.js文件
        `ssh ${serverConfig.user}@${serverConfig.host} "sed -n '410,430p' ${serverConfig.remotePath}db.js"`,
        // 检查后端服务状态
        `curl -I http://${serverConfig.host}:3003`
    ];
    console.log('   命令:');
    verifyCommands.forEach(cmd => console.log(`   ${cmd}`));
    
    console.log('\n' + '=' * 60);
    console.log('📝 注意事项：');
    console.log('1. 执行scp和ssh命令时可能需要输入服务器密码');
    console.log('2. 如果使用密钥认证，确保ssh-agent正在运行且密钥已加载');
    console.log('3. 修复完成后建议测试管理员登录功能');
    console.log('=' * 60);
    
    // 生成一键执行命令（适用于Linux/Mac）
    console.log('\n🔧 一键执行命令（Linux/Mac）：');
    console.log('```bash');
    console.log(`${uploadCommand} && ssh ${serverConfig.user}@${serverConfig.host} "cd ${serverConfig.remotePath} && chmod +x fix-db-server.js && node fix-db-server.js && cd ${serverConfig.backendPath} && pkill -f \"node app.js\" || pkill -f \"node server.js\" && npm start &"`);
    console.log('```');
    
    // 生成Windows PowerShell一键执行命令
    console.log('\n🔧 一键执行命令（Windows PowerShell）：');
    console.log('```powershell');
    console.log(`scp ${localPaths.fixScript} ${serverConfig.user}@${serverConfig.host}:${serverConfig.remotePath}; ssh ${serverConfig.user}@${serverConfig.host} "cd ${serverConfig.remotePath}; chmod +x fix-db-server.js; node fix-db-server.js; cd ${serverConfig.backendPath}; pkill -f 'node app.js' || pkill -f 'node server.js'; npm start &"`);
    console.log('```');
}

// 执行主函数
if (require.main === module) {
    generateFixCommands();
}