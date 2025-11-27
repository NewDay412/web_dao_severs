# Cloudflare Web Analytics Token 配置指南

## 概述

本文档指导您如何获取实际的Cloudflare Web Analytics token并替换代码中的占位符。

## 步骤1：获取Cloudflare Token

### 1.1 登录Cloudflare控制台
- 访问 https://dash.cloudflare.com
- 选择您的域名：`dao.longlong.baby`

### 1.2 启用Web Analytics
1. 在左侧菜单中点击 "Analytics" → "Web Analytics"
2. 如果尚未启用，点击 "Enable Web Analytics"
3. 选择免费计划（Free）

### 1.3 获取Token
1. 在Web Analytics设置页面，找到 "Script" 或 "Installation" 部分
2. 复制完整的script标签，例如：
```html
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "YOUR_ACTUAL_TOKEN_HERE"}'></script>
```
3. 从data-cf-beacon属性中提取token值（不包括引号）

## 步骤2：替换Token

### 方法一：使用PowerShell脚本（推荐）

1. 打开PowerShell终端
2. 导航到项目目录：
```powershell
cd d:\wen_project\web_dao
```

3. 运行替换脚本（将YOUR_ACTUAL_TOKEN替换为实际token）：
```powershell
.\replace-cloudflare-token.ps1 -Token "您的实际Cloudflare token"
```

示例：
```powershell
.\replace-cloudflare-token.ps1 -Token "abc123def456ghi789"
```

### 方法二：手动替换

如果需要手动替换，请编辑以下8个HTML文件，将：
```html
data-cf-beacon='{"token": "YOUR_CLOUDFLARE_TOKEN_HERE"}'
```

替换为：
```html
data-cf-beacon='{"token": "您的实际Cloudflare token"}'
```

需要修改的文件：
- `user-web/天官赐福首页.html`
- `user-web/注册.html`
- `user-web/登录页面.html`
- `user-web/角色介绍.html`
- `user-web/留言板.html`
- `user-web/聊天.html`
- `user-web/test_upload.html`
- `user-web/review-form.html`

## 步骤3：验证配置

### 3.1 重启服务器
```powershell
# 停止当前服务器
Ctrl+C

# 重新启动
cd node-backend
npm start
```

### 3.2 测试访问
1. 访问网站：http://localhost:3003
2. 打开浏览器开发者工具（F12）
3. 检查Network标签页，确认Cloudflare脚本正常加载
4. 检查Console标签页，确认没有CSP错误

### 3.3 验证Cloudflare Analytics
1. 等待几分钟让数据收集
2. 返回Cloudflare控制台查看分析数据
3. 确认有访问数据记录

## 故障排除

### 问题1：Token无效
- 症状：Cloudflare脚本加载但显示错误
- 解决：检查token是否正确复制，确保没有多余的空格或引号

### 问题2：CSP错误
- 症状：浏览器控制台显示CSP违规错误
- 解决：确认CSP策略中已包含 `https://static.cloudflareinsights.com`

### 问题3：无数据记录
- 症状：Cloudflare控制台没有数据显示
- 解决：等待更长时间（可能需要15-30分钟），检查网站访问量

## 注意事项

1. **安全性**：Cloudflare token是公开的，不需要保密
2. **延迟**：数据收集和显示可能有15-30分钟的延迟
3. **测试**：建议在生产环境部署前进行充分测试
4. **备份**：修改前建议备份相关文件

## 支持

如遇到问题，请检查：
- Cloudflare账户状态
- 域名解析是否正确
- 防火墙设置
- 浏览器控制台错误信息

---
*最后更新：2024年*