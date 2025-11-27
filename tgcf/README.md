# 天官赐福 - Web项目

## 1. 项目简介与设计思路

### 项目简介
这是一个基于Node.js + Express + MySQL的内容管理系统，专门用于展示《天官赐福》相关内容。该系统提供了完整的用户浏览端和管理员后台，支持内容展示、用户互动和内容管理等核心功能。

### 设计思路
1. **分层架构设计**：采用前后端分离的架构模式，前端负责页面展示和用户交互，后端提供API服务和数据处理，实现了职责清晰的分层结构。

2. **用户体验优先**：以古风仙侠主题为设计风格，结合响应式布局，确保在不同设备上都能提供良好的浏览体验。

3. **功能模块化**：将系统划分为用户端和管理端两大模块，每个模块内部又细分为多个功能子模块，便于开发和维护。

4. **数据驱动设计**：基于MySQL数据库构建数据模型，通过API接口实现数据的增删改查，确保数据的一致性和完整性。

5. **扩展性考虑**：预留了良好的扩展接口，支持新功能的快速添加和现有功能的灵活配置。

## 2. 系统功能说明

### 2.1 用户端功能
- **首页展示**：展示《天官赐福》相关的精选内容和导航链接
- **角色介绍**：详细展示作品中的主要角色信息，包括角色图片、性格特点等
- **剧情简介**：提供作品的剧情发展脉络和章节内容
- **留言板**：支持用户发表留言和查看他人留言
- **作品评价**：允许用户对作品进行评分和撰写评价
- **响应式设计**：适配桌面端、平板端和移动端等不同设备

### 2.2 管理端功能
- **专属表单系统**：为每个管理模块定制专业表单，提升管理效率
  - 首页内容管理：配图上传、链接设置、显示顺序控制
  - 角色信息管理：图片上传、重要性分级、性格特点描述
  - 剧情简介管理：章节编号、内容排序、发布状态控制
  - 作品评价管理：五星评分、标签分类、审核状态管理
  - 留言板管理：用户信息、回复功能、状态控制

- **图片上传功能**：支持角色头像等图片的上传和预览
  - 支持JPG、PNG、GIF、WebP格式
  - 文件大小限制5MB
  - 实时预览和验证功能
  - 自动压缩和格式检查
  - 支持拖拽上传

- **用户权限管理**：管理员登录认证和权限控制

## 3. 技术架构介绍

### 3.1 技术栈
- **后端框架**：Node.js + Express.js
- **数据库**：MySQL
- **前端技术**：HTML5 + CSS3 + JavaScript + Bootstrap 5
- **安全认证**：JWT认证
- **跨域支持**：CORS中间件
- **安全防护**：Helmet中间件
- **文件上传**：Multer中间件
- **数据库驱动**：mysql2

### 3.2 系统架构

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

### 3.3 核心模块

1. **API路由层**：处理HTTP请求，实现用户接口和管理员接口
2. **数据模型层**：定义数据库表结构和数据操作方法
3. **业务逻辑层**：实现系统核心业务功能
4. **工具函数层**：提供通用的工具方法和辅助功能

### 3.4 数据库表结构

#### web_project数据库
- `home_content` - 首页内容表
- `character_info` - 角色信息表
- `story_intro` - 剧情简介表
- `work_reviews` - 作品评价表
- `message_board` - 留言板表
- `navigation_menu` - 导航菜单表

#### web_userdao数据库
- `users` - 用户信息表
  - `id` - 用户ID（主键）
  - `username` - 用户名
  - `password` - 密码（加密存储）
  - `email` - 电子邮箱
  - `phone` - 手机号码
  - `avatar` - 用户头像
  - `created_at` - 创建时间
  - `updated_at` - 更新时间
  - `status` - 用户状态

- `user_login_logs` - 用户登录日志表
  - `id` - 日志ID（主键）
  - `user_id` - 用户ID（外键）
  - `login_time` - 登录时间
  - `login_ip` - 登录IP地址
  - `login_device` - 登录设备
  - `login_status` - 登录状态

- `user_collections` - 用户收藏表
  - `id` - 收藏ID（主键）
  - `user_id` - 用户ID（外键）
  - `content_type` - 内容类型
  - `content_id` - 内容ID
  - `created_at` - 创建时间

#### web_admindao数据库
- `admins` - 管理员信息表
  - `id` - 管理员ID（主键）
  - `username` - 用户名
  - `password` - 密码（加密存储）
  - `name` - 真实姓名
  - `role` - 管理员角色
  - `status` - 状态
  - `created_at` - 创建时间
  - `updated_at` - 更新时间

- `admin_operation_logs` - 管理员操作日志表
  - `id` - 日志ID（主键）
  - `admin_id` - 管理员ID（外键）
  - `operation_time` - 操作时间
  - `operation_type` - 操作类型
  - `operation_content` - 操作内容
  - `operation_ip` - 操作IP地址

- `system_configs` - 系统配置表
  - `id` - 配置ID（主键）
  - `config_key` - 配置键
  - `config_value` - 配置值
  - `config_description` - 配置描述
  - `updated_at` - 更新时间

## 4. 本地部署说明

### 4.1 环境要求

- Node.js (版本 14.0 或更高)
- MySQL (版本 5.7 或更高)
- 现代浏览器（Chrome、Firefox、Edge等）

### 4.2 快速部署

#### 🚀 一键部署（推荐）

1. **下载项目**到本地目录
2. **安装MySQL**并启动服务
3. **双击运行** `start-server.bat`
4. **等待自动安装**依赖和启动服务
5. **访问项目**开始使用

#### 📋 详细步骤

**步骤1：环境检查**
```bash
node check-environment.js
```

**步骤2：数据库配置**

数据库会自动创建，如需修改密码：
- 编辑 `node-backend/config/db.js`
- 或设置环境变量：`set DB_PASSWORD=你的密码`

**步骤3：启动项目**

使用启动脚本（推荐）：
```bash
start-server.bat
```

手动启动：
```bash
cd node-backend
npm install
npm start
```

**步骤4：验证部署**
```bash
node health-check.js
```

**步骤5：功能测试**
```bash
node test-all-features.js
```

### 4.3 访问项目

#### 🌐 服务地址
- **后端API服务**：http://localhost:3003
- **健康检查**：http://localhost:3003/health
- **API文档前缀**：
  - 用户接口：`/api/user/`
  - 管理员接口：`/api/admin/`

#### 👤 用户页面
直接打开HTML文件：
- **首页**：`user-web/天官赐福首页.html`
- **角色介绍**：`user-web/角色介绍.html`
- **留言板**：`user-web/留言板.html`
- **聊天功能**：`user-web/聊天.html`
- **作品评价**：`user-web/review-form.html`

#### 👨💼 管理后台
1. 打开：`admin-web/admin.html`
2. 默认账号：
   - 用户名：`admin`
   - 密码：`admin123`
3. 功能包括：内容管理、用户管理、数据统计等

#### 🔐 账号与登录说明

**1. 测试账号获取**
- 用户通过系统注册功能完成账号创建，注册成功后可使用该账号密码登录

**2. 管理员账号信息**
- 默认账号：`admin`
- 初始密码：`admin123`（建议首次登录后立即修改）

**3. 登录流程**
- 所有账号均需通过登录页面提交验证
- 验证通过后按权限自动跳转至对应操作界面
- 用户账号跳转至用户端首页
- 管理员账号跳转至管理后台

**4. 默认测试账号**
- 用户名：`user1` / 密码：`password123`

⚠️ **重要：生产环境请立即修改默认密码！**

### 4.4 故障排除

#### 🔧 常见问题

**数据库连接失败**
```bash
# 检查MySQL服务
net start mysql

# 测试连接
node health-check.js
```

**端口被占用**
```bash
# 查看占用进程
netstat -ano | findstr :3003

# 终止进程
taskkill /F /PID [进程ID]
```

**依赖安装失败**
```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com/

# 重新安装
cd node-backend && npm install
```

**图片上传失败**
```bash
# 创建上传目录
mkdir node-backend\uploads
mkdir uploads
```

#### 🆘 获取帮助

1. **运行诊断脚本**：
   ```bash
   node check-environment.js  # 环境检查
   node health-check.js       # 健康检查
   node test-all-features.js  # 功能测试
   ```

2. **查看详细文档**：
   - `DEPLOYMENT_GUIDE.md` - 部署指南
   - `ADMIN_FEATURES.md` - 管理功能说明

3. **检查日志**：
   - 控制台输出
   - MySQL错误日志
   - 浏览器开发者工具

## 4.5 新部署工具与优化

### 🛠️ 部署工具集

**环境检查脚本 (check-environment.js)**
- ✅ 检查Node.js版本
- ✅ 验证项目结构完整性
- ✅ 确认依赖包安装状态
- ✅ 检查数据库配置

**健康检查脚本 (health-check.js)**
- ✅ 测试服务器连接
- ✅ 验证数据库连接
- ✅ 检查API接口状态

**全功能测试脚本 (test-all-features.js)**
- ✅ 测试用户API接口
- ✅ 验证管理员登录和权限
- ✅ 检查数据库读写功能
- ✅ 测试文件上传接口

**快速部署指南 (DEPLOYMENT_GUIDE.md)**
- ✅ 详细的部署步骤
- ✅ 常见问题解决方案
- ✅ 故障排除指南

### 🚀 优化的启动流程

改进的启动脚本 (start-server.bat)：
- ✅ 自动检查Node.js环境
- ✅ 智能安装依赖包
- ✅ 配置npm镜像源提高下载速度
- ✅ 创建必要的目录
- ✅ 提供详细的错误提示

### 📊 数据库配置优化

数据库连接改进：
- ✅ 支持环境变量配置
- ✅ 显示当前配置状态
- ✅ 自动创建数据库和表
- ✅ 插入默认数据和账号

### 🛡️ 错误处理增强

完善的错误处理：
- ✅ 统一的响应格式
- ✅ 详细的验证机制
- ✅ 友好的错误提示
- ✅ 完整的日志记录

### 📝 使用指南

新环境部署步骤：
```bash
# 1. 环境检查
node check-environment.js

# 2. 启动项目
start-server.bat

# 3. 健康检查
node health-check.js

# 4. 功能测试
node test-all-features.js
```

### 🎯 项目特点

- ✅ 零配置启动：一键脚本自动处理所有依赖
- ✅ 智能检测：自动检查环境和配置问题
- ✅ 完整文档：详细的部署和使用指南
- ✅ 故障诊断：多个诊断工具快速定位问题
- ✅ 新手友好：清晰的错误提示和解决方案

## 5. API接口说明

### 5.1 用户接口 (`/api/user`)

- `GET /api/user/message` - 获取留言列表
- `POST /api/user/message` - 提交留言
- `GET /api/user/character` - 获取角色信息
- `GET /api/user/home-content` - 获取首页内容
- `GET /api/user/story-intro` - 获取剧情简介
- `GET /api/user/reviews` - 获取作品评价列表
- `POST /api/user/reviews` - 提交作品评价

### 5.2 管理员接口 (`/api/admin`)

- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/message` - 获取留言管理列表
- `PUT /api/admin/message/:id` - 更新留言状态
- `DELETE /api/admin/message/:id` - 删除留言
- `GET /api/admin/character` - 获取角色管理列表
- `POST /api/admin/character` - 添加角色
- `PUT /api/admin/character/:id` - 更新角色信息
- `DELETE /api/admin/character/:id` - 删除角色
- `GET /api/admin/home-content` - 获取首页内容管理列表
- `POST /api/admin/home-content` - 添加首页内容
- `PUT /api/admin/home-content/:id` - 更新首页内容
- `DELETE /api/admin/home-content/:id` - 删除首页内容
- `GET /api/admin/story-intro` - 获取剧情简介管理列表
- `POST /api/admin/story-intro` - 添加剧情简介
- `PUT /api/admin/story-intro/:id` - 更新剧情简介
- `DELETE /api/admin/story-intro/:id` - 删除剧情简介
- `GET /api/admin/reviews` - 获取作品评价管理列表
- `PUT /api/admin/reviews/:id` - 更新作品评价状态
- `DELETE /api/admin/reviews/:id` - 删除作品评价
- `POST /api/admin/upload-image` - 上传图片

## 6. 开发说明

### 6.1 项目结构

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

### 6.2 添加新功能的流程

1. 在 `node-backend/models/` 目录下创建新的数据模型
2. 在 `node-backend/api/` 目录下添加对应的API路由
3. 在前端页面中调用新的API接口
4. 如需管理功能，在管理后台创建对应的表单

### 6.3 代码规范

- 使用ES6+语法
- 遵循RESTful API设计规范
- 代码缩进使用2个空格
- 添加必要的注释和文档

## 7. 更新日志

### v2.1.0 (最新版本)
- 🆕 添加环境检查脚本 (check-environment.js)
- 🆕 添加健康检查功能 (health-check.js)
- 🆕 添加全功能测试脚本 (test-all-features.js)
- 🆕 完善部署指南文档 (DEPLOYMENT_GUIDE.md)
- 🔧 优化启动脚本 (start-server.bat)错误处理
- 🔧 改进数据库配置显示
- 📚 增强文档和帮助信息
- 🛠️ 提升新环境部署体验
- 🎯 实现零配置启动流程
- 📊 数据库配置优化
- 🛡️ 错误处理增强
- 💡 新手友好的使用指南

### v2.0.0
- 🆕 添加专属表单系统
- 🆕 集成图片上传功能
- 🆕 优化管理后台界面
- 🆕 增强用户体验设计
- 🆕 添加一键启动脚本
- 🔧 完善表单验证机制
- 📱 优化响应式布局

### v1.0.0
- ✅ 基础功能实现
- ✅ 用户页面和管理后台
- ✅ 数据库集成
- ✅ API接口开发

## 8. 许可证

MIT License

## 9. 快速开始

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
   - 查看 `DEPLOYMENT_GUIDE.md`
   - 运行诊断脚本
   - 检查控制台日志

### 📞 技术支持

- 📖 **文档**：README.md、DEPLOYMENT_GUIDE.md
- 🔧 **工具**：check-environment.js、health-check.js
- 💬 **反馈**：通过留言板功能提交问题

---

🎉 **祝你使用愉快！** 如有问题，请查看相关文档或运行诊断脚本获取帮助。