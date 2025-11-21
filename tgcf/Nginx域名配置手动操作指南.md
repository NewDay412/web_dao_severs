# Nginx域名配置手动操作指南

## 当前状态
- ✅ Nginx服务正在运行
- ✅ 域名配置文件已创建
- ❌ 需要管理员权限完成最终配置

## 手动配置步骤

### 第一步：以管理员身份运行PowerShell
1. 在开始菜单搜索"PowerShell"
2. 右键点击"Windows PowerShell"
3. 选择"以管理员身份运行"

### 第二步：执行配置脚本
在管理员PowerShell中执行以下命令：

```powershell
# 切换到项目目录
cd "d:\wen_project\web_dao"

# 运行修复后的配置脚本
.\setup-nginx-domain-fixed.ps1
```

### 第三步：手动检查配置（如果脚本仍有问题）

如果脚本运行仍有问题，请按以下步骤手动配置：

#### 1. 创建vhost目录
```powershell
# 以管理员身份执行
mkdir "D:\nginx-1.29.3\conf\vhost"
```

#### 2. 复制配置文件
```powershell
# 复制域名配置文件
copy "d:\wen_project\web_dao\nginx-dao-longlong-baby.conf" "D:\nginx-1.29.3\conf\vhost\dao-longlong-baby.conf"
```

#### 3. 测试Nginx配置
```powershell
# 切换到Nginx目录
cd "D:\nginx-1.29.3"

# 测试配置
.\nginx.exe -t
```

#### 4. 重新加载Nginx配置
```powershell
# 重新加载配置（如果Nginx正在运行）
.\nginx.exe -s reload

# 或者重启Nginx
.\nginx.exe -s stop
.\nginx.exe
```

#### 5. 测试域名访问
```powershell
# 测试域名访问
Invoke-WebRequest -Uri "http://dao.longlong.baby/health" -UseBasicParsing -TimeoutSec 10
```

## 配置验证

### 验证Nginx配置
```powershell
cd "D:\nginx-1.29.3"
.\nginx.exe -t
```

**预期输出：**
```
nginx: the configuration file D:\nginx-1.29.3/conf/nginx.conf syntax is ok
nginx: configuration file D:\nginx-1.29.3/conf/nginx.conf test is successful
```

### 验证域名配置
```powershell
# 检查域名配置是否生效
.\nginx.exe -T | Select-String "dao.longlong.baby"
```

### 测试域名访问
```powershell
# 测试健康检查接口
Invoke-WebRequest -Uri "http://dao.longlong.baby/health" -UseBasicParsing

# 测试主页访问
Invoke-WebRequest -Uri "http://dao.longlong.baby" -UseBasicParsing
```

## 故障排除

### 如果出现500错误
500错误表示Nginx配置已生效，但后端服务有问题：

1. **检查后端服务是否运行**
   ```powershell
   # 检查3003端口服务
   netstat -an | findstr ":3003"
   ```

2. **启动后端服务**
   ```powershell
   cd "d:\wen_project\web_dao\node-backend"
   npm start
   ```

### 如果出现权限错误
确保所有操作都在管理员PowerShell中执行。

### 如果配置文件不存在
检查以下文件是否存在：
- `d:\wen_project\web_dao\nginx-dao-longlong-baby.conf`
- `D:\nginx-1.29.3\nginx.exe`
- `D:\nginx-1.29.3\conf\nginx.conf`

## 最终验证

配置完成后，请测试以下访问地址：

1. **域名访问**: http://dao.longlong.baby
2. **IP地址访问**: http://47.83.203.60  
3. **本地访问**: http://localhost
4. **健康检查**: http://dao.longlong.baby/health

## 重要提醒

- 所有Nginx配置操作都需要**管理员权限**
- 配置完成后，Nginx会自动将域名请求转发到后端服务（127.0.0.1:3003）
- 500错误表示配置已生效，需要检查后端服务状态
- 确保后端服务在端口3003正常运行

## 完成标志

✅ **配置成功标志**：
- Nginx配置测试通过
- 域名访问返回正常响应（200状态码）或后端错误（500状态码）
- 所有访问地址都能正确路由到后端服务

配置完成后，您的网站就可以通过域名 http://dao.longlong.baby 正常访问了！