# 密码切换功能使用说明

## 概述

本项目为所有密码输入框添加了"小眼睛"图标，允许用户切换密码的可见性。该功能包含CSS样式和JavaScript逻辑，支持自动初始化和手动配置。

## 功能特点

- ✅ 自动检测页面中的密码输入框
- ✅ 支持手动初始化特定密码框
- ✅ 响应式设计，适配移动端
- ✅ 支持多种主题色彩
- ✅ 无障碍访问支持
- ✅ 支持Bootstrap浮动标签
- ✅ 深色主题和高对比度模式适配

## 已更新的文件

### 1. 登录页面 (`user-web/登录页面.html`)
- 为密码输入框添加了切换功能
- 集成了样式和JavaScript代码

### 2. 注册页面 (`user-web/注册.html`)
- 为密码和确认密码输入框添加了切换功能
- 调整了成功图标位置以避免冲突

### 3. 管理员页面 (`admin-web/admin.html`)
- 为管理员密码输入框添加了切换功能
- 适配了管理后台的主题色彩

### 4. Bootstrap示例页面 (`bootstrap-5.3.2/site/content/docs/5.3/examples/sign-in/index.html`)
- 为Bootstrap登录示例添加了密码切换功能

## 新增的通用文件

### 1. CSS样式文件 (`css/password-toggle.css`)
包含完整的密码切换功能样式，支持：
- 基础样式和布局
- 多种主题色彩适配
- 响应式设计
- 无障碍访问支持
- 深色主题适配

### 2. JavaScript库 (`js/password-toggle.js`)
提供完整的密码切换功能，包含：
- `togglePassword(inputId)` - 切换指定密码框
- `initPasswordToggles()` - 批量初始化所有密码框
- `addPasswordToggle(inputId, options)` - 手动添加切换功能
- `removePasswordToggle(inputId)` - 移除切换功能
- `toggleAllPasswords(show)` - 批量切换所有密码框

## 使用方法

### 方法一：自动初始化（推荐）

1. 引入CSS和JavaScript文件：
```html
<link href="/css/password-toggle.css" rel="stylesheet">
<script src="/js/password-toggle.js"></script>
```

2. 确保引入Bootstrap Icons：
```html
<link rel="stylesheet" href="/icons-1.11.1/font/bootstrap-icons.min.css">
```

3. 页面中的所有密码输入框将自动添加切换功能。

### 方法二：手动初始化

```html
<!-- HTML -->
<div class="password-input-wrapper">
  <input type="password" class="form-control" id="password" placeholder="请输入密码">
  <button type="button" class="password-toggle" onclick="togglePassword('password')">
    <i class="bi bi-eye" id="password-eye"></i>
  </button>
</div>
```

```javascript
// JavaScript
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const eyeIcon = document.getElementById(inputId + '-eye');
  
  if (input.type === 'password') {
    input.type = 'text';
    eyeIcon.className = 'bi bi-eye-slash';
  } else {
    input.type = 'password';
    eyeIcon.className = 'bi bi-eye';
  }
}
```

## 技术实现

所有密码框都已成功添加小眼睛切换功能，用户可以点击眼睛图标来显示或隐藏密码内容。功能包括：

- 点击眼睛图标切换密码可见性
- 图标状态同步更新（眼睛/斜杠眼睛）
- 响应式设计适配各种屏幕
- 与现有样式完美融合
- 支持键盘和触摸操作