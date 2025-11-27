# 天官赐福 - Web项目完整文档

## 文档概述

### 文档说明
本文档整合了README.md和项目技术文档.md的内容，提供了《天官赐福》Web项目的完整技术说明和使用指南。

### 版本信息
- **项目版本**：v2.1.0
- **文档版本**：v1.0.0
- **最后更新**：2024年
- **适用环境**：开发/测试/生产环境

---

## 第一章：项目简介

### 1.1 项目概述
《天官赐福》Web项目是一个基于现代Web技术栈构建的内容管理系统，专门用于展示《天官赐福》相关作品内容。系统采用前后端分离架构，提供完整的用户浏览体验和管理员后台功能。

### 1.2 设计理念
- **分层架构**：前后端分离，职责清晰
- **用户体验**：古风仙侠主题，响应式设计
- **模块化设计**：功能模块独立，便于维护
- **数据驱动**：基于MySQL的完整数据模型
- **扩展性**：预留接口，支持功能扩展

### 1.3 核心特性
- ✅ 完整的用户端浏览体验
- ✅ 专业的管理后台功能
- ✅ 响应式设计，多设备适配
- ✅ 安全的用户认证系统
- ✅ 图片上传和管理功能
- ✅ 实时留言和评价系统

---

## 第二章：系统功能

### 2.1 用户端功能模块

#### 2.1.1 首页展示模块
- **功能描述**：展示作品精选内容和导航链接
- **技术实现**：Bootstrap轮播组件 + 响应式布局
- **数据来源**：home_content表

#### 2.1.2 角色介绍模块
- **功能描述**：展示主要角色信息和图片
- **技术实现**：卡片式布局 + 图片懒加载
- **数据来源**：character_info表

#### 2.1.3 剧情简介模块
- **功能描述**：提供剧情发展脉络和章节内容
- **技术实现**：时间轴布局 + 章节导航
- **数据来源**：story_intro表

#### 2.1.4 留言板模块
- **功能描述**：用户留言发布和查看
- **技术实现**：AJAX异步提交 + 实时更新
- **数据来源**：message_board表

#### 2.1.5 作品评价模块
- **功能描述**：用户评分和评价功能
- **技术实现**：五星评分组件 + 表单验证
- **数据来源**：work_reviews表

### 2.2 管理端功能模块

#### 2.2.1 内容管理模块
- **首页内容管理**：配图上传、链接设置、显示顺序
- **角色信息管理**：图片上传、重要性分级、性格描述
- **剧情简介管理**：章节编号、内容排序、发布状态
- **作品评价管理**：五星评分、标签分类、审核状态
- **留言板管理**：用户信息、回复功能、状态控制

#### 2.2.2 图片上传功能
- **支持格式**：JPG、PNG、GIF、WebP
- **文件限制**：最大5MB
- **技术特性**：实时预览、格式检查、自动压缩
- **用户体验**：拖拽上传、进度显示

#### 2.2.3 权限管理模块
- **管理员认证**：JWT令牌验证
- **角色权限**：管理员、超级管理员分级
- **操作日志**：完整操作记录和审计

---

## 第三章：技术架构

### 3.1 技术栈概览

#### 3.1.1 后端技术栈
- **运行时环境**：Node.js 14.0+
- **Web框架**：Express.js 4.18.2
- **数据库**：MySQL 5.7+
- **数据库驱动**：mysql2 3.6.5
- **安全认证**：JWT (jsonwebtoken 9.0.2)
- **文件上传**：Multer 1.4.5
- **安全防护**：Helmet 8.1.0
- **跨域支持**：CORS 2.8.5
- **密码加密**：bcrypt 6.0.0
- **日志记录**：Morgan 1.10.1
- **性能优化**：Compression 1.7.4

#### 3.1.2 前端技术栈
- **HTML/CSS框架**：Bootstrap 5.3.2
- **图标库**：Bootstrap Icons 1.11.1
- **JavaScript库**：jQuery 3.6.0
- **响应式设计**：CSS3媒体查询
- **交互组件**：Bootstrap组件库

#### 3.1.3 开发工具
- **开发服务器**：nodemon 3.0.2
- **测试框架**：Playwright 1.56.1

### 3.2 系统架构图

```
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
```

### 3.3 核心模块说明

#### 3.3.1 API路由层
- 处理HTTP请求和响应
- 实现用户接口和管理员接口
- 请求验证和错误处理

#### 3.3.2 数据模型层
- 定义数据库表结构
- 数据操作方法封装
- 业务逻辑实现

#### 3.3.3 配置管理层
- 数据库连接配置
- 环境变量管理
- 系统参数配置

#### 3.3.4 工具函数层
- 通用工具方法
- 辅助功能实现
- 日志记录工具

---

## 第四章：数据库设计

### 4.1 数据库架构

#### 4.1.1 web_project数据库（内容管理）
- `home_content` - 首页内容表
- `character_info` - 角色信息表
- `story_intro` - 剧情简介表
- `work_reviews` - 作品评价表
- `message_board` - 留言板表
- `navigation_menu` - 导航菜单表

#### 4.1.2 web_userdao数据库（用户管理）
- `users` - 用户信息表
- `user_login_logs` - 用户登录日志表
- `user_collections` - 用户收藏表

#### 4.1.3 web_admindao数据库（管理员管理）
- `admins` - 管理员信息表
- `admin_operation_logs` - 管理员操作日志表
- `system_configs` - 系统配置表

### 4.2 核心表结构示例

#### 4.2.1 users表（用户信息）
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- bcrypt加密
    email VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active'
);
```

#### 4.2.2 character_info表（角色信息）
```sql
CREATE TABLE character_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    description TEXT,
    personality TEXT,
    importance_level ENUM('main', 'supporting', 'minor') DEFAULT 'main',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 第五章：账号与登录管理

### 5.1 账号类型

#### 5.1.1 用户账号
- **获取方式**：通过系统注册功能完成账号创建
- **注册流程**：填写用户名、密码、邮箱等信息
- **权限范围**：用户端功能访问权限

#### 5.1.2 管理员账号
- **默认账号**：`admin`
- **初始密码**：`admin123`（建议首次登录后立即修改）
- **权限范围**：管理后台所有功能权限

#### 5.1.3 测试账号
- **用户名**：`user1`
- **密码**：`password123`
- **用途**：功能测试和演示

### 5.2 登录流程

#### 5.2.1 用户登录流程
1. 访问登录页面：`http://longlong.baby/user-web/登录页面.html`
2. 输入用户名和密码
3. 系统验证账号信息
4. 验证通过后跳转至用户端首页
5. 开始使用系统功能

#### 5.2.2 管理员登录流程
1. 访问登录页面`http://longlong.baby/user-web/登录页面.html`
2. 输入管理员账号和密码
3. 系统验证管理员权限
4. 验证通过后跳转至管理后台
5. 开始进行内容管理操作

### 5.3 安全注意事项

⚠️ **重要安全提示**：
- 生产环境请立即修改默认密码
- 定期更换管理员密码
- 避免使用弱密码
- 启用双因素认证（如支持）

---

## 第六章：API接口设计

### 6.1 用户接口 (/api/user)

#### 6.1.1 留言相关接口
- `GET /api/user/message` - 获取留言列表
- `POST /api/user/message` - 提交留言
- 请求格式：JSON
- 响应格式：统一JSON格式

#### 6.1.2 内容获取接口
- `GET /api/user/character` - 获取角色信息
- `GET /api/user/home-content` - 获取首页内容
- `GET /api/user/story-intro` - 获取剧情简介
- `GET /api/user/reviews` - 获取作品评价列表

#### 6.1.3 评价提交接口
- `POST /api/user/reviews` - 提交作品评价
- 支持五星评分和文本评价
- 表单验证和评分验证

### 6.2 管理员接口 (/api/admin)

#### 6.2.1 认证接口
- `POST /api/admin/login` - 管理员登录
- JWT令牌生成和验证
- 登录状态管理

#### 6.2.2 内容管理接口
- `GET /api/admin/character` - 获取角色管理列表
- `PUT /api/admin/character/:id` - 更新角色信息
- `DELETE /api/admin/character/:id` - 删除角色

#### 6.2.3 留言管理接口
- `GET /api/admin/message` - 获取留言管理列表
- `PUT /api/admin/message/:id` - 更新留言状态
- `DELETE /api/admin/message/:id` - 删除留言

### 6.3 接口安全特性

#### 6.3.1 认证机制
- JWT令牌认证
- 令牌刷新机制
- 会话超时管理

#### 6.3.2 数据验证
- 输入参数验证
- SQL注入防护
- XSS攻击防护

#### 6.3.3 错误处理
- 统一错误响应格式
- 详细的错误信息
- 友好的错误提示

---

## 第七章：部署指南

### 7.1 环境要求

#### 7.1.1 系统要求
- **操作系统**：Windows/Linux/macOS
- **Node.js**：版本 14.0 或更高
- **MySQL**：版本 5.7 或更高
- **内存**：至少 2GB RAM
- **磁盘空间**：至少 500MB 可用空间

#### 7.1.2 软件依赖
- **数据库服务**：MySQL Server
- **Web服务器**：可选Nginx（生产环境）
- **开发工具**：现代浏览器、代码编辑器

### 7.2 本地部署步骤

#### 🚀 一键部署（推荐）

1. **下载项目文件**
   ```bash
   # 克隆或下载项目到本地目录
   cd /var/www/tgcf
   ```

2. **安装MySQL数据库**
   - 下载并安装MySQL Server
   - 启动MySQL服务
   - 记住root密码

3. **运行启动脚本**
   ```bash
   # Windows系统
   start-server.bat
   
   # Linux/macOS系统
   ./start-server.sh
   ```

4. **自动配置过程**
   - 自动安装Node.js依赖
   - 自动创建数据库和表
   - 自动插入默认数据
   - 自动启动后端服务

5. **访问项目**
   - 用户端：http://localhost:3003/user-web/天官赐福首页.html
   - 管理端：http://localhost:3003/admin-web/admin.html
   - API接口：http://localhost:3003/api/

#### 📋 手动部署步骤

**步骤1：环境检查**
```bash
node check-environment.js
```

**步骤2：数据库配置**
```bash
# 编辑数据库配置文件
vi node-backend/config/db.js

# 或设置环境变量
export DB_PASSWORD=your_password
```

**步骤3：安装依赖**
```bash
cd node-backend
npm install
```

**步骤4：启动服务**
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

**步骤5：验证部署**
```bash
# 健康检查
curl http://localhost:3003/health

# 功能测试
node health-check.js
node test-all-features.js
```

### 7.3 生产环境部署

#### 7.3.1 服务器配置
```bash
# 确保服务器监听所有IP
# 修改 app.js 中的监听配置
const HOST = '0.0.0.0';
const PORT = process.env.PORT || 3003;
```

#### 7.3.2 Nginx反向代理（推荐）
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 7.3.3 PM2进程管理
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start app.js --name "tgcf-web"

# 设置开机自启
pm2 startup
pm2 save
```

---

## 第八章：安全配置

### 8.1 应用安全

#### 8.1.1 认证安全
- JWT令牌安全配置
- 密码加密存储（bcrypt）
- 会话超时管理

#### 8.1.2 账号与登录管理
**测试账号获取**
- 用户通过系统注册功能完成账号创建
- 注册成功后可使用该账号密码登录

**管理员账号信息**
- 默认账号：`admin`
- 初始密码：`admin123`（建议首次登录后修改）

**登录流程**
- 所有账号均需通过登录页面提交验证
- 验证通过后按权限自动跳转至对应操作界面
- 用户账号跳转至用户端首页
- 管理员账号跳转至管理后台

#### 8.1.3 数据安全
- SQL注入防护
- XSS攻击防护
- CSRF保护

#### 8.1.4 文件安全
- 文件类型验证
- 文件大小限制
- 上传路径安全

### 8.2 服务器安全

#### 8.2.1 防火墙配置
- 端口访问控制
- IP白名单设置
- 异常访问监控

#### 8.2.2 系统安全
- 定期安全更新
- 日志监控和分析
- 备份策略实施

---

## 第九章：故障排除

### 9.1 常见问题

#### 9.1.1 服务启动失败
**问题**：端口被占用
**解决**：
```bash
# 查找占用进程
lsof -i :3003

# 终止进程
kill -9 <PID>

# 或使用其他端口
PORT=3004 npm start
```

#### 9.1.2 数据库连接失败
**问题**：密码错误或服务未启动
**解决**：
```bash
# 检查MySQL服务状态
sudo systemctl status mysql

# 验证数据库连接
mysql -u root -p

# 修改配置文件中的密码
```

#### 9.1.3 跨域问题
**问题**：前端无法访问API
**解决**：
- 检查CORS配置
- 验证域名和端口配置
- 检查防火墙设置

### 9.2 日志分析

#### 9.2.1 应用日志
```bash
# 查看应用日志
tail -f node-backend/logs/app.log

# 查看错误日志
tail -f node-backend/logs/error.log
```

#### 9.2.2 系统日志
```bash
# Nginx访问日志
tail -f /var/log/nginx/access.log

# Nginx错误日志
tail -f /var/log/nginx/error.log
```

---

## 第十章：维护与扩展

### 10.1 日常维护

#### 10.1.1 数据备份
```bash
# 数据库备份
mysqldump -u root -p web_project > backup.sql

# 文件备份
tar -czf backup.tar.gz /var/www/tgcf/
```

#### 10.1.2 性能监控
- 监控服务器资源
- 监控应用性能
- 监控数据库性能

### 10.2 功能扩展

#### 10.2.1 新模块添加
- 在对应目录创建新页面
- 添加API路由和控制器
- 创建数据库表结构

#### 10.2.2 技术升级
- Node.js版本升级
- Express框架更新
- 数据库版本升级

### 10.3 性能优化

#### 10.3.1 前端优化
- CSS/JS文件压缩合并
- 图片格式优化和压缩
- Gzip压缩启用

#### 10.3.2 后端优化
- 查询优化和索引建立
- 连接池配置
- 慢查询监控

---

## 附录

### A. 项目文件结构
```
web_dao/
├── user-web/           # 前端用户页面
│   ├── 天官赐福首页.html
│   ├── 角色介绍.html
│   ├── 留言板.html
│   └── ...
├── admin-web/          # 管理员页面
│   └── admin.html
├── node-backend/       # 后端API服务
│   ├── api/           # 路由文件
│   ├── config/        # 配置文件
│   ├── models/        # 数据模型
│   ├── utils/         # 工具函数
│   ├── uploads/       # 图片上传目录
│   └── app.js         # 主应用文件
├── img/               # 图片资源
├── css/               # 样式文件
├── js/                # JavaScript文件
├── start-server.bat   # 一键启动脚本
├── README.md          # 项目说明文档
└── ADMIN_FEATURES.md  # 管理后台功能说明
```

### B. 更新日志

#### v2.1.0 (最新版本)
- 🆕 添加环境检查脚本 (check-environment.js)
- 🆕 添加健康检查功能 (health-check.js)
- 🆕 添加全功能测试脚本 (test-all-features.js)
- 🆕 完善部署指南文档 (DEPLOYMENT_GUIDE.md)
- 🔧 优化启动脚本 (start-server.bat)错误处理
- 🔧 改进数据库配置显示
- 📚 增强文档和帮助信息

#### v2.0.0
- 🆕 添加专属表单系统
- 🆕 集成图片上传功能
- 🆕 优化管理后台界面
- 🆕 增强用户体验设计

#### v1.0.0
- ✅ 基础功能实现
- ✅ 用户页面和管理后台
- ✅ 数据库集成
- ✅ API接口开发

### C. 技术支持

如遇到技术问题，请参考：
1. 项目README.md文档
2. 部署指南（DEPLOYMENT_GUIDE.md）
3. 故障排除指南
4. 联系开发团队获取支持

---

## 快速开始指南

### 🎯 新用户指南

1. **首次部署**：
   ```bash
   # 1. 检查环境
   node check-environment.js
   
   # 2. 启动项目
   start-server.bat
   
   # 3. 验证部署
   node health-check.js
   ```

2. **开始使用**：
   - 访问用户页面体验功能
   - 登录管理后台进行内容管理
   - 查看API文档了解接口

3. **获取帮助**：
   - 查看相关文档
   - 运行诊断脚本
   - 检查控制台日志

🎉 **祝你使用愉快！** 如有问题，请查看相关文档或运行诊断脚本获取帮助。
