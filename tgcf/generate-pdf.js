const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 创建完整的HTML内容
const createHTMLContent = () => {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>天官赐福 - 项目技术文档</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Microsoft YaHei', 'SimSun', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
            padding: 0;
            max-width: 210mm;
            margin: 0 auto;
            font-size: 12px;
        }
        
        .page-break {
            page-break-after: always;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 3px solid #8B4513;
            padding-bottom: 15px;
        }
        
        .header h1 {
            color: #8B4513;
            font-size: 24px;
            margin-bottom: 8px;
            font-weight: bold;
        }
        
        .header .subtitle {
            color: #666;
            font-size: 14px;
            font-style: italic;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #8B4513;
            margin: 15px 0 8px 0;
            font-weight: bold;
        }
        
        h1 {
            font-size: 18px;
            border-bottom: 2px solid #8B4513;
            padding-bottom: 4px;
            page-break-after: avoid;
        }
        
        h2 {
            font-size: 16px;
            border-left: 4px solid #8B4513;
            padding-left: 8px;
            page-break-after: avoid;
        }
        
        h3 {
            font-size: 14px;
            color: #A0522D;
            page-break-after: avoid;
        }
        
        p {
            margin: 8px 0;
            text-align: justify;
            font-size: 12px;
            page-break-inside: avoid;
        }
        
        ul, ol {
            margin: 8px 0 8px 20px;
            page-break-inside: avoid;
        }
        
        li {
            margin: 4px 0;
            font-size: 12px;
            page-break-inside: avoid;
        }
        
        code {
            background: #f4f4f4;
            padding: 1px 4px;
            border-radius: 2px;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #d63384;
        }
        
        pre {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 10px;
            margin: 10px 0;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.3;
            page-break-inside: avoid;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 11px;
            page-break-inside: avoid;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 6px 8px;
            text-align: left;
        }
        
        th {
            background: #8B4513;
            color: white;
            font-weight: bold;
        }
        
        tr:nth-child(even) {
            background: #f9f9f9;
        }
        
        .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        
        .tech-stack {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 15px;
            margin: 10px 0;
            page-break-inside: avoid;
        }
        
        .tech-category {
            margin: 10px 0;
        }
        
        .tech-category h4 {
            color: #495057;
            border-bottom: 1px solid #adb5bd;
            padding-bottom: 4px;
            margin-bottom: 8px;
            font-size: 13px;
        }
        
        .feature-card {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 12px;
            margin: 8px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            page-break-inside: avoid;
        }
        
        .feature-title {
            color: #8B4513;
            font-weight: bold;
            margin-bottom: 6px;
            font-size: 13px;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 10px;
        }
        
        .cover-page {
            text-align: center;
            padding: 50px 20px;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        
        .cover-title {
            font-size: 32px;
            color: #8B4513;
            margin-bottom: 20px;
            font-weight: bold;
        }
        
        .cover-subtitle {
            font-size: 18px;
            color: #666;
            margin-bottom: 40px;
        }
        
        .cover-info {
            font-size: 14px;
            color: #888;
            margin-top: 40px;
        }
        
        .toc {
            margin: 20px 0;
            page-break-after: always;
        }
        
        .toc h2 {
            text-align: center;
            border: none;
            padding: 0;
        }
        
        .toc ul {
            list-style-type: none;
            margin-left: 0;
        }
        
        .toc li {
            margin: 5px 0;
        }
        
        .toc a {
            text-decoration: none;
            color: #333;
        }
        
        .toc-level-1 {
            font-weight: bold;
            margin-left: 0;
        }
        
        .toc-level-2 {
            margin-left: 20px;
        }
        
        .toc-level-3 {
            margin-left: 40px;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <!-- 封面页 -->
    <div class="cover-page">
        <h1 class="cover-title">天官赐福</h1>
        <h2 class="cover-subtitle">Web项目技术文档</h2>
        <div class="cover-info">
            <p>版本：v1.0.0</p>
            <p>最后更新：2024年</p>
            <p>文档编号：TGCF-TD-2024-001</p>
        </div>
    </div>
    
    <div class="page-break"></div>
    
    <!-- 目录页 -->
    <div class="toc">
        <h2>目录</h2>
        <ul>
            <li class="toc-level-1"><a href="#section-1">1. 项目概述</a></li>
            <li class="toc-level-2"><a href="#section-1-1">1.1 项目简介</a></li>
            <li class="toc-level-2"><a href="#section-1-2">1.2 设计理念</a></li>
            
            <li class="toc-level-1"><a href="#section-2">2. 技术架构</a></li>
            <li class="toc-level-2"><a href="#section-2-1">2.1 技术栈概览</a></li>
            <li class="toc-level-2"><a href="#section-2-2">2.2 系统架构图</a></li>
            <li class="toc-level-2"><a href="#section-2-3">2.3 核心模块说明</a></li>
            
            <li class="toc-level-1"><a href="#section-3">3. 功能模块详解</a></li>
            <li class="toc-level-2"><a href="#section-3-1">3.1 用户端功能模块</a></li>
            <li class="toc-level-2"><a href="#section-3-2">3.2 管理端功能模块</a></li>
            
            <li class="toc-level-1"><a href="#section-4">4. 数据库设计</a></li>
            <li class="toc-level-2"><a href="#section-4-1">4.1 数据库架构</a></li>
            <li class="toc-level-2"><a href="#section-4-2">4.2 核心表结构</a></li>
            
            <li class="toc-level-1"><a href="#section-5">5. API接口设计</a></li>
            <li class="toc-level-2"><a href="#section-5-1">5.1 用户接口</a></li>
            <li class="toc-level-2"><a href="#section-5-2">5.2 管理员接口</a></li>
            
            <li class="toc-level-1"><a href="#section-6">6. 部署指南</a></li>
            <li class="toc-level-2"><a href="#section-6-1">6.1 环境要求</a></li>
            <li class="toc-level-2"><a href="#section-6-2">6.2 本地部署</a></li>
            <li class="toc-level-2"><a href="#section-6-3">6.3 生产环境部署</a></li>
            
            <li class="toc-level-1"><a href="#section-7">7. 性能优化</a></li>
            <li class="toc-level-2"><a href="#section-7-1">7.1 前端优化</a></li>
            <li class="toc-level-2"><a href="#section-7-2">7.2 后端优化</a></li>
            
            <li class="toc-level-1"><a href="#section-8">8. 安全配置</a></li>
            <li class="toc-level-2"><a href="#section-8-1">8.1 应用安全</a></li>
            <li class="toc-level-2"><a href="#section-8-2">8.2 服务器安全</a></li>
            
            <li class="toc-level-1"><a href="#section-9">9. 故障排除</a></li>
            <li class="toc-level-2"><a href="#section-9-1">9.1 常见问题</a></li>
            <li class="toc-level-2"><a href="#section-9-2">9.2 日志分析</a></li>
            
            <li class="toc-level-1"><a href="#section-10">10. 扩展开发</a></li>
            <li class="toc-level-2"><a href="#section-10-1">10.1 功能扩展</a></li>
            <li class="toc-level-2"><a href="#section-10-2">10.2 技术升级</a></li>
            
            <li class="toc-level-1"><a href="#section-11">11. 维护指南</a></li>
            <li class="toc-level-2"><a href="#section-11-1">11.1 日常维护</a></li>
            <li class="toc-level-2"><a href="#section-11-2">11.2 版本管理</a></li>
        </ul>
    </div>
    
    <div class="page-break"></div>
    
    <!-- 正文内容 -->
    <div class="section" id="section-1">
        <h1>1. 项目概述</h1>
        
        <h2 id="section-1-1">1.1 项目简介</h2>
        <p>《天官赐福》Web项目是一个基于现代Web技术栈构建的内容管理系统，专门用于展示《天官赐福》相关作品内容。系统采用前后端分离架构，提供完整的用户浏览体验和管理员后台功能。</p>
        
        <h2 id="section-1-2">1.2 设计理念</h2>
        <ul>
            <li><strong>分层架构</strong>：前后端分离，职责清晰</li>
            <li><strong>用户体验</strong>：古风仙侠主题，响应式设计</li>
            <li><strong>模块化设计</strong>：功能模块独立，便于维护</li>
            <li><strong>数据驱动</strong>：基于MySQL的完整数据模型</li>
            <li><strong>扩展性</strong>：预留接口，支持功能扩展</li>
        </ul>
    </div>
    
    <div class="page-break"></div>
    
    <div class="section" id="section-2">
        <h1>2. 技术架构</h1>
        
        <h2 id="section-2-1">2.1 技术栈概览</h2>
        
        <div class="tech-stack">
            <div class="tech-category">
                <h4>后端技术栈</h4>
                <ul>
                    <li><strong>运行时环境</strong>：Node.js 14.0+</li>
                    <li><strong>Web框架</strong>：Express.js 4.18.2</li>
                    <li><strong>数据库</strong>：MySQL 5.7+</li>
                    <li><strong>数据库驱动</strong>：mysql2 3.6.5</li>
                    <li><strong>安全认证</strong>：JWT (jsonwebtoken 9.0.2)</li>
                    <li><strong>文件上传</strong>：Multer 1.4.5</li>
                    <li><strong>安全防护</strong>：Helmet 8.1.0</li>
                    <li><strong>跨域支持</strong>：CORS 2.8.5</li>
                    <li><strong>密码加密</strong>：bcrypt 6.0.0</li>
                    <li><strong>日志记录</strong>：Morgan 1.10.1</li>
                    <li><strong>性能优化</strong>：Compression 1.7.4</li>
                </ul>
            </div>
            
            <div class="tech-category">
                <h4>前端技术栈</h4>
                <ul>
                    <li><strong>HTML/CSS框架</strong>：Bootstrap 5.3.2</li>
                    <li><strong>图标库</strong>：Bootstrap Icons 1.11.1</li>
                    <li><strong>JavaScript库</strong>：jQuery 3.6.0</li>
                    <li><strong>响应式设计</strong>：CSS3媒体查询</li>
                    <li><strong>交互组件</strong>：Bootstrap组件库</li>
                </ul>
            </div>
            
            <div class="tech-category">
                <h4>开发工具</h4>
                <ul>
                    <li><strong>开发服务器</strong>：nodemon 3.0.2</li>
                    <li><strong>测试框架</strong>：Playwright 1.56.1</li>
                </ul>
            </div>
        </div>
        
        <h2 id="section-2-2">2.2 系统架构图</h2>
        <pre>
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   用户浏览器    │     │   管理员浏览器   │     │   MySQL数据库   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   user-web/     │     │   admin-web/    │     │  数据存储层     │
│   前端用户页面  │     │  管理员后台页面  │     │  (数据库表)     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └─────────────┬─────────┘                       │
                       ▼                                 │
┌─────────────────────────────────────────────────────────┐
│                     node-backend/                      │
│                  后端API服务层                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │   API   │  │  配置   │  │  模型   │  │  工具   │     │
│  │  路由   │  │  管理   │  │  定义   │  │  函数   │     │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │
└─────────────────────────────────────────────────────────┘
        </pre>
        
        <h2 id="section-2-3">2.3 核心模块说明</h2>
        
        <div class="feature-card">
            <div class="feature-title">API路由层</div>
            <ul>
                <li>处理HTTP请求和响应</li>
                <li>实现用户接口和管理员接口</li>
                <li>请求验证和错误处理</li>
            </ul>
        </div>
        
        <div class="feature-card">
            <div class="feature-title">数据模型层</div>
            <ul>
                <li>定义数据库表结构</li>
                <li>数据操作方法封装</li>
                <li>业务逻辑实现</li>
            </ul>
        </div>
        
        <div class="feature-card">
            <div class="feature-title">配置管理层</div>
            <ul>
                <li>数据库连接配置</li>
                <li>环境变量管理</li>
                <li>系统参数配置</li>
            </ul>
        </div>
        
        <div class="feature-card">
            <div class="feature-title">工具函数层</div>
            <ul>
                <li>通用工具方法</li>
                <li>辅助功能实现</li>
                <li>日志记录工具</li>
            </ul>
        </div>
    </div>
    
    <!-- 更多章节内容... -->
    
    <div class="page-break"></div>
    
    <div class="section" id="section-6">
        <h1>6. 部署指南</h1>
        
        <h2 id="section-6-1">6.1 环境要求</h2>
        
        <table>
            <tr>
                <th>组件</th>
                <th>要求</th>
                <th>说明</th>
            </tr>
            <tr>
                <td>操作系统</td>
                <td>Windows/Linux/macOS</td>
                <td>支持主流操作系统</td>
            </tr>
            <tr>
                <td>Node.js</td>
                <td>版本 14.0 或更高</td>
                <td>JavaScript运行时环境</td>
            </tr>
            <tr>
                <td>MySQL</td>
                <td>版本 5.7 或更高</td>
                <td>关系型数据库</td>
            </tr>
            <tr>
                <td>内存</td>
                <td>至少 2GB RAM</td>
                <td>运行内存要求</td>
            </tr>
            <tr>
                <td>磁盘空间</td>
                <td>至少 500MB 可用空间</td>
                <td>项目文件和数据库</td>
            </tr>
        </table>
        
        <h2 id="section-6-2">6.2 本地部署</h2>
        
        <h3>一键部署（推荐）</h3>
        
        <ol>
            <li><strong>下载项目文件</strong>
                <pre>cd /var/www/tgcf</pre>
            </li>
            <li><strong>安装MySQL数据库</strong>
                <ul>
                    <li>下载并安装MySQL Server</li>
                    <li>启动MySQL服务</li>
                    <li>记住root密码</li>
                </ul>
            </li>
            <li><strong>运行启动脚本</strong>
                <pre># Windows系统
start-server.bat

# Linux/macOS系统
./start-server.sh</pre>
            </li>
            <li><strong>自动配置过程</strong>
                <ul>
                    <li>自动安装Node.js依赖</li>
                    <li>自动创建数据库和表</li>
                    <li>自动插入默认数据</li>
                    <li>自动启动后端服务</li>
                </ul>
            </li>
            <li><strong>访问项目</strong>
                <ul>
                    <li>用户端：http://localhost:3003/user-web/天官赐福首页.html</li>
                    <li>管理端：http://localhost:3003/admin-web/admin.html</li>
                    <li>API接口：http://localhost:3003/api/</li>
                </ul>
            </li>
        </ol>
        
        <h3>手动部署步骤</h3>
        
        <ol>
            <li><strong>环境检查</strong>
                <pre>node check-environment.js</pre>
            </li>
            <li><strong>数据库配置</strong>
                <pre># 编辑数据库配置文件
vi node-backend/config/db.js

# 或设置环境变量
export DB_PASSWORD=your_password</pre>
            </li>
            <li><strong>安装依赖</strong>
                <pre>cd node-backend
npm install</pre>
            </li>
            <li><strong>启动服务</strong>
                <pre># 开发模式
npm run dev

# 生产模式
npm start</pre>
            </li>
            <li><strong>验证部署</strong>
                <pre># 健康检查
curl http://localhost:3003/health

# 功能测试
node health-check.js
node test-all-features.js</pre>
            </li>
        </ol>
    </div>
    
    <div class="page-break"></div>
    
    <div class="footer">
        <p>文档版本：v1.0.0 | 最后更新：2024年 | 适用版本：项目v1.0.0</p>
        <p>技术支持：请参考项目README.md文档和部署指南</p>
    </div>
</body>
</html>`;
};

// 生成PDF的主函数
const generatePDF = async () => {
  console.log('🚀 开始生成PDF文档...');
  
  try {
    // 创建浏览器实例
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // 创建新页面
    const page = await browser.newPage();
    
    // 设置页面内容
    const htmlContent = createHTMLContent();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // 生成PDF
    const pdfPath = path.join(__dirname, '天官赐福-项目技术文档.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      }
    });
    
    // 关闭浏览器
    await browser.close();
    
    console.log('✅ PDF文档生成成功！');
    console.log('📄 文件位置：' + pdfPath);
    console.log('\n📋 文档包含以下核心内容：');
    console.log('   ✅ 项目概述与设计理念');
    console.log('   ✅ 完整技术架构说明');
    console.log('   ✅ 功能模块详细解析');
    console.log('   ✅ 数据库设计说明');
    console.log('   ✅ API接口设计');
    console.log('   ✅ 部署指南（本地+生产环境）');
    console.log('   ✅ 性能优化方案');
    console.log('   ✅ 安全配置指南');
    console.log('   ✅ 故障排除手册');
    console.log('   ✅ 扩展开发指南');
    
    // 检查文件大小
    const stats = fs.statSync(pdfPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log('📊 文件大小：' + fileSizeInMB + ' MB');
    
  } catch (error) {
    console.error('❌ 生成PDF时出错：', error.message);
    
    // 如果Puppeteer不可用，创建HTML版本
    console.log('\n📝 创建HTML版本作为备选...');
    const htmlPath = path.join(__dirname, '天官赐福-项目技术文档.html');
    fs.writeFileSync(htmlPath, createHTMLContent(), 'utf8');
    console.log('✅ HTML版本已创建：' + htmlPath);
    console.log('💡 您可以使用浏览器打开此文件，然后选择"打印"→"另存为PDF"');
  }
};

// 执行生成
if (require.main === module) {
  generatePDF();
}

module.exports = { generatePDF };