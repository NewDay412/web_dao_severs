# SSH认证失败 - 解决方案

## 问题
```
❌ SSH连接失败: All configured authentication methods failed
```

## 解决方案

### 方案1：使用WinSCP（推荐 - 最简单）

1. **下载WinSCP**
   - 访问 https://winscp.net/
   - 下载并安装

2. **新建连接**
   - 主机名：47.83.203.60
   - 用户名：root
   - 密码：root
   - 端口：22

3. **上传文件**
   - 左侧选择本地文件
   - 右侧显示远程目录 `/root/web_dao/`
   - 拖拽文件到右侧上传

---

### 方案2：使用scp命令（需要配置SSH密钥）

```bash
# 上传单个文件
scp -o StrictHostKeyChecking=no user-web/登录页面.html root@47.83.203.60:/root/web_dao/user-web/

# 上传多个文件
scp -o StrictHostKeyChecking=no user-web/*.html root@47.83.203.60:/root/web_dao/user-web/
scp -o StrictHostKeyChecking=no *.md root@47.83.203.60:/root/web_dao/
scp -o StrictHostKeyChecking=no *.js root@47.83.203.60:/root/web_dao/
```

**输入密码：root**

---

### 方案3：使用expect脚本（Linux/Mac）

```bash
# 安装expect
sudo apt-get install expect  # Ubuntu/Debian
brew install expect          # Mac

# 运行上传脚本
expect upload.expect
```

---

### 方案4：使用PowerShell脚本（Windows）

```powershell
.\upload-to-server.ps1
```

---

### 方案5：手动SSH连接后上传

```bash
# 1. SSH连接到服务器
ssh root@47.83.203.60
# 输入密码：root

# 2. 在服务器上创建目录
mkdir -p /root/web_dao/user-web

# 3. 在本地另开一个终端，使用scp上传
scp user-web/登录页面.html root@47.83.203.60:/root/web_dao/user-web/
scp user-web/注册.html root@47.83.203.60:/root/web_dao/user-web/
scp *.md root@47.83.203.60:/root/web_dao/
scp *.js root@47.83.203.60:/root/web_dao/
```

---

## 推荐流程

### 最简单（使用WinSCP）
1. 下载WinSCP
2. 连接到47.83.203.60
3. 拖拽文件上传
4. 完成

### 最快（使用scp命令）
```bash
# 一键上传所有文件
scp -r user-web root@47.83.203.60:/root/web_dao/
scp *.md root@47.83.203.60:/root/web_dao/
scp *.js root@47.83.203.60:/root/web_dao/
```

---

## 验证上传成功

```bash
# SSH连接到服务器
ssh root@47.83.203.60

# 检查文件
cd /root/web_dao
ls -la user-web/登录页面.html
ls -la user-web/注册.html
ls -la *.md
ls -la *.js

# 启动服务
cd node-backend
npm start
```

---

## 常见错误

### 错误1：Permission denied
**原因**：密码错误或权限不足
**解决**：确认密码是 `root`

### 错误2：Connection refused
**原因**：服务器IP错误或SSH服务未启动
**解决**：确认IP是 `47.83.203.60`

### 错误3：File not found
**原因**：本地文件不存在
**解决**：确认文件在当前目录

---

## 快速参考

| 方法 | 难度 | 速度 | 推荐度 |
|------|------|------|--------|
| WinSCP | ⭐ | 中 | ⭐⭐⭐⭐⭐ |
| scp命令 | ⭐⭐ | 快 | ⭐⭐⭐⭐ |
| expect脚本 | ⭐⭐⭐ | 快 | ⭐⭐⭐ |
| PowerShell | ⭐⭐ | 中 | ⭐⭐⭐ |

---

## 立即开始

**推荐：使用WinSCP**
1. 下载：https://winscp.net/
2. 连接：47.83.203.60 (root/root)
3. 上传：拖拽文件到 `/root/web_dao/`

**或使用scp命令**
```bash
scp -r user-web root@47.83.203.60:/root/web_dao/
scp *.md root@47.83.203.60:/root/web_dao/
scp *.js root@47.83.203.60:/root/web_dao/
```

---

**祝上传顺利！** 🚀
