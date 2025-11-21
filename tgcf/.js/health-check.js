#!/usr/bin/env node

/**
 * 健康检查脚本
 * 检查服务器和数据库连接状态
 */

const http = require('http');
const mysql = require('mysql2/promise');

console.log('🏥 开始健康检查...\n');

// 检查项目
const checks = {
  server: false,
  database: false,
  api: false
};

// 1. 检查服务器是否运行
async function checkServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3003/health', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.status === 'ok') {
            console.log('✅ 服务器运行正常');
            console.log(`   版本: ${response.version}`);
            console.log(`   时间: ${response.timestamp}`);
            checks.server = true;
          } else {
            console.log('❌ 服务器状态异常');
          }
        } catch (error) {
          console.log('❌ 服务器响应格式错误');
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('❌ 无法连接到服务器 (http://localhost:3003)');
      console.log(`   错误: ${error.message}`);
      console.log('   请确保服务器已启动');
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log('❌ 服务器连接超时');
      req.destroy();
      resolve();
    });
  });
}

// 2. 检查数据库连接
async function checkDatabase() {
  try {
    // 数据库配置
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Mysql'
    };

    console.log('🗄️  检查数据库连接...');
    
    // 测试基本连接
    const connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功');
    
    // 检查数据库是否存在
    const databases = ['web_project', 'web_userdao', 'web_admindao'];
    for (const dbName of databases) {
      try {
        const [rows] = await connection.execute(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [dbName]);
        if (rows.length > 0) {
          console.log(`✅ 数据库存在: ${dbName}`);
        } else {
          console.log(`⚠️  数据库不存在: ${dbName} (将在首次启动时创建)`);
        }
      } catch (error) {
        console.log(`❌ 检查数据库失败: ${dbName}`);
      }
    }
    
    await connection.end();
    checks.database = true;
    
  } catch (error) {
    console.log('❌ 数据库连接失败');
    console.log(`   错误: ${error.message}`);
    console.log('   请检查:');
    console.log('   1. MySQL服务是否启动');
    console.log('   2. 数据库密码是否正确');
    console.log('   3. 数据库配置是否正确');
  }
}

// 3. 检查API接口
async function checkAPI() {
  const endpoints = [
    { path: '/api/user/home-content', name: '首页内容接口' },
    { path: '/api/user/character', name: '角色信息接口' },
    { path: '/api/user/message', name: '留言板接口' }
  ];

  console.log('🔌 检查API接口...');
  
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:3003${endpoint.path}`, (res) => {
          if (res.statusCode === 200) {
            console.log(`✅ ${endpoint.name}`);
            successCount++;
          } else {
            console.log(`⚠️  ${endpoint.name} (状态码: ${res.statusCode})`);
          }
          resolve();
        });

        req.on('error', (error) => {
          console.log(`❌ ${endpoint.name} (${error.message})`);
          resolve();
        });

        req.setTimeout(3003, () => {
          console.log(`❌ ${endpoint.name} (超时)`);
          req.destroy();
          resolve();
        });
      });
    } catch (error) {
      console.log(`❌ ${endpoint.name} (${error.message})`);
    }
  }
  
  if (successCount === endpoints.length) {
    checks.api = true;
  }
}

// 主函数
async function main() {
  await checkServer();
  console.log();
  
  await checkDatabase();
  console.log();
  
  if (checks.server) {
    await checkAPI();
    console.log();
  }
  
  // 总结
  console.log('📋 健康检查总结:');
  console.log('==================');
  
  const checkItems = [
    { name: '服务器状态', status: checks.server },
    { name: '数据库连接', status: checks.database },
    { name: 'API接口', status: checks.api }
  ];
  
  let passedCount = 0;
  
  for (const item of checkItems) {
    const status = item.status ? '✅' : '❌';
    console.log(`${status} ${item.name}`);
    if (item.status) passedCount++;
  }
  
  console.log(`\n通过检查: ${passedCount}/${checkItems.length}`);
  
  if (passedCount === checkItems.length) {
    console.log('\n🎉 所有检查通过！系统运行正常。');
  } else {
    console.log('\n⚠️  发现问题，请根据上述提示进行修复。');
    
    if (!checks.server) {
      console.log('\n💡 服务器问题解决方案:');
      console.log('1. 运行 start-server.bat 启动服务器');
      console.log('2. 检查端口3003是否被占用');
      console.log('3. 查看控制台错误信息');
    }
    
    if (!checks.database) {
      console.log('\n💡 数据库问题解决方案:');
      console.log('1. 启动MySQL服务');
      console.log('2. 检查数据库密码配置');
      console.log('3. 确认MySQL安装正确');
    }
  }
  
  console.log('\n🔗 更多帮助请查看 DEPLOYMENT_GUIDE.md');
}

// 运行检查
main().catch(console.error);