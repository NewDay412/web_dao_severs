const fs = require('fs');
const path = require('path');

/**
 * 修复注册页面中的URL地址，将本地地址替换为远程服务器地址
 */
function fixRegisterPageUrls() {
    try {
        const registerPagePath = path.join(__dirname, 'user-web', '注册.html');
        
        // 检查文件是否存在
        if (!fs.existsSync(registerPagePath)) {
            console.error('注册页面文件不存在');
            return false;
        }
        
        // 读取文件内容
        let content = fs.readFileSync(registerPagePath, 'utf8');
        
        console.log('开始修复注册页面URL...');
        
        // 替换API调用地址 - 通常注册接口为 /api/register
        const apiUrlRegex = /http:\/\/localhost:3003\/api\/register/g;
        content = content.replace(apiUrlRegex, 'https://longlong.baby/api/register');
        console.log('已替换注册API调用地址');
        
        // 替换可能的登录页面链接
        const loginUrlRegex = /http:\/\/localhost:3003\/user-web\/登录页面.html/g;
        content = content.replace(loginUrlRegex, 'https://longlong.baby/user-web/登录页面.html');
        console.log('已替换登录页面链接');
        
        // 替换可能的首页跳转地址
        const indexUrlRegex = /http:\/\/localhost:3003\/user-web\/天官赐福首页.html/g;
        content = content.replace(indexUrlRegex, 'https://longlong.baby/user-web/天官赐福首页.html');
        console.log('已替换首页跳转地址');
        
        // 备份原始文件
        const backupPath = registerPagePath + '.bak';
        fs.writeFileSync(backupPath, fs.readFileSync(registerPagePath, 'utf8'), 'utf8');
        console.log('已备份原始文件到', backupPath);
        
        // 写入修复后的内容
        fs.writeFileSync(registerPagePath, content, 'utf8');
        console.log('注册页面URL修复完成');
        
        return true;
    } catch (error) {
        console.error('修复注册页面URL时出错:', error.message);
        return false;
    }
}

/**
 * 将修复后的注册页面上传到远程服务器
 */
async function uploadToServer() {
    try {
        console.log('准备上传修复后的注册页面到远程服务器...');
        
        // 使用SSH命令上传文件
        const { execSync } = require('child_process');
        const uploadCommand = 'scp d:\\wen_project\\web_dao\\user-web\\注册.html root@47.83.203.60:/var/www/tgcf/';
        
        console.log('执行上传命令:', uploadCommand);
        execSync(uploadCommand, { stdio: 'inherit' });
        
        console.log('注册页面已成功上传到远程服务器');
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
    console.log('开始修复注册页面URL并上传到服务器...');
    
    // 修复URL
    const fixResult = fixRegisterPageUrls();
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
    
    console.log('✅ 操作完成！注册页面已修复并上传到远程服务器');
}

// 执行主函数
main();