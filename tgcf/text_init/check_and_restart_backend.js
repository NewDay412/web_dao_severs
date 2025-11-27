const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * 通过SSH在远程服务器上执行命令
 * @param {string} command - 要在远程服务器上执行的命令
 * @returns {Promise<{stdout: string, stderr: string}>} 命令执行结果
 */
async function runRemoteCommand(command) {
    const sshCommand = `ssh root@47.83.203.60 "${command}"`;
    console.log(`执行远程命令: ${sshCommand}`);
    return execAsync(sshCommand);
}

/**
 * 检查远程服务器上的Node.js后端服务状态
 * @returns {Promise<boolean>} 服务是否正在运行
 */
async function checkBackendStatus() {
    try {
        console.log('检查后端服务状态...');
        // 查找包含node-backend的进程
        const { stdout } = await runRemoteCommand('ps aux | grep node-backend | grep -v grep');
        
        if (stdout.trim() !== '') {
            console.log('✅ 后端服务正在运行');
            return true;
        } else {
            console.log('❌ 后端服务未运行');
            return false;
        }
    } catch (error) {
        console.error('检查服务状态时出错:', error.message);
        return false;
    }
}

/**
 * 启动或重启远程服务器上的Node.js后端服务
 */
async function restartBackendService() {
    try {
        console.log('尝试启动/重启后端服务...');
        
        // 先检查并停止可能存在的旧进程
        await runRemoteCommand('pkill -f "node.*node-backend" || true');
        
        // 进入node-backend目录并使用PM2启动服务
        const startCommand = `cd /root/node-backend && npm install && pm2 start server.js --name node-backend --watch`;
        await runRemoteCommand(startCommand);
        
        console.log('服务启动命令已执行，等待服务稳定...');
        
        // 等待几秒钟让服务启动
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 检查服务是否成功启动
        const status = await checkBackendStatus();
        if (status) {
            console.log('✅ 后端服务已成功启动');
            return true;
        } else {
            console.error('❌ 后端服务启动失败');
            
            // 尝试获取PM2日志以排查问题
            try {
                const { stdout } = await runRemoteCommand('pm2 logs node-backend --lines 50');
                console.log('PM2日志输出:');
                console.log(stdout);
            } catch (e) {
                console.error('获取PM2日志失败:', e.message);
            }
            
            return false;
        }
    } catch (error) {
        console.error('启动后端服务时出错:', error.message);
        return false;
    }
}

/**
 * 主函数：检查并重启后端服务
 */
async function main() {
    console.log('开始检查并重启远程服务器后端服务...');
    
    // 检查服务状态
    const isRunning = await checkBackendStatus();
    
    // 如果服务未运行，则尝试启动
    if (!isRunning) {
        console.log('服务未运行，尝试启动...');
        const restartResult = await restartBackendService();
        
        if (!restartResult) {
            console.error('❌ 无法启动后端服务，请检查服务器日志');
        } else {
            console.log('✅ 后端服务已成功启动，可以正常处理API请求');
        }
    } else {
        console.log('后端服务已在运行，无需重启');
    }
}

// 执行主函数
main().catch(error => {
    console.error('执行过程中出错:', error.message);
});