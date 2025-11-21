// 导航栏修复脚本
const fs = require('fs');
const { execSync } = require('child_process');

/**
 * 安全执行SSH命令
 * @param {string} command - SSH命令内容
 * @returns {string} 命令执行结果
 */
function safeSshCommand(command) {
    try {
        const fullCommand = `sshpass -p 'root' ssh -o StrictHostKeyChecking=no root@47.83.203.60 "${command}"`;
        console.log(`执行命令: ${command}`);
        return execSync(fullCommand).toString();
    } catch (error) {
        console.error(`命令执行失败: ${error.message}`);
        return '';
    }
}

/**
 * 下载文件到本地检查
 * @param {string} remotePath - 远程文件路径
 * @param {string} localPath - 本地文件路径
 */
function downloadFile(remotePath, localPath) {
    try {
        const command = `scp -o StrictHostKeyChecking=no root@47.83.203.60:${remotePath} ${localPath}`;
        console.log(`下载文件: ${remotePath} -> ${localPath}`);
        execSync(command, { env: { ...process.env, SSHPASS: 'root' } });
        return true;
    } catch (error) {
        console.error(`文件下载失败: ${error.message}`);
        return false;
    }
}

/**
 * 上传修复后的文件
 * @param {string} localPath - 本地文件路径
 * @param {string} remotePath - 远程文件路径
 */
function uploadFile(localPath, remotePath) {
    try {
        const command = `scp -o StrictHostKeyChecking=no ${localPath} root@47.83.203.60:${remotePath}`;
        console.log(`上传文件: ${localPath} -> ${remotePath}`);
        execSync(command, { env: { ...process.env, SSHPASS: 'root' } });
        return true;
    } catch (error) {
        console.error(`文件上传失败: ${error.message}`);
        return false;
    }
}

/**
 * 修复导航栏问题
 * @param {string} filePath - 文件路径
 */
function fixNavbar(filePath) {
    console.log(`开始修复文件: ${filePath}`);
    
    // 下载文件
    const localPath = './temp.html';
    if (!downloadFile(filePath, localPath)) {
        console.error('无法下载文件，跳过修复');
        return;
    }
    
    // 读取文件内容
    let content = fs.readFileSync(localPath, 'utf8');
    
    // 检查并修复导航栏问题
    const navbarPattern = /<nav class="navbar navbar-expand-lg">(.*?)<\/nav>/s;
    const match = content.match(navbarPattern);
    
    if (match) {
        console.log('找到导航栏，检查是否需要修复...');
        
        // 检查常见问题：缺少navbar-light或navbar-dark类
        if (!match[0].includes('navbar-light') && !match[0].includes('navbar-dark')) {
            console.log('修复：添加navbar-light和bg-light类');
            content = content.replace(
                '<nav class="navbar navbar-expand-lg">',
                '<nav class="navbar navbar-expand-lg navbar-light bg-light">'
            );
        }
        
        // 检查是否有container或container-fluid
        if (!match[0].includes('container') && !match[0].includes('container-fluid')) {
            console.log('修复：添加container-fluid');
            // 在nav标签后添加container-fluid
            const navOpenIndex = content.indexOf('<nav class="navbar navbar-expand-lg');
            const navCloseBracketIndex = content.indexOf('>', navOpenIndex);
            content = content.slice(0, navCloseBracketIndex + 1) + 
                      '<div class="container-fluid">' + 
                      content.slice(navCloseBracketIndex + 1);
            
            // 在</nav>前添加</div>
            const navCloseIndex = content.indexOf('</nav>');
            content = content.slice(0, navCloseIndex) + '</div>' + content.slice(navCloseIndex);
        }
        
        // 检查logo图片路径是否正确
        if (content.includes('<img src="') && !content.includes('<img src="/img/')) {
            console.log('修复：更新logo图片路径');
            content = content.replace(/<img src="img\//g, '<img src="/img/');
        }
        
        // 检查导航链接是否正确
        if (content.includes('<a href="') && !content.includes('<a href="/user-web/')) {
            console.log('修复：更新导航链接路径');
            // 修复指向其他页面的链接
            content = content.replace(/<a href="(\w+\.html)"/g, '<a href="/$1"');
        }
        
        // 保存修复后的内容
        fs.writeFileSync(localPath, content, 'utf8');
        console.log('文件修复完成，准备上传...');
        
        // 上传修复后的文件
        if (uploadFile(localPath, filePath)) {
            console.log(`文件 ${filePath} 修复成功！`);
        } else {
            console.error(`文件 ${filePath} 上传失败`);
        }
    } else {
        console.error('未找到导航栏结构');
    }
    
    // 清理临时文件
    try {
        fs.unlinkSync(localPath);
    } catch (error) {
        console.error(`清理临时文件失败: ${error.message}`);
    }
}

// 主函数
function main() {
    console.log('开始修复导航栏问题...');
    
    // 需要修复的文件列表
    const filesToFix = [
        '/var/www/tgcf/user-web/角色介绍.html',
        '/var/www/tgcf/user-web/留言板.html'
    ];
    
    // 为每个文件创建备份
    filesToFix.forEach(file => {
        const backupFile = `${file}.backup_${Date.now()}`;
        console.log(`创建备份: ${file} -> ${backupFile}`);
        safeSshCommand(`cp ${file} ${backupFile}`);
    });
    
    // 修复每个文件
    filesToFix.forEach(file => {
        fixNavbar(file);
    });
    
    console.log('所有文件修复完成！');
}

// 运行主函数
if (require.main === module) {
    main();
}