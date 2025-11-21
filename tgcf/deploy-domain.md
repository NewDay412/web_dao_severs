# 域名部署配置指南

## 1. 服务器配置

### 1.1 确保服务器监听所有IP
项目已配置为监听 `0.0.0.0:3003`，支持外部访问。

### 1.2 防火墙配置
```bash
# 开放3003端口
sudo ufw allow 3003
# 或者使用iptables
sudo iptables -A INPUT -p tcp --dport 3003 -j ACCEPT
```

## 2. 域名解析配置

### 2.1 DNS记录设置
在域名管理面板添加以下记录：

```
类型    名称              值
A       dao.longlong.baby  47.83.203.60
A       longlong.baby      47.83.203.60
CNAME   www               dao.longlong.baby
```

### 2.2 验证DNS解析
```bash
# 检查域名解析
nslookup dao.longlong.baby
nslookup longlong.baby
```

## 3. Nginx反向代理（推荐）

### 3.1 安装Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 3.2 配置Nginx
```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/web_dao
sudo ln -s /etc/nginx/sites-available/web_dao /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 4. 直接访问配置

### 4.1 修改默认端口（可选）
如果要使用80端口直接访问：

```javascript
// 修改 node-backend/app.js
const PORT = process.env.PORT || 80;
```

### 4.2 使用PM2管理进程
```bash
# 安装PM2
npm install -g pm2

# 启动项目
cd node-backend
pm2 start app.js --name web_dao

# 设置开机自启
pm2 startup
pm2 save
```

## 5. 访问地址

配置完成后，可通过以下地址访问：

- http://dao.longlong.baby:3003
- http://longlong.baby:3003  
- http://47.83.203.60:3003

如果配置了Nginx反向代理：
- http://dao.longlong.baby
- http://longlong.baby

## 6. SSL证书配置（HTTPS）

### 6.1 申请免费SSL证书
```bash
# 使用Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d dao.longlong.baby -d longlong.baby
```

### 6.2 自动续期
```bash
# 添加定时任务
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

## 7. 故障排除

### 7.1 检查服务状态
```bash
# 检查Node.js服务
curl http://localhost:3003/health

# 检查Nginx状态
sudo systemctl status nginx

# 查看日志
sudo tail -f /var/log/nginx/error.log
```

### 7.2 常见问题
1. **域名无法访问**：检查DNS解析和防火墙
2. **502错误**：检查Node.js服务是否运行
3. **跨域问题**：确认CORS配置包含域名

## 8. 性能优化

### 8.1 启用Gzip压缩
在Nginx配置中添加：
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 8.2 静态资源缓存
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```