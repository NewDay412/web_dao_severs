#!/usr/bin/env node

/**
 * 环境检查脚本
 * 检查项目运行所需的环境和依赖
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 开始检查项目环境...\n');

// 检查项目
const checks = {
  nodeVersion: false,
  projectStructure: false,
  dependencies: false,
  databaseConfig: false,
  uploads: false
};

// 1. 检查Node.js版本
try {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  console.log(`📦 Node.js版本: ${nodeVersion}`);
  
  if (majorVersion >= 14) {
    console.log('✅ Node.js版本符合要求 (>= 14.0)');
    checks.nodeVersion = true;
  } else {
    console.log('❌ Node.js版本过低，需要 >= 14.0');
  }
} catch (error) {
  console.log('❌ 无法检测Node.js版本');
}

console.log();

// 2. 检查项目结构
console.log('📁 检查项目结构...');
const requiredDirs = [
  'node-backend',
  'user-web',
  'admin-web',
  'css',
  'js',
  'img'
];

const requiredFiles = [
  'node-backend/package.json',
  'node-backend/app.js',
  'node-backend/config/db.js',
  'start-server.bat',
  'README.md'
];

let structureOk = true;

// 检查目录
for (const dir of requiredDirs) {
  if (fs.existsSync(dir)) {
    console.log(`✅ 目录存在: ${dir}`);
  } else {
    console.log(`❌ 目录缺失: ${dir}`);
    structureOk = false;
  }
}

// 检查文件
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ 文件存在: ${file}`);
  } else {
    console.log(`❌ 文件缺失: ${file}`);
    structureOk = false;
  }
}

checks.projectStructure = structureOk;
console.log();

// 3. 检查依赖包
console.log('📦 检查依赖包...');
try {
  const packageJsonPath = path.join('node-backend', 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(`✅ package.json存在`);
    
    // 检查关键依赖
    const requiredDeps = ['express', 'mysql2', 'cors', 'bcrypt', 'jsonwebtoken'];
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    let depsOk = true;
    for (const dep of requiredDeps) {
      if (dependencies[dep]) {
        console.log(`✅ 依赖存在: ${dep}@${dependencies[dep]}`);
      } else {
        console.log(`❌ 依赖缺失: ${dep}`);
        depsOk = false;
      }
    }
    
    // 检查node_modules
    const nodeModulesPath = path.join('node-backend', 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      console.log('✅ node_modules目录存在');
    } else {
      console.log('⚠️  node_modules目录不存在，需要运行 npm install');
      depsOk = false;
    }
    
    checks.dependencies = depsOk;
  } else {
    console.log('❌ package.json文件不存在');
  }
} catch (error) {
  console.log('❌ 检查依赖包失败:', error.message);
}

console.log();

// 4. 检查数据库配置
console.log('🗄️  检查数据库配置...');
try {
  const dbConfigPath = path.join('node-backend', 'config', 'db.js');
  if (fs.existsSync(dbConfigPath)) {
    console.log('✅ 数据库配置文件存在');
    
    // 读取配置文件内容
    const dbConfig = fs.readFileSync(dbConfigPath, 'utf8');
    
    // 检查关键配置
    if (dbConfig.includes('mysql')) {
      console.log('✅ MySQL配置存在');
    }
    
    if (dbConfig.includes('web_project') && dbConfig.includes('web_userdao') && dbConfig.includes('web_admindao')) {
      console.log('✅ 多数据库配置存在');
    }
    
    checks.databaseConfig = true;
  } else {
    console.log('❌ 数据库配置文件不存在');
  }
} catch (error) {
  console.log('❌ 检查数据库配置失败:', error.message);
}

console.log();

// 5. 检查上传目录
console.log('📁 检查上传目录...');
const uploadDirs = [
  'uploads',
  'node-backend/uploads'
];

let uploadsOk = true;
for (const dir of uploadDirs) {
  if (fs.existsSync(dir)) {
    console.log(`✅ 上传目录存在: ${dir}`);
  } else {
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ 创建上传目录: ${dir}`);
    } catch (error) {
      console.log(`❌ 无法创建上传目录: ${dir}`);
      uploadsOk = false;
    }
  }
}

checks.uploads = uploadsOk;
console.log();

// 6. 检查启动脚本
console.log('🚀 检查启动脚本...');
if (fs.existsSync('start-server.bat')) {
  console.log('✅ Windows启动脚本存在');
} else {
  console.log('⚠️  Windows启动脚本不存在');
}

console.log();

// 总结
console.log('📋 环境检查总结:');
console.log('==================');

const allChecks = Object.entries(checks);
const passedChecks = allChecks.filter(([, passed]) => passed).length;
const totalChecks = allChecks.length;

for (const [check, passed] of allChecks) {
  const status = passed ? '✅' : '❌';
  const name = {
    nodeVersion: 'Node.js版本',
    projectStructure: '项目结构',
    dependencies: '依赖包',
    databaseConfig: '数据库配置',
    uploads: '上传目录'
  }[check];
  
  console.log(`${status} ${name}`);
}

console.log(`\n通过检查: ${passedChecks}/${totalChecks}`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 环境检查全部通过！项目可以正常运行。');
  console.log('\n📝 下一步操作:');
  console.log('1. 确保MySQL服务已启动');
  console.log('2. 运行 start-server.bat 启动项目');
  console.log('3. 访问 http://localhost:3003/health 检查服务状态');
} else {
  console.log('\n⚠️  环境检查发现问题，请根据上述提示进行修复。');
  
  if (!checks.dependencies) {
    console.log('\n💡 修复依赖问题:');
    console.log('cd node-backend && npm install');
  }
  
  if (!checks.nodeVersion) {
    console.log('\n💡 升级Node.js:');
    console.log('访问 https://nodejs.org/ 下载最新版本');
  }
}

console.log('\n🔗 更多帮助请查看 README.md 文件');