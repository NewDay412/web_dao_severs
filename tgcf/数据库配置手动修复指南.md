# 数据库配置手动修复指南

## 问题描述
服务器上的 `db.js` 文件中，`admins` 表的 `role` 字段默认值缺少引号，导致SQL语法错误。

错误格式：`role ENUM('admin', 'super_admin') DEFAULT admin`
正确格式：`role ENUM('admin', 'super_admin') DEFAULT 'admin'`

## 修复步骤

### 步骤1：登录服务器

使用SSH客户端（如PuTTY、Git Bash或Windows PowerShell）登录服务器：

```bash
ssh root@47.83.203.60
```

**注意：** 登录时需要输入服务器密码或SSH密钥密码。

### 步骤2：修复db.js文件

#### 方法A：使用sed命令直接修复（推荐）

登录服务器后，执行以下命令直接修复SQL语法错误：

```bash
sed -i "s/role ENUM('admin', 'super_admin') DEFAULT\s\+admin/role ENUM('admin', 'super_admin') DEFAULT 'admin'/g" /var/www/tgcf/node-backend/config/db.js
```

#### 方法B：手动编辑文件

如果sed命令失败，可以手动编辑文件：

```bash
# 使用nano编辑器
nano /var/www/tgcf/node-backend/config/db.js

# 或使用vi编辑器
vi /var/www/tgcf/node-backend/config/db.js
```

找到以下内容：
```sql
role ENUM('admin', 'super_admin') DEFAULT admin,
```

修改为：
```sql
role ENUM('admin', 'super_admin') DEFAULT 'admin',
```

保存文件并退出编辑器。

### 步骤3：验证修复结果

执行以下命令验证修复是否成功：

```bash
sed -n '410,430p' /var/www/tgcf/node-backend/config/db.js | grep "role ENUM"
```

如果输出显示 `role ENUM('admin', 'super_admin') DEFAULT 'admin'`，表示修复成功。

### 步骤4：终止占用3003端口的进程

执行以下命令终止占用3003端口的进程：

```bash
# 查找占用3003端口的进程ID
lsof -ti:3003

# 终止进程（如果有输出）
lsof -ti:3003 | xargs -r kill -9
```

**注意：** 如果`lsof`命令不可用，可以尝试使用`netstat`：

```bash
# 查找进程ID
netstat -tuln | grep 3003

# 终止进程（假设进程ID为12345）
kill -9 12345
```

### 步骤5：重启后端服务

```bash
cd /var/www/tgcf/node-backend
npm start &
```

**注意：** 使用 `&` 符号将服务放在后台运行。

### 步骤6：验证服务是否正常启动

```bash
# 等待几秒钟后检查服务状态
curl -I http://localhost:3003
```

如果返回HTTP响应（如 `HTTP/1.1 200 OK` 或 `HTTP/1.1 404 Not Found`），表示服务已启动。

## 应急方案

如果修复过程中遇到问题，可以使用备份文件恢复：

```bash
# 恢复备份文件（如果之前创建了备份）
cp /var/www/tgcf/node-backend/config/db.js.bak /var/www/tgcf/node-backend/config/db.js
```

## 联系支持

如果问题仍然存在，请联系技术支持并提供以下信息：

1. 执行的命令
2. 遇到的错误信息
3. `/var/www/tgcf/node-backend/config/db.js` 文件内容
4. 后端服务日志

## 预防措施

1. 在修改数据库配置文件前，始终创建备份
2. 使用语法检查工具验证SQL语句
3. 定期检查服务运行状态
4. 考虑使用版本控制系统管理配置文件
