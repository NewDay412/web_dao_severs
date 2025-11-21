# 文件上传指南

## 📤 上传修改过的文件到云服务器

### 方法1：使用Node.js脚本（推荐）

**前置条件：** 安装ssh2库
```bash
npm install ssh2
```

**执行上传：**
```bash
node upload-ssh.js
```

**优点：**
- 自动处理密码认证
- 跨平台支持
- 实时显示上传进度

---

### 方法2：使用PowerShell脚本

**执行上传：**
```powershell
.\upload-to-server.ps1
```

**前置条件：** 
- Windows 10/11
- 已安装OpenSSH或Git Bash

---

### 方法3：使用批处理脚本

**执行上传：**
```bash
upload-to-server.bat
```

---

### 方法4：手动使用SCP命令

**单个文件上传：**
```bash
scp user-web/登录页面.html root@47.83.203.60:/root/web_dao/user-web/
scp user-web/注册.html root@47.83.203.60:/root/web_dao/user-web/
```

**输入密码：** `root`

---

### 方法5：使用WinSCP图形界面

1. 打开WinSCP
2. 新建连接：
   - 主机名：47.83.203.60
   - 用户名：root
   - 密码：root
3. 连接后拖拽文件上传

---

## 📋 需要上传的文件

### 修改的文件（2个）
- `user-web/登录页面.html`
- `user-web/注册.html`

### 新增的文件（8个）
- `fix-all-issues.js`
- `CLOUD_DEPLOYMENT_FIX.md`
- `test-cloud-deployment.js`
- `FINAL_SOLUTION_SUMMARY.md`
- `QUICK_START.md`
- `README_FIXES.md`
- `SOLUTION_REPORT.md`
- `COMPLETION_SUMMARY.txt`

---

## ✅ 上传后的验证

### 1. SSH连接到服务器
```bash
ssh root@47.83.203.60
# 密码: root
```

### 2. 检查文件是否上传成功
```bash
cd /root/web_dao
ls -la user-web/登录页面.html
ls -la user-web/注册.html
ls -la *.md
```

### 3. 启动后端服务
```bash
cd node-backend
npm install
npm start
```

### 4. 测试服务
```bash
curl http://47.83.203.60:3003/health
```

---

## 🔧 故障排除

### 问题1：SSH连接失败
**解决：**
- 确认服务器IP正确：47.83.203.60
- 确认用户名：root
- 确认密码：root
- 检查网络连接

### 问题2：权限拒绝
**解决：**
```bash
# 在服务器上执行
chmod 755 /root/web_dao/user-web/登录页面.html
chmod 755 /root/web_dao/user-web/注册.html
```

### 问题3：文件已存在
**解决：**
```bash
# 覆盖现有文件
scp -o StrictHostKeyChecking=no user-web/登录页面.html root@47.83.203.60:/root/web_dao/user-web/
```

---

## 📝 快速命令

```bash
# 一键上传所有文件（需要配置SSH密钥）
for file in user-web/登录页面.html user-web/注册.html *.md *.js; do
  scp "$file" root@47.83.203.60:/root/web_dao/
done

# 验证上传
ssh root@47.83.203.60 "ls -la /root/web_dao/user-web/ && ls -la /root/web_dao/*.md"
```

---

## 🎯 完整流程

1. **上传文件**
   ```bash
   node upload-ssh.js
   ```

2. **连接服务器**
   ```bash
   ssh root@47.83.203.60
   ```

3. **启动服务**
   ```bash
   cd /root/web_dao/node-backend
   npm start
   ```

4. **测试功能**
   ```bash
   curl http://47.83.203.60:3003/health
   ```

5. **打开浏览器**
   ```
   http://47.83.203.60/user-web/登录页面.html
   ```

---

**祝上传顺利！** 🎉
