const fs = require('fs');
const path = require('path');

console.log('检查图片上传功能...');

// 检查uploads目录
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ 创建uploads目录');
} else {
    console.log('✅ uploads目录已存在');
}

// 检查multer依赖
try {
    require('multer');
    console.log('✅ multer依赖已安装');
} catch (error) {
    console.log('❌ multer依赖未安装，请运行: npm install multer');
    process.exit(1);
}

// 检查后端配置
const adminRoutesPath = path.join(__dirname, 'node-backend', 'api', 'admin.routes.js');
if (fs.existsSync(adminRoutesPath)) {
    const content = fs.readFileSync(adminRoutesPath, 'utf8');
    if (content.includes('upload-image')) {
        console.log('✅ 图片上传API已配置');
    } else {
        console.log('❌ 图片上传API未配置');
    }
} else {
    console.log('❌ admin.routes.js文件不存在');
}

console.log('\n图片上传功能检查完成！');
console.log('如果仍有问题，请：');
console.log('1. 确保后端服务正在运行');
console.log('2. 检查浏览器控制台错误信息');
console.log('3. 确认管理员已登录并有有效token');