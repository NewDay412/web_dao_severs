# 数据库配置修复指南

## 问题分析

我们在服务器上运行的Node.js后端服务遇到了两个主要问题：

1. **数据库连接错误**：`db.js` 文件中存在硬编码的数据库密码和配置问题
2. **SQL语法错误**：`admins` 表创建语句中 `role` 字段的默认值缺少引号
3. **端口占用**：3003端口被占用导致服务无法启动

## 修复方案

### 方案一：使用自动修复脚本

1. **将脚本上传到服务器**
   ```bash
   # 使用SCP命令上传脚本
   scp d:\wen_project\web_dao\simple-fix.js root@47.83.203.60:/var/www/tgcf/node-backend/
   ```

2. **登录服务器并运行脚本**
   ```bash
   # 登录服务器
   ssh root@47.83.203.60
   
   # 进入项目目录
   cd /var/www/tgcf/node-backend
   
   # 运行修复脚本
   node simple-fix.js
   ```

3. **停止占用端口的进程并重启服务**
   ```bash
   # 停止占用3003端口的进程
   lsof -ti:3003 | xargs -r kill -9
   
   # 重启后端服务
   npm run dev
   ```

### 方案二：手动修复

1. **登录服务器**
   ```bash
   ssh root@47.83.203.60
   ```

2. **编辑数据库配置文件**
   ```bash
   # 使用vi编辑器打开db.js文件
   vi /var/www/tgcf/node-backend/config/db.js
   ```

3. **修复数据库连接配置**
   - 查找所有硬编码的密码：`password: 'Mysql'`
   - 替换为：`password: config.password`
   - 确保所有数据库连接都使用`config`对象中的配置

4. **修复admins表SQL语法错误**
   - 查找`CREATE TABLE IF NOT EXISTS admins`语句
   - 确保`role`字段的定义如下：
     ```sql
     role ENUM('admin', 'super_admin') DEFAULT 'admin'
     ```
   - 避免使用`DEFAULT admin`（缺少引号）或`DEFAULT "admin"`（双引号）

5. **保存并退出编辑器**
   - 按`ESC`键退出编辑模式
   - 输入`:wq`保存并退出

6. **重启服务**
   ```bash
   # 停止占用3003端口的进程
   lsof -ti:3003 | xargs -r kill -9
   
   # 重启后端服务
   npm run dev
   ```

## 验证修复

1. **检查服务状态**
   ```bash
   # 查看服务日志
   tail -f /var/www/tgcf/node-backend/nohup.out
   
   # 或使用curl检查API健康状态
   curl http://localhost:3003/api/health
   ```

2. **检查数据库连接**
   ```bash
   # 登录MySQL
   mysql -u root -p
   
   # 检查数据库
   SHOW DATABASES;
   USE web_admindao;
   SHOW TABLES;
   DESC admins;
   ```

## 常见问题

### 1. 权限问题
如果遇到权限错误，可以尝试：
```bash
chmod +x simple-fix.js
chown -R root:root /var/www/tgcf/node-backend/
```

### 2. 依赖问题
如果脚本运行失败，检查是否安装了Node.js：
```bash
node -v
npm -v
```

### 3. 端口占用
如果3003端口仍被占用，可以尝试：
```bash
# 查看占用端口的进程
lsof -i :3003

# 强制终止进程
kill -9 <PID>
```

## 预防措施

1. **避免硬编码敏感信息**：使用环境变量或配置文件管理数据库密码
2. **使用参数化查询**：防止SQL注入攻击
3. **定期备份数据库**：确保数据安全
4. **使用版本控制**：跟踪代码变更，便于回滚

## 修复文件说明

- `simple-fix.js`：自动修复脚本，修复已知的配置和语法问题
- `fix-db.js`：高级修复脚本，提供更全面的修复功能
- `DB_FIX_GUIDE.md`：本修复指南

## 联系信息

如果遇到无法解决的问题，请联系开发团队获取帮助。
