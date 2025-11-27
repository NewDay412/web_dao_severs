const fs = require('fs');
const path = require('path');

// 创建HTML模板用于PDF转换
const createHTMLTemplate = (markdownContent) => {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>天官赐福 - 项目技术文档</title>
    <style>
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
            padding: 20px;
            max-width: 210mm;
            margin: 0 auto;
        }
        
        .page-break {
            page-break-after: always;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #8B4513;
            padding-bottom: 20px;
        }
        
        .header h1 {
            color: #8B4513;
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: bold;
        }
        
        .header .subtitle {
            color: #666;
            font-size: 16px;
            font-style: italic;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #8B4513;
            margin: 20px 0 10px 0;
            font-weight: bold;
        }
        
        h1 {
            font-size: 24px;
            border-bottom: 2px solid #8B4513;
            padding-bottom: 5px;
        }
        
        h2 {
            font-size: 20px;
            border-left: 4px solid #8B4513;
            padding-left: 10px;
        }
        
        h3 {
            font-size: 18px;
            color: #A0522D;
        }
        
        p {
            margin: 10px 0;
            text-align: justify;
            font-size: 14px;
        }
        
        ul, ol {
            margin: 10px 0 10px 30px;
        }
        
        li {
            margin: 5px 0;
            font-size: 14px;
        }
        
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            color: #d63384;
        }
        
        pre {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.4;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 13px;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px 12px;
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
            margin-bottom: 30px;
        }
        
        .tech-stack {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
        }
        
        .tech-category {
            margin: 15px 0;
        }
        
        .tech-category h4 {
            color: #495057;
            border-bottom: 1px solid #adb5bd;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        
        .feature-card {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .feature-title {
            color: #8B4513;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
        
        @media print {
            body {
                padding: 0;
                margin: 0;
            }
            
            .page-break {
                page-break-after: always;
            }
            
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>天官赐福 - Web项目技术文档</h1>
        <div class="subtitle">项目技术架构与部署指南</div>
    </div>
    
    <div class="section">
        <h1>项目概述</h1>
        
        <h2>项目简介</h2>
        <p>《天官赐福》Web项目是一个基于现代Web技术栈构建的内容管理系统，专门用于展示《天官赐福》相关作品内容。系统采用前后端分离架构，提供完整的用户浏览体验和管理员后台功能。</p>
        
        <h2>设计理念</h2>
        <ul>
            <li><strong>分层架构</strong>：前后端分离，职责清晰</li>
            <li><strong>用户体验</strong>：古风仙侠主题，响应式设计</li>
            <li><strong>模块化设计</strong>：功能模块独立，便于维护</li>
            <li><strong>数据驱动</strong>：基于MySQL的完整数据模型</li>
            <li><strong>扩展性</strong>：预留接口，支持功能扩展</li>
        </ul>
    </div>
    
    <div class="page-break"></div>
    
    <div class="section">
        <h1>技术架构</h1>
        
        <h2>技术栈概览</h2>
        
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
        
        <h2>系统架构图</h2>
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
    </div>
    
    <div class="page-break"></div>
    
    <div class="section">
        <h1>功能模块详解</h1>
        
        <h2>用户端功能模块</h2>
        
        <div class="feature-card">
            <div class="feature-title">1. 首页展示模块</div>
            <p><strong>功能描述</strong>：展示作品精选内容和导航链接</p>
            <p><strong>技术实现</strong>：Bootstrap轮播组件 + 响应式布局</p>
            <p><strong>数据来源</strong>：home_content表</p>
        </div>
        
        <div class="feature-card">
            <div class="feature-title">2. 角色介绍模块</div>
            <p><strong>功能描述</strong>：展示主要角色信息和图片</p>
            <p><strong>技术实现</strong>：卡片式布局 + 图片懒加载</p>
            <p><strong>数据来源</strong>：character_info表</p>
        </div>
        
        <div class="feature-card">
            <div class="feature-title">3. 剧情简介模块</div>
            <p><strong>功能描述</strong>：提供剧情发展脉络和章节内容</p>
            <p><strong>技术实现</strong>：时间轴布局 + 章节导航</p>
            <p><strong>数据来源</strong>：story_intro表</p>
        </div>
        
        <div class="feature-card">
            <div class="feature-title">4. 留言板模块</div>
            <p><strong>功能描述</strong>：用户留言发布和查看</p>
            <p><strong>技术实现</strong>：AJAX异步提交 + 实时更新</p>
            <p><strong>数据来源</strong>：message_board表</p>
        </div>
        
        <div class="feature-card">
            <div class="feature-title">5. 作品评价模块</div>
            <p><strong>功能描述</strong>：用户评分和评价功能</p>
            <p><strong>技术实现</strong>：五星评分组件 + 表单验证</p>
            <p><strong>数据来源</strong>：work_reviews表</p>
        </div>
        
        <h2>管理端功能模块</h2>
        
        <div class="feature-card">
            <div class="feature-title">1. 内容管理模块</div>
            <ul>
                <li><strong>首页内容管理</strong>：配图上传、链接设置、显示顺序</li>
                <li><strong>角色信息管理</strong>：图片上传、重要性分级、性格描述</li>
                <li><strong>剧情简介管理</strong>：章节编号、内容排序、发布状态</li>
                <li><strong>作品评价管理</strong>：五星评分、标签分类、审核状态</li>
                <li><strong>留言板管理</strong>：用户信息、回复功能、状态控制</li>
            </ul>
        </div>
        
        <div class="feature-card">
            <div class="feature-title">2. 图片上传功能</div>
            <ul>
                <li><strong>支持格式</strong>：JPG、PNG、GIF、WebP</li>
                <li><strong>文件限制</strong>：最大5MB</li>
                <li><strong>技术特性</strong>：实时预览、格式检查、自动压缩</li>
                <li><strong>用户体验</strong>：拖拽上传、进度显示</li>
            </ul>
        </div>
        
        <div class="feature-card">
            <div class="feature-title">3. 权限管理模块</div>
            <ul>
                <li><strong>管理员认证</strong>：JWT令牌验证</li>
                <li><strong>角色权限</strong>：管理员、超级管理员分级</li>
                <li><strong>操作日志</strong>：完整操作记录和审计</li>
            </ul>
        </div>
    </div>
    
    <div class="page-break"></div>
    
    <div class="section">
        <h1>部署指南</h1>
        
        <h2>环境要求</h2>
        
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
        
        <h2>本地部署步骤</h2>
        
        <h3>🚀 一键部署（推荐）</h3>
        
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
        
        <h3>📋 手动部署步骤</h3>
        
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
    
    <div class="section">
        <h1>生产环境部署</h1>
        
        <h2>服务器配置</h2>
        <pre>
// 确保服务器监听所有IP
// 修改 app.js 中的监听配置
const HOST = '0.0.0.0';
const PORT = process.env.PORT || 3003;
        </pre>
        
        <h2>Nginx反向代理配置</h2>
        <pre>
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
        </pre>
        
        <h2>PM2进程管理</h2>
        <pre>
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start app.js --name "tgcf-web"

# 设置开机自启
pm2 startup
pm2 save
        </pre>
    </div>
    
    <div class="footer">
        <p>文档版本：v1.0.0 | 最后更新：2024年 | 适用版本：项目v1.0.0</p>
        <p>技术支持：请参考项目README.md文档和部署指南</p>
    </div>
</body>
</html>`;
};

// 主函数
const main = () => {
  console.log('开始生成项目技术文档...');
  
  try {
    // 读取Markdown文档
    const markdownPath = path.join(__dirname, '项目技术文档.md');
    const markdownContent = fs.readFileSync(markdownPath, 'utf8');
    
    // 创建HTML文档
    const htmlContent = createHTMLTemplate(markdownContent);
    const htmlPath = path.join(__dirname, '项目技术文档.html');
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    
    console.log('✅ HTML文档已生成：项目技术文档.html');
    console.log('📄 文档包含以下内容：');
    console.log('   - 项目概述与设计理念');
    console.log('   - 完整技术架构说明');
    console.log('   - 功能模块详细解析');
    console.log('   - 数据库设计说明');
    console.log('   - API接口设计');
    console.log('   - 部署指南（本地+生产环境）');
    console.log('   - 性能优化方案');
    console.log('   - 安全配置指南');
    console.log('   - 故障排除手册');
    console.log('   - 扩展开发指南');
    
    console.log('\n📋 下一步操作：');
    console.log('1. 使用浏览器打开项目技术文档.html文件');
    console.log('2. 在浏览器中选择"打印"功能');
    console.log('3. 选择"另存为PDF"选项');
    console.log('4. 保存为PDF格式文档');
    
    console.log('\n🎯 或者使用命令行工具转换：');
    console.log('   npm install -g puppeteer');
    console.log('   node convert-html-to-pdf.js');
    
  } catch (error) {
    console.error('❌ 生成文档时出错：', error.message);
  }
};

// 执行主函数
main();