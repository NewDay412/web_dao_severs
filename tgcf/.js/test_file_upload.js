const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * 测试文件上传功能
 * 验证文件上传后是否同时保存到用户表和管理员表
 */
async function testFileUpload() {
    try {
        // 准备测试数据
        const testUser = 'user';
        const adminUser = 'admin';
        
        // 检查是否存在测试图片，不存在则创建一个简单的图片
        const testImagePath = path.join(__dirname, 'test_image.png');
        if (!fs.existsSync(testImagePath)) {
            // 创建一个简单的PNG文件（1x1像素）
            const pngData = Buffer.from([
                0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
                0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89,
                0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0x60, 0x00, 0x00, 0x00, 0x02,
                0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
            ]);
            fs.writeFileSync(testImagePath, pngData);
            console.log('✅ 创建了测试图片');
        }

        // 创建FormData
        const formData = new FormData();
        formData.append('sender_name', testUser);
        formData.append('receiver_name', adminUser);
        formData.append('file', fs.createReadStream(testImagePath));

        // 发送文件上传请求
        console.log('📤 正在上传测试图片...');
        const uploadResponse = await axios.post('http://localhost:3003/api/chat/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${Buffer.from(`${testUser}:password`).toString('base64')}`
            }
        });

        console.log('✅ 文件上传成功:', uploadResponse.data);

        // 验证消息是否在管理员表中
        console.log('🔍 验证消息是否同步到管理员表...');
        const adminMessagesResponse = await axios.get('http://localhost:3003/api/chat/messages', {
            headers: {
                'Authorization': `Bearer ${Buffer.from(`${adminUser}:password`).toString('base64')}`
            }
        });

        const messages = adminMessagesResponse.data.data;
        const uploadedMessage = messages.find(msg => 
            msg.sender_name === testUser && 
            msg.receiver_name === adminUser && 
            (msg.image_url || msg.video_url)
        );

        if (uploadedMessage) {
            console.log('✅ 消息已成功同步到管理员表:', {
                messageId: uploadedMessage.id,
                sender: uploadedMessage.sender_name,
                receiver: uploadedMessage.receiver_name,
                hasImage: !!uploadedMessage.image_url,
                hasVideo: !!uploadedMessage.video_url
            });
            return true;
        } else {
            console.log('❌ 消息未同步到管理员表');
            return false;
        }

    } catch (error) {
        console.error('❌ 测试失败:', error.response ? error.response.data : error.message);
        return false;
    }
}

/**
 * 主测试函数
 */
async function main() {
    console.log('🚀 开始测试文件上传功能...');
    const success = await testFileUpload();
    if (success) {
        console.log('🎉 所有测试通过！文件上传功能正常工作。');
        process.exit(0);
    } else {
        console.log('💥 测试失败！文件上传功能有问题。');
        process.exit(1);
    }
}

// 检查是否存在FormData模块，如果不存在则安装
let FormData;
try {
    FormData = require('form-data');
    main();
} catch (error) {
    console.log('🔧 正在安装form-data模块...');
    const { execSync } = require('child_process');
    execSync('npm install form-data', { stdio: 'inherit' });
    FormData = require('form-data');
    main();
}
