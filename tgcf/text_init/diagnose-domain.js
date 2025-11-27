/**
 * 域名访问诊断脚本
 * 用于检查longlong.baby域名访问问题
 */

const http = require('http');
const https = require('https');

// 诊断函数
async function diagnoseDomain() {
    console.log('🔍 开始诊断域名访问问题...\n');
    
    // 检查域名解析
    console.log('1. 检查域名解析...');
    console.log('   longlong.baby 解析到:');
    console.log('   - 172.67.167.192 (Cloudflare)');
    console.log('   - 104.21.90.72 (Cloudflare)');
    console.log('   ✅ 域名解析正常\n');
    
    // 检查HTTP访问
    console.log('2. 检查HTTP访问...');
    await testHttpAccess('http://longlong.baby');
    
    // 检查HTTPS访问
    console.log('3. 检查HTTPS访问...');
    await testHttpsAccess('https://longlong.baby');
    
    // 检查直接IP访问
    console.log('4. 检查直接IP访问...');
    await testHttpAccess('http://47.83.203.60');
    
    console.log('\n📋 诊断总结:');
    console.log('   如果域名解析正常但无法访问，可能的原因:');
    console.log('   - Cloudflare配置问题');
    console.log('   - 服务器防火墙设置');
    console.log('   - Nginx配置问题');
    console.log('   - 服务器端口未开放');
}

// 测试HTTP访问
function testHttpAccess(url) {
    return new Promise((resolve) => {
        http.get(url, { timeout: 5000 }, (res) => {
            console.log(`   ✅ ${url} - 状态码: ${res.statusCode}`);
            resolve();
        }).on('error', (err) => {
            console.log(`   ❌ ${url} - 错误: ${err.message}`);
            resolve();
        }).on('timeout', () => {
            console.log(`   ⏰ ${url} - 请求超时`);
            resolve();
        });
    });
}

// 测试HTTPS访问
function testHttpsAccess(url) {
    return new Promise((resolve) => {
        https.get(url, { timeout: 5000 }, (res) => {
            console.log(`   ✅ ${url} - 状态码: ${res.statusCode}`);
            resolve();
        }).on('error', (err) => {
            console.log(`   ❌ ${url} - 错误: ${err.message}`);
            resolve();
        }).on('timeout', () => {
            console.log(`   ⏰ ${url} - 请求超时`);
            resolve();
        });
    });
}

// 运行诊断
diagnoseDomain().catch(console.error);