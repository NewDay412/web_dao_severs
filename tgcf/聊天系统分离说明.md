# 聊天系统分离说明

## 概述

将原有的统一聊天系统分离为用户聊天和管理员聊天两个独立的系统，实现数据隔离和权限分离。

## 分离架构

### 数据库分离

1. **用户聊天数据库**: `web_userdao`
   - 表名: `user_chat_messages`
   - 存储用户之间的聊天记录

2. **管理员聊天数据库**: `web_admindao`
   - 表名: `admin_chat_messages`
   - 存储管理员与用户的聊天记录

### 模型分离

1. **UserChatModel** (`models/userChat.model.js`)
   - 处理用户聊天相关的数据操作
   - 连接到 `web_userdao` 数据库

2. **AdminChatModel** (`models/adminChat.model.js`)
   - 处理管理员聊天相关的数据操作
   - 连接到 `web_admindao` 数据库
   - 包含用户列表管理功能

### 路由分离

1. **用户聊天路由** (`api/userChat.routes.js`)
   - 路径前缀: `/api/user-chat`
   - 功能: 发送消息、获取聊天记录、文件上传

2. **管理员聊天路由** (`api/adminChat.routes.js`)
   - 路径前缀: `/api/admin-chat`
   - 功能: 发送消息、获取聊天记录、用户列表、文件上传

## API接口

### 用户聊天接口

- `POST /api/user-chat/send` - 发送消息
- `GET /api/user-chat/messages` - 获取聊天记录
- `GET /api/user-chat/messages/:username` - 获取与特定用户的聊天记录
- `POST /api/user-chat/upload` - 上传文件

### 管理员聊天接口

- `POST /api/admin-chat/send` - 发送消息
- `GET /api/admin-chat/messages` - 获取聊天记录
- `GET /api/admin-chat/users` - 获取用户列表
- `GET /api/admin-chat/messages/:username` - 获取与特定用户的聊天记录
- `POST /api/admin-chat/upload` - 上传文件

## 数据表结构

### user_chat_messages (用户聊天表)

```sql
CREATE TABLE user_chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_name VARCHAR(100) NOT NULL,
    receiver_name VARCHAR(100) NOT NULL DEFAULT 'all',
    content TEXT,
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### admin_chat_messages (管理员聊天表)

```sql
CREATE TABLE admin_chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_name VARCHAR(100) NOT NULL,
    receiver_name VARCHAR(100) NOT NULL DEFAULT 'all',
    content TEXT,
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 迁移步骤

1. **运行迁移脚本**:
   ```bash
   cd node-backend
   node migrate-chat-tables.js
   ```

2. **测试分离功能**:
   ```bash
   node test-separated-chat.js
   ```

3. **更新前端代码**:
   - 用户页面使用 `/api/user-chat` 接口
   - 管理员页面使用 `/api/admin-chat` 接口

## 兼容性

- 保留原有的 `/api/chat` 路由以确保向后兼容
- 新功能建议使用分离后的接口

## 安全性

- 用户聊天和管理员聊天数据完全隔离
- 不同的认证中间件确保权限分离
- 管理员可以查看用户列表，用户无法访问管理员功能

## 优势

1. **数据隔离**: 用户和管理员聊天数据分别存储
2. **权限分离**: 不同角色有不同的访问权限
3. **可扩展性**: 便于后续功能扩展和维护
4. **安全性**: 降低数据泄露风险