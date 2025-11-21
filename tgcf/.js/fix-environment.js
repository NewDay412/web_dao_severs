#!/usr/bin/env node

/**
 * 环境修复脚本
 * 自动修复项目运行环境中的常见问题
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 开始修复项目环境...\n');

// 修复计数器
let fixCount = 0;

// 1. 创建缺失的目录
console.log('1. 检查并创建必要目录...');
const requiredDirs = [
  'node-backend/uploads',
  'uploads',
  'node-backend/api',
  'node-backend/config',
  'node-backend/models',
  'node-backend/utils'
];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   ✅ 已创建目录: ${dir}`);
      fixCount++;
    } catch (error) {
      console.log(`   ❌ 创建目录失败: ${dir} - ${error.message}`);
    }
  } else {
    console.log(`   ✅ 目录已存在: ${dir}`);
  }
});

// 2. 检查并修复package.json
console.log('\n2. 检查package.json配置...');
const packageJsonPath = path.join('node-backend', 'package.json');

if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // 检查必要的依赖
    const requiredDeps = {
      'express': '^4.18.2',
      'mysql2': '^3.6.5',
      'bcrypt': '^6.0.0',
      'cors': '^2.8.5',
      'helmet': '^8.1.0',
      'jsonwebtoken': '^9.0.2',
      'multer': '^1.4.5-lts.1',
      'morgan': '^1.10.1'
    };
    
    let needsUpdate = false;
    
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
      needsUpdate = true;
    }
    
    Object.entries(requiredDeps).forEach(([dep, version]) => {
      if (!packageJson.dependencies[dep]) {
        packageJson.dependencies[dep] = version;
        needsUpdate = true;
        console.log(`   ✅ 添加依赖: ${dep}@${version}`);
      }
    });
    
    // 检查scripts
    if (!packageJson.scripts) {
      packageJson.scripts = {};
      needsUpdate = true;
    }
    
    if (!packageJson.scripts.start) {
      packageJson.scripts.start = 'node app.js';
      needsUpdate = true;
      console.log('   ✅ 添加启动脚本');
    }
    
    if (needsUpdate) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('   ✅ package.json已更新');
      fixCount++;
    } else {
      console.log('   ✅ package.json配置正确');
    }
    
  } catch (error) {
    console.log(`   ❌ 处理package.json失败: ${error.message}`);
  }
} else {
  console.log('   ❌ package.json不存在');
}

// 3. 检查数据库配置
console.log('\n3. 检查数据库配置...');
const dbConfigPath = path.join('node-backend', 'config', 'db.js');

if (fs.existsSync(dbConfigPath)) {
  try {
    const dbConfig = fs.readFileSync(dbConfigPath, 'utf8');
    
    // 检查是否包含必要的配置
    const requiredConfigs = [
      'mysql.createPool',
      'web_project',
      'web_userdao', 
      'web_admindao'
    ];
    
    let configOk = true;
    requiredConfigs.forEach(config => {
      if (!dbConfig.includes(config)) {
        console.log(`   ⚠️  配置可能缺失: ${config}`);
        configOk = false;
      }
    });
    
    if (configOk) {
      console.log('   ✅ 数据库配置文件正确');
    } else {
      console.log('   ⚠️  数据库配置可能需要检查');
    }
    
  } catch (error) {
    console.log(`   ❌ 读取数据库配置失败: ${error.message}`);
  }
} else {
  console.log('   ❌ 数据库配置文件不存在');
}

// 4. 检查启动脚本
console.log('\n4. 检查启动脚本...');
const startScriptPath = 'start-server.bat';

if (fs.existsSync(startScriptPath)) {
  console.log('   ✅ 启动脚本存在');
} else {
  console.log('   ⚠️  启动脚本不存在，建议使用 start-server.bat');
}

// 5. 创建.gitkeep文件
console.log('\n5. 创建.gitkeep文件...');
const gitkeepDirs = [
  'node-backend/uploads',
  'uploads'
];

gitkeepDirs.forEach(dir => {
  const gitkeepPath = path.join(dir, '.gitkeep');
  if (fs.existsSync(dir) && !fs.existsSync(gitkeepPath)) {
    try {
      fs.writeFileSync(gitkeepPath, '# 保持目录结构\n');
      console.log(`   ✅ 已创建: ${gitkeepPath}`);
      fixCount++;
    } catch (error) {
      console.log(`   ❌ 创建.gitkeep失败: ${error.message}`);
    }
  }
});

// 6. 检查环境变量配置
console.log('\n6. 环境变量配置建议...');
const envExamplePath = '.env.example';

if (!fs.existsSync(envExamplePath)) {
  const envExample = `# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Mysql

# JWT密钥
JWT_SECRET=your_secret_key

# 服务端口
PORT=3003
`;
  
  try {
    fs.writeFileSync(envExamplePath, envExample);
    console.log('   ✅ 已创建环境变量示例文件: .env.example');
    fixCount++;
  } catch (error) {
    console.log(`   ❌ 创建环境变量示例文件失败: ${error.message}`);
  }
} else {
  console.log('   ✅ 环境变量示例文件已存在');
}

// 7. 检查权限（Windows）
console.log('\n7. 检查文件权限...');
try {
  // 测试写入权限
  const testFile = 'test-write-permission.tmp';
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('   ✅ 文件写入权限正常');
} catch (error) {
  console.log(`   ❌ 文件写入权限异常: ${error.message}`);
}

// 输出修复结果
console.log('\n' + '='.repeat(50));
console.log('🔧 环境修复完成');
console.log('='.repeat(50));
console.log(`✅ 共修复了 ${fixCount} 个问题`);

console.log('\n📝 下一步操作:');
console.log('1. 进入后端目录: cd node-backend');
console.log('2. 安装依赖: npm install');
console.log('3. 启动项目: npm start 或运行 start-server.bat');
console.log('4. 访问 http://localhost:3003/health 检查服务状态');

console.log('\n⚠️  重要提醒:');
console.log('- 确保MySQL服务已启动');
console.log('- 检查数据库密码配置（默认为"Mysql"）');
console.log('- 如需修改配置，请编辑 node-backend/config/db.js');

console.log('\n💡 如果遇到问题，请查看 README.md 获取详细说明');