const fs = require('fs');
const path = require('path');

/**
 * 修复登录页面中的URL地址，将本地地址替换为远程服务器地址
 */
function fixLoginPageUrls() {
    try {
        const loginPagePath = path.join(__dirname, 'user-web', '登录页面.html');
        
        // 检查文件是否存在
        if (!fs.existsSync(loginPagePath)) {
            console.error('登录页面文件不存在');
            return false;
        }
        
        // 读取文件内容
        let content = fs.readFileSync(loginPagePath, 'utf8');
        
        console.log('开始修复登录页面URL...');
        
        // 替换API调用地址
        const apiUrlRegex = /http:\/\/localhost:3003\/api\/login/g;
        content = content.replace(apiUrlRegex, 'https://longlong.baby/api/login');
        console.log('已替换API调用地址');
        
        // 替换跳转地址 - admin页面
        const adminUrlRegex = /http:\/\/localhost:3003\/admin-web\/admin.html/g;
        content = content.replace(adminUrlRegex, 'https://longlong.baby/admin-web/admin.html');
        console.log('已替换管理员页面跳转地址');
        
        // 替换跳转地址 - 用户首页
        const userUrlRegex = /http:\/\/localhost:3003\/user-web\/天官赐福首页.html/g;
        content = content.replace(userUrlRegex, 'https://longlong.baby/user-web/天官赐福首页.html');
        console.log('已替换用户首页跳转地址');
        
        // 备份原始文件
        const backupPath = loginPagePath + '.bak';
        fs.writeFileSync(backupPath, fs.readFileSync(loginPagePath, 'utf8'), 'utf8');
        console.log('已备份原始文件到', backupPath);
        
        // 写入修复后的内容
        fs.writeFileSync(loginPagePath, content, 'utf8');
        console.log('登录页面URL修复完成');
        
        return true;
    } catch (error) {
        console.error('修复登录页面URL时出错:', error.message);
        return false;
    }
}

/**
 * 将修复后的登录页面上传到远程服务器
 */
async function uploadToServer() {
    try {
        console.log('准备上传修复后的登录页面到远程服务器...');
        
        // 使用SSH命令上传文件
        const { execSync } = require('child_process');
        const uploadCommand = 'scp d:\\wen_project\\web_dao\\user-web\\登录页面.html root@47.83.203.60:/var/www/tgcf/';
        
        console.log('执行上传命令:', uploadCommand);
        execSync(uploadCommand, { stdio: 'inherit' });
        
        console.log('登录页面已成功上传到远程服务器');
        return true;
    } catch (error) {
        console.error('上传到服务器时出错:', error.message);
        return false;
    }
}

/**
 * 主函数：执行修复和上传流程
 */
async function main() {
    console.log('开始修复登录页面URL并上传到服务器...');
    
    // 修复URL
    const fixResult = fixLoginPageUrls();
    if (!fixResult) {
        console.error('URL修复失败，终止操作');
        return;
    }
    
    // 上传到服务器
    const uploadResult = await uploadToServer();
    if (!uploadResult) {
        console.error('上传失败，终止操作');
        return;
    }
    
    console.log('✅ 操作完成！登录页面已修复并上传到远程服务器');
    console.log('请尝试再次登录，应该可以正常工作了');
}

// 执行主函数
main();