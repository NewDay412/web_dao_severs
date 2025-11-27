# 快速部署指南

## 📋 部署前检查清单

### 1. 系统要求
- ✅ Windows 操作系统
- ✅ Node.js 14.0 或更高版本
- ✅ MySQL 5.7 或更高版本
- ✅ 现代浏览器（Chrome、Firefox、Edge等）

### 2. 环境检查
运行环境检查脚本：
```bash
node check-environment.js
```

## 🚀 快速部署步骤

### 步骤 1: 安装 MySQL 数据库

1. 下载并安装 MySQL：https://dev.mysql.com/downloads/mysql/
2. 启动 MySQL 服务
3. 记住你设置的 root 密码

### 步骤 2: 配置数据库连接

编辑 `node-backend/config/db.js` 文件：

```javascript
const config = {
  host: 'localhost',
  user: 'root',
  password: 'Mysql'  // 修改为你的MySQL密码
};
```

或者设置环境变量：
```bash
set DB_PASSWORD=你的密码
```

### 步骤 3: 安装项目依赖

**方法一：使用启动脚本（推荐）**
```bash
双击运行 start-server.bat
```
脚本会自动安装依赖并启动服务器。

**方法二：手动安装**
```bash
cd node-backend
npm install
```

### 步骤 4: 启动服务器

**使用启动脚本：**
```bash
start-server.bat
```

**手动启动：**
```bash
cd node-backend
npm start
```

### 步骤 5: 验证部署

1. **检查服务器状态**
   访问：http://localhost:3003/health
   
   应该看到：
   ```json
   {
     "status": "ok",
     "message": "后端服务运行正常",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "version": "1.0.0"
   }
   ```

2. **运行健康检查**
   ```bash
   node health-check.js
   ```

3. **运行全功能测试**
   ```bash
   node test-all-features.js
   ```

4. **访问用户页面**
   - 首页：打开 `user-web/天官赐福首页.html`
   - 角色介绍：打开 `user-web/角色介绍.html`
   - 留言板：打开 `user-web/留言板.html`
   - 聊天功能：打开 `user-web/聊天.html`
   - 作品评价：打开 `user-web/review-form.html`

5. **访问管理后台**
   - 打开 `admin-web/admin.html`
   - 使用默认账号登录：
     - 用户名：`admin`
     - 密码：`admin123`

## 🔧 常见问题解决

### 问题 1: 端口被占用

**错误信息：**
```
Error: listen EADDRINUSE: address already in use :::3003
```

**解决方案：**
```bash
# 查看占用端口的进程
netstat -ano | findstr :3003

# 终止进程（替换PID为实际进程ID）
taskkill /F /PID [进程ID]
```

或者修改端口号：
编辑 `node-backend/app.js`，将 `PORT = 3003` 改为其他端口。

### 问题 2: 数据库连接失败

**错误信息：**
```
❌ 数据库连接失败: Access denied for user 'root'@'localhost'
```

**解决方案：**
1. 检查 MySQL 服务是否启动
2. 确认数据库密码正确
3. 检查 `node-backend/config/db.js` 配置

### 问题 3: 依赖安装失败

**错误信息：**
```
npm ERR! network timeout
```

**解决方案：**
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com/

# 重新安装
cd node-backend
npm install
```

### 问题 4: bcrypt 安装失败

**错误信息：**
```
Error: Cannot find module 'bcrypt'
```

**解决方案：**
```bash
# 安装 Windows 构建工具
npm install --global windows-build-tools

# 重新安装 bcrypt
cd node-backend
npm install bcrypt --save
```

### 问题 5: 图片上传失败

**错误信息：**
```
Error: ENOENT: no such file or directory
```

**解决方案：**
```bash
# 创建上传目录
mkdir node-backend\uploads
mkdir uploads
```

## 📊 数据库说明

项目使用三个数据库：

1. **web_project** - 主要内容数据
   - home_content（首页内容）
   - character_info（角色信息）
   - story_intro（剧情简介）
   - work_reviews（作品评价）
   - message_board（留言板）
   - navigation_menu（导航菜单）
   - character_quotes（人物语录）
   - basic_info（基本信息）
   - carousel_images（轮播图）

2. **web_userdao** - 用户数据
   - users（用户信息）
   - user_chat_messages（用户聊天消息）

3. **web_admindao** - 管理员数据
   - admins（管理员信息）
   - admin_chat_messages（管理员聊天消息）

**注意：** 数据库和表会在首次启动时自动创建。

## 🔐 默认账号

### 管理员账号
- 用户名：`admin`
- 密码：`admin123`
- 角色：超级管理员

### 测试用户账号
- 用户名：`user1`
- 密码：`password123`
- 性别：男

**重要提示：** 生产环境请立即修改默认密码！

## 🌐 访问地址

### 后端服务
- API 服务：http://localhost:3003
- 健康检查：http://localhost:3003/health

### 前端页面
- 用户首页：`user-web/天官赐福首页.html`
- 管理后台：`admin-web/admin.html`

### API 接口
- 用户接口：http://localhost:3003/api/user/
- 管理员接口：http://localhost:3003/api/admin/

## 📝 部署检查清单

部署完成后，请检查以下项目：

- [ ] MySQL 服务正常运行
- [ ] 数据库连接配置正确
- [ ] 依赖包安装完成
- [ ] 后端服务启动成功
- [ ] 健康检查接口返回正常
- [ ] 运行 `node check-environment.js` 无错误
- [ ] 运行 `node health-check.js` 所有检查通过
- [ ] 运行 `node test-all-features.js` 功能测试通过
- [ ] 用户页面可以访问
- [ ] 管理后台可以登录
- [ ] 图片上传功能正常
- [ ] 数据库表自动创建成功
- [ ] 默认数据插入成功

## 🔄 更新部署

如果需要更新项目：

```bash
# 1. 停止服务器（Ctrl+C）

# 2. 拉取最新代码
git pull

# 3. 更新依赖
cd node-backend
npm install

# 4. 重启服务器
npm start
```

## 📞 获取帮助

如果遇到问题：

1. 查看 `README.md` 详细文档
2. 查看 `DEPLOYMENT_GUIDE.md` 部署指南
3. 运行 `node check-environment.js` 检查环境
4. 运行 `node health-check.js` 检查服务状态
5. 运行 `node test-all-features.js` 测试功能
6. 查看控制台错误信息
7. 检查 MySQL 错误日志

## 🎯 部署工具集

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

## 🚀 优化的部署体验

项目提供了零配置启动体验：

1. **自动环境检测**：智能检查Node.js和数据库环境
2. **一键依赖安装**：自动配置npm镜像并安装所有依赖
3. **数据库自动创建**：首次启动自动创建所需数据库和表
4. **默认数据初始化**：自动插入必要的配置和测试数据
5. **智能错误处理**：提供友好的错误提示和解决方案

新环境部署只需四步：
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

项目现在已经完全准备好在新环境下运行，所有必要的工具和文档都已就位，确保您能够顺利部署和使用。

## 🎯 下一步

部署成功后，你可以：

1. 修改默认管理员密码
2. 添加自定义内容
3. 配置网站信息
4. 上传角色图片
5. 管理用户留言和评价

祝你使用愉快！🎉
