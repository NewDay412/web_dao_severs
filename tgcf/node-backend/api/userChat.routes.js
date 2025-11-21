const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const UserChatModel = require('../models/userChat.model');

// 配置文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('只支持图片和视频文件'));
        }
    }
});

// 用户认证中间件
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: '未提供认证令牌' });
    }
    next();
};

// 发送消息
router.post('/send', authMiddleware, async (req, res) => {
    try {
        const { sender_name, content, image_url, video_url, receiver_name } = req.body;
        
        if (!sender_name) {
            return res.status(400).json({ success: false, error: '发送者名不能为空' });
        }
        
        if (!content && !image_url && !video_url) {
            return res.status(400).json({ success: false, error: '消息内容不能为空' });
        }

        const messageData = {
            sender_name,
            receiver_name: receiver_name || 'all',
            content: content || '',
            image_url,
            video_url
        };

        const messageId = await UserChatModel.sendMessage(messageData);
        
        res.json({ success: true, messageId });
    } catch (error) {
        console.error('发送消息失败:', error);
        res.status(500).json({ success: false, error: '发送消息失败' });
    }
});

// 获取聊天记录
router.get('/messages', authMiddleware, async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const messages = await UserChatModel.getMessages(parseInt(limit));
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('获取聊天记录失败:', error);
        res.status(500).json({ success: false, error: '获取聊天记录失败' });
    }
});

// 获取与特定用户的聊天记录
router.get('/messages/:username', authMiddleware, async (req, res) => {
    try {
        const { username } = req.params;
        const { limit = 50 } = req.query;
        const messages = await UserChatModel.getMessagesWithUser(username, parseInt(limit));
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('获取用户聊天记录失败:', error);
        res.status(500).json({ success: false, error: '获取用户聊天记录失败' });
    }
});

// 文件上传接口
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: '未选择文件' });
        }

        const { sender_name, receiver_name } = req.body;
        
        if (!sender_name) {
            return res.status(400).json({ success: false, error: '发送者名不能为空' });
        }
        
        const fileUrl = `http://localhost:3003/uploads/${req.file.filename}`;
        
        const messageData = {
            sender_name,
            receiver_name: receiver_name || 'all',
            content: '',
            image_url: req.file.mimetype.startsWith('image/') ? fileUrl : null,
            video_url: req.file.mimetype.startsWith('video/') ? fileUrl : null
        };

        const messageId = await UserChatModel.sendMessage(messageData);
        
        res.json({ 
            success: true, 
            data: { 
                messageId, 
                file_url: fileUrl,
                file_type: req.file.mimetype
            } 
        });
    } catch (error) {
        console.error('文件上传失败:', error);
        res.status(500).json({ success: false, error: '文件上传失败' });
    }
});

module.exports = router;