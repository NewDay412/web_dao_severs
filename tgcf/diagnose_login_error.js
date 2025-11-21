const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

/**
 * 通过SSH在远程服务器上执行命令
 * @param {string} command - 要执行的命令
 * @returns {Promise<{stdout: string, stderr: string}>} 命令执行结果
 */
async function runRemoteCommand(command) {
    try {
        const sshCommand = `ssh root@47.83.203.60 "${command}"`;
        console.log(`执行远程命令: ${sshCommand}`);
        return await execAsync(sshCommand, { env: { SSHPASS: 'root' } });
    } catch (error) {
        console.error(`远程命令执行失败: ${error.message}`);
        return { stdout: '', stderr: error.message };
    }
}

/**
 * 检查后端服务状态
 */
async function checkBackendStatus() {
    console.log('=== 检查后端服务状态 ===');
    
    // 检查PM2进程列表
    const { stdout: pm2Status } = await runRemoteCommand('pm2 list');
    console.log('PM2进程列表:');
    console.log(pm2Status || '没有PM2进程在运行');
    
    // 检查Node.js进程
    const { stdout: nodeProcesses } = await runRemoteCommand('ps aux | grep node | grep -v grep');
    console.log('\nNode.js进程:');
    console.log(nodeProcesses || '没有Node.js进程在运行');
    
    // 检查端口3003是否被占用
    const { stdout: portStatus } = await runRemoteCommand('netstat -tuln | grep 3003');
    console.log('\n端口3003状态:');
    console.log(portStatus || '端口3003未被占用');
}

/**
 * 检查Nginx配置和状态
 */
async function checkNginxStatus() {
    console.log('\n=== 检查Nginx配置和状态 ===');
    
    // 检查Nginx是否在运行
    const { stdout: nginxStatus } = await runRemoteCommand('systemctl status nginx | grep Active');
    console.log('Nginx状态:');
    console.log(nginxStatus || '无法获取Nginx状态');
    
    // 查看Nginx配置中的API代理设置
    const { stdout: nginxConfig } = await runRemoteCommand('grep -A 10 "location /api" /etc/nginx/sites-available/default');
    console.log('\nNginx API代理配置:');
    console.log(nginxConfig || '未找到API代理配置');
    
    // 检查Nginx错误日志
    const { stdout: nginxErrorLog } = await runRemoteCommand('tail -n 20 /var/log/nginx/error.log');
    console.log('\n最近的Nginx错误日志:');
    console.log(nginxErrorLog);
}

/**
 * 测试API端点响应
 */
async function testApiEndpoint() {
    console.log('\n=== 测试API端点响应 ===');
    
    try {
        // 在服务器上直接测试API响应
        const { stdout: apiResponse } = await runRemoteCommand('curl -s -D - http://localhost:3003/api/login -X POST -H "Content-Type: application/json" -d "{\"username\":\"test\",\"password\":\"test\"}"');
        console.log('API响应:');
        console.log(apiResponse);
        
        // 检查响应是否包含HTML标签
        if (apiResponse.includes('<!DOCTYPE') || apiResponse.includes('<html')) {
            console.log('\n⚠️  检测到API返回HTML内容，而不是预期的JSON');
        }
    } catch (error) {
        console.error('API测试失败:', error.message);
    }
}

/**
 * 检查user.routes.js文件状态
 */
async function checkRoutesFile() {
    console.log('\n=== 检查路由文件状态 ===');
    
    const { stdout: routesStatus } = await runRemoteCommand('ls -la /root/node-backend/api/routes/user.routes.js');
    console.log('路由文件状态:');
    console.log(routesStatus || '路由文件不存在');
    
    // 查看文件内容以确认修复是否正确
    const { stdout: routesContent } = await runRemoteCommand('cat /root/node-backend/api/routes/user.routes.js | head -n 30');
    console.log('\n路由文件开头部分:');
    console.log(routesContent);
}

/**
 * 重启后端服务
 */
async function restartBackend() {
    console.log('\n=== 重启后端服务 ===');
    
    try {
        // 停止所有相关Node进程
        await runRemoteCommand('pkill -f "node.*node-backend" || true');
        
        // 使用PM2启动服务
        await runRemoteCommand('cd /root/node-backend && pm2 start server.js --name node-backend --watch');
        
        console.log('后端服务已重启，请等待几秒钟让服务稳定...');
        
        // 等待服务启动
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 验证服务是否成功启动
        const { stdout: status } = await runRemoteCommand('pm2 list');
        console.log('\n重启后的PM2状态:');
        console.log(status);
    } catch (error) {
        console.error('重启服务失败:', error.message);
    }
}

/**
 * 主诊断函数
 */
async function main() {
    console.log('开始诊断登录请求失败问题...\n');
    
    // 检查后端服务状态
    await checkBackendStatus();
    
    // 检查Nginx配置
    await checkNginxStatus();
    
    // 测试API端点
    await testApiEndpoint();
    
    // 检查路由文件
    await checkRoutesFile();
    
    // 重启后端服务
    await restartBackend();
    
    console.log('\n=== 诊断完成 ===');
    console.log('请查看上述输出以了解问题原因');
}

// 执行诊断
main().catch(err => {
    console.error('诊断过程中出错:', err.message);
});