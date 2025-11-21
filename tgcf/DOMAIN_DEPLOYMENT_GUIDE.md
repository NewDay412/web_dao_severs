# 域名部署指南

## 概述
本文档指导如何将天官赐福Web项目部署到生产环境，并配置域名访问。

## 支持的域名
- `dao.longlong.baby`
- `longlong.baby` 
- `47.83.203.60` (服务器IP)

## 部署步骤

### 1. 环境准备

#### 服务器要求
- 操作系统: Windows Server 或 Linux
- Node.js: v14+
- MySQL: v5.7+
- 可选: Nginx (推荐用于生产环境)

#### 端口要求
- 3003: Node.js应用端口
- 80: HTTP端口
- 443: HTTPS端口 (如果启用SSL)

### 2. 项目部署

#### 方式一: 直接使用Node.js (简单部署)

1. 上传项目文件到服务器
2. 运行生产环境启动脚本:
   ```bash
   # Windows
   start-production.bat
   
   # Linux
   NODE_ENV=production node node-backend/app.production.js
   ```

3. 配置防火墙开放3003端口

#### 方式二: 使用Nginx反向代理 (推荐生产环境)

1. 安装Nginx
2. 复制 `nginx.conf` 到Nginx配置目录
3. 修改配置文件中的证书路径和域名
4. 重启Nginx服务

### 3. 域名解析配置

#### DNS记录设置
```
记录类型: A
主机名: dao (或 @ 对于根域名)
指向IP: 47.83.203.60
TTL: 3600
```

#### 验证域名解析
```bash
# 检查域名解析
nslookup dao.longlong.baby
ping dao.longlong.baby
```

### 4. SSL证书配置 (可选但推荐)

#### 获取SSL证书
1. 使用Let's Encrypt免费证书
2. 购买商业SSL证书
3. 使用云服务商提供的证书

#### 配置SSL
1. 将证书文件上传到服务器安全目录
2. 在Nginx配置中指定证书路径
3. 启用HTTP到HTTPS重定向

### 5. 环境变量配置

修改 `node-backend/.env` 文件:
```env
# 生产环境配置
NODE_ENV=production
PORT=3003
HOST=0.0.0.0

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=web_dao

# JWT密钥 (重要: 生产环境必须修改)
JWT_SECRET=your_very_long_and_secure_jwt_secret_key

# SSL配置 (可选)
SSL_ENABLED=false
SSL_KEY_PATH=/path/to/private.key
SSL_CERT_PATH=/path/to/certificate.crt
```

## 访问地址

### 主要访问地址
- 用户首页: http://dao.longlong.baby/user-web/天官赐福首页.html
- 管理后台: http://dao.longlong.baby/admin-web/admin.html
- API接口: http://dao.longlong.baby/api/
- 健康检查: http://dao.longlong.baby/health

### 备用访问地址
- IP直接访问: http://47.83.203.60:3003
- 其他域名: http://longlong.baby

## 性能优化建议

### 1. 启用Gzip压缩
Nginx配置中已包含Gzip压缩，可显著减少传输大小。

### 2. 静态资源缓存
- 图片、CSS、JS文件缓存1年
- API响应根据业务需求设置缓存

### 3. 数据库优化
- 启用查询缓存
- 优化慢查询
- 定期清理无用数据

### 4. 负载均衡 (高并发场景)
可配置多个Node.js实例，通过Nginx实现负载均衡。

## 安全配置

### 1. 防火墙规则
```bash
# 只开放必要端口
80/tcp, 443/tcp, 3003/tcp (内部)
```

### 2. 定期更新
- Node.js版本
- Nginx版本  
- 系统安全补丁

### 3. 监控和日志
- 启用访问日志
- 监控服务器资源使用
- 设置日志轮转

## 故障排除

### 常见问题

#### 1. 域名无法访问
- 检查DNS解析是否正确
- 验证防火墙设置
- 确认服务器是否运行

#### 2. SSL证书错误
- 检查证书路径和权限
- 验证证书链完整性
- 确认证书未过期

#### 3. 数据库连接失败
- 检查数据库服务状态
- 验证连接参数
- 确认网络连通性

#### 4. 静态资源加载失败
- 检查文件路径和权限
- 验证Nginx配置
- 确认缓存设置

### 日志检查
```bash
# Node.js应用日志
tail -f node-backend/logs/production.log

# Nginx访问日志
tail -f /var/log/nginx/access.log

# Nginx错误日志  
tail -f /var/log/nginx/error.log
```

## 维护任务

### 日常维护
- 备份数据库
- 清理临时文件
- 检查磁盘空间

### 定期维护
- 更新依赖包
- 优化数据库
- 检查安全漏洞

## 联系支持
如遇到部署问题，请检查:
1. 服务器网络连通性
2. 端口开放状态
3. 服务运行状态
4. 日志文件中的错误信息

---
*最后更新: 2024年*