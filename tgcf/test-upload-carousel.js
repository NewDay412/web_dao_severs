const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置
const baseUrl = 'http://localhost:3003/api/admin';
const adminUsername = 'admin';
const adminPassword = 'admin123';
const testImagePath = path.join(__dirname, 'test_image.png');

// 错误处理函数
function handleError(error, operation) {
    console.error(`❌ ${operation}失败:`);
    if (error.response) {
        console.error(`   状态码: ${error.response.status}`);
        console.error(`   响应数据: ${JSON.stringify(error.response.data)}`);
        
        // 检查响应是否包含HTML
        const responseStr = JSON.stringify(error.response.data);
        if (responseStr.includes('<html>')) {
            console.error(`   注意: 收到HTML响应，可能是服务器错误页面`);
        }
        
        // 检查是否是令牌无效错误
        if (error.response.status === 401 && 
            error.response.data.message && 
            error.response.data.message.includes('令牌无效')) {
            console.error(`   注意: 令牌无效，可能需要重新登录或检查token格式`);
        }
    } else if (error.request) {
        console.error(`   请求已发送，但未收到响应`);
    } else {
        console.error(`   请求设置错误: ${error.message}`);
    }
    console.error(`   错误详情: ${error.message}`);
}

// 登录获取token
async function login() {
    try {
        console.log('🔐 正在登录...');
        const response = await axios.post(`${baseUrl}/login`, {
            username: adminUsername,
            password: adminPassword
        });
        console.log('✅ 登录成功');
        return response.data.token;
    } catch (error) {
        handleError(error, '登录');
        process.exit(1);
    }
}

// 测试上传图片
async function testUploadImage(token) {
    try {
        console.log('📤 正在测试上传图片...');
        
        // 检查测试图片是否存在
        if (!fs.existsSync(testImagePath)) {
            console.error('❌ 测试图片不存在:', testImagePath);
            return null;
        }
        
        // 准备表单数据
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testImagePath));
        
        const response = await axios.post(`${baseUrl}/upload-image`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        console.log('✅ 图片上传成功');
        console.log('   图片URL:', response.data.data.url);
        return response.data.data.url;
    } catch (error) {
        handleError(error, '图片上传');
        return null;
    }
}

// 测试添加轮播图
async function testAddCarousel(token, imageUrl) {
    try {
        console.log('🖼️  正在测试添加轮播图...');
        
        const response = await axios.post(`${baseUrl}/carousel`, {
            title: '测试轮播图',
            image_url: imageUrl,
            link_url: '#',
            description: '这是一个测试轮播图',
            display_order: 1,
            is_active: true
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ 轮播图添加成功');
        console.log('   轮播图ID:', response.data.data.id);
        return response.data.data.id;
    } catch (error) {
        handleError(error, '轮播图添加');
        return null;
    }
}

// 测试删除轮播图（清理测试数据）
async function testDeleteCarousel(token, carouselId) {
    if (!carouselId) return;
    
    try {
        console.log('🗑️  正在清理测试数据...');
        
        await axios.delete(`${baseUrl}/carousel/${carouselId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ 测试数据清理成功');
    } catch (error) {
        handleError(error, '测试数据清理');
    }
}

// 主函数
async function main() {
    console.log('🚀 开始测试上传图片和轮播图功能...');
    console.log('=' . repeat(50));
    
    try {
        // 1. 登录
        const token = await login();
        
        // 2. 测试上传图片
        const imageUrl = await testUploadImage(token);
        if (!imageUrl) {
            console.log('❌ 图片上传失败，无法继续测试轮播图添加');
            return;
        }
        
        // 3. 测试添加轮播图
        const carouselId = await testAddCarousel(token, imageUrl);
        
        // 4. 清理测试数据
        await testDeleteCarousel(token, carouselId);
        
        console.log('=' . repeat(50));
        console.log('🎉 所有测试完成');
        
    } catch (error) {
        console.error('❌ 测试过程中发生未预期的错误:', error.message);
        process.exit(1);
    }
}

// 运行测试
main();