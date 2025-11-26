const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// 尝试导入multer，如果失败则跳过文件上传功能
let multer, upload;
try {
  multer = require('multer');
  const path = require('path');
  const fs = require('fs');
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, '../uploads');
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
  
  upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('只支持图片文件'));
      }
    }
  });
} catch (error) {
  console.log('Multer未安装，文件上传功能不可用');
}
// 导入所有模型
const HomeContentModel = require('../models/homeContent.model');
const CharacterInfoModel = require('../models/characterInfo.model');
const StoryIntroModel = require('../models/storyIntro.model');
const WorkReviewModel = require('../models/workReview.model');
const MessageBoardModel = require('../models/messageBoard.model');
const NavigationMenuModel = require('../models/navigationMenu.model');
const CharacterQuotesModel = require('../models/characterQuotes.model');
const BasicInfoModel = require('../models/basicInfo.model');
const CarouselModel = require('../models/carousel.model');

// 导入工具函数
const { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse, asyncHandler } = require('../utils/response.utils');
const { validateParams } = require('../utils/validation.utils');

// 导入管理员模型
const AdminModel = require('../models/admin.model');

// 密钥配置（生产环境应使用环境变量）
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

/**
 * 权限中间件 - 验证管理员令牌
 * @param {object} req - Express请求对象
 * @param {object} res - Express响应对象
 * @param {function} next - 下一个中间件函数
 */
const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization;
    let token;
    
    if (authHeader) {
      token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    }

    if (!token) {
      return unauthorizedResponse(res, '未提供认证令牌');
    }

    // 验证令牌
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 将管理员信息添加到请求对象
    req.admin = decoded;
    next();
  } catch (error) {
    console.error('JWT验证失败:', error);
    if (error.name === 'TokenExpiredError') {
      return unauthorizedResponse(res, '令牌已过期，请重新登录');
    }
    return unauthorizedResponse(res, '令牌无效');
  }
};

/**
 * 管理员登录接口
 * @route POST /api/admin/login
 * @param {object} req.body - 包含username和password
 * @returns {object} 包含token的响应
 */
router.post('/login', asyncHandler(async (req, res) => {
  // 验证请求参数
  const validation = validateParams(req.body, {
    username: { required: true, type: 'string', minLength: 1, maxLength: 50 },
    password: { required: true, type: 'string', minLength: 1 }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const { username, password } = req.body;
  
  try {
    const admin = await AdminModel.login(username, password);
    
    const token = jwt.sign(
      { username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    return successResponse(res, { token, user: { username: admin.username, role: admin.role } }, '登录成功');
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return errorResponse(res, '该管理员不存在', 404);
    } else if (error.message === 'INVALID_PASSWORD') {
      return errorResponse(res, '用户名或密码错误', 401);
    }
    console.error('管理员登录失败:', error);
    return errorResponse(res, '登录失败', 500);
  }
}));

/**
 * 验证令牌有效性（用于前端检查）
 * @route GET /api/admin/verify
 */
router.get('/verify', authMiddleware, (req, res) => {
  return successResponse(res, { user: req.admin }, '令牌有效');
});

/**
 * 退出登录
 * @route POST /api/admin/logout
 */
router.post('/logout', authMiddleware, (req, res) => {
  // 在实际项目中，可以将令牌加入黑名单
  return successResponse(res, null, '退出成功');
});

/**
 * 首页内容管理接口
 */

/**
 * 添加首页内容
 * @route POST /api/admin/home-content
 * @param {object} req.body - 首页内容数据
 * @returns {object} 添加结果
 */
router.post('/home-content', authMiddleware, asyncHandler(async (req, res) => {
  // 验证请求数据
  const validation = validateParams(req.body, {
    title: { required: true, type: 'string', maxLength: 255 },
    content: { type: 'string' },
    image_url: { type: 'string' },
    link_url: { type: 'string' },
    display_order: { type: 'number' },
    status: { type: 'string' }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const { title, content, image_url, link_url, display_order, status } = req.body;
  
  const contentId = await HomeContentModel.addContent({
    title, content, image_url, link_url, display_order, status
  });
  
  return successResponse(res, { contentId }, '添加成功');
}));

/**
 * 获取所有首页内容
 * @route GET /api/admin/home-content
 * @returns {object} 首页内容列表
 */
router.get('/home-content', authMiddleware, asyncHandler(async (req, res) => {
  const { onlyPublished } = req.query;
  const content = await HomeContentModel.getAllContent(onlyPublished === 'true');
  return successResponse(res, content, '获取首页内容成功');
}));

/**
 * 更新首页内容
 * @route PUT /api/admin/home-content/:id
 * @param {number} req.params.id - 内容ID
 * @returns {object} 更新结果
 */
router.put('/home-content/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // 验证请求数据
  const validation = validateParams(req.body, {
    title: { type: 'string', maxLength: 255 },
    content: { type: 'string' },
    image_url: { type: 'string' },
    link_url: { type: 'string' },
    display_order: { type: 'number' },
    status: { type: 'string' }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  // 检查内容是否存在
  const existingContent = await HomeContentModel.getContentById(id);
  if (!existingContent) {
    return errorResponse(res, '内容不存在', 404);
  }
  
  await HomeContentModel.updateContent(id, req.body);
  return successResponse(res, null, '更新成功');
}));

/**
 * 删除首页内容
 * @route DELETE /api/admin/home-content/:id
 * @param {number} req.params.id - 内容ID
 * @returns {object} 删除结果
 */
router.delete('/home-content/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // 检查内容是否存在
  const existingContent = await HomeContentModel.getContentById(id);
  if (!existingContent) {
    return errorResponse(res, '内容不存在', 404);
  }
  
  await HomeContentModel.deleteContent(id);
  return successResponse(res, null, '删除成功');
}));

/**
 * 获取单个首页内容
 * @route GET /api/admin/home-content/:id
 * @param {number} req.params.id - 内容ID
 * @returns {object} 首页内容详情
 */
router.get('/home-content/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const content = await HomeContentModel.getContentById(id);
  
  if (!content) {
    return errorResponse(res, '内容不存在', 404);
  }
  
  return successResponse(res, content, '获取首页内容详情成功');
}));

/**
 * 角色信息管理接口
 */

/**
 * 添加角色信息
 * @route POST /api/admin/character
 * @param {object} req.body - 角色数据
 * @returns {object} 添加结果
 */
router.post('/character', authMiddleware, asyncHandler(async (req, res) => {
  try {
    // 验证请求数据
    const validation = validateParams(req.body, {
      name: { required: true, type: 'string', maxLength: 100 },
      description: { required: true, type: 'string' },
      image_url: { type: 'string' },
      personality: { type: 'string' },
      role_importance: { type: 'string' },
      display_order: { type: 'number' },
      status: { type: 'string' }
    });
    
    if (!validation.valid) {
      return validationErrorResponse(res, validation.errors);
    }
    
    const { name, description, image_url, personality, role_importance, display_order, status } = req.body;
    
    const characterId = await CharacterInfoModel.addCharacter({
      name, description, image_url, personality, role_importance, display_order, status
    });
    
    return successResponse(res, { characterId }, '添加成功');
  } catch (error) {
    console.error('Admin添加角色失败:', error);
    return errorResponse(res, '添加角色失败', 500);
  }
}));

/**
 * 获取所有角色信息
 * @route GET /api/admin/character
 * @returns {object} 角色列表
 */
router.get('/character', authMiddleware, asyncHandler(async (req, res) => {
  try {
    const { onlyPublished, roleType } = req.query;
    const characters = await CharacterInfoModel.getAllCharacters(
      onlyPublished === 'true', 
      roleType
    );
    return successResponse(res, characters, '获取角色列表成功');
  } catch (error) {
    console.error('Admin获取角色列表失败:', error);
    return errorResponse(res, '获取角色列表失败', 500);
  }
}));

/**
 * 更新角色信息
 * @route PUT /api/admin/character/:id
 * @param {number} req.params.id - 角色ID
 * @returns {object} 更新结果
 */
router.put('/character/:id', authMiddleware, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // 验证请求数据
    const validation = validateParams(req.body, {
      name: { type: 'string', maxLength: 100 },
      description: { type: 'string' },
      image_url: { type: 'string' },
      personality: { type: 'string' },
      role_importance: { type: 'string' },
      display_order: { type: 'number' },
      status: { type: 'string' }
    });
    
    if (!validation.valid) {
      return validationErrorResponse(res, validation.errors);
    }
    
    // 检查角色是否存在
    const existingCharacter = await CharacterInfoModel.getCharacterById(id);
    if (!existingCharacter) {
      return errorResponse(res, '角色不存在', 404);
    }
    
    await CharacterInfoModel.updateCharacter(id, req.body);
    return successResponse(res, null, '更新成功');
  } catch (error) {
    console.error('Admin更新角色失败:', error);
    return errorResponse(res, '更新角色失败', 500);
  }
}));

/**
 * 获取单个角色信息
 * @route GET /api/admin/character/:id
 * @param {number} req.params.id - 角色ID
 * @returns {object} 角色详情
 */
router.get('/character/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const character = await CharacterInfoModel.getCharacterById(id);
  
  if (!character) {
    return errorResponse(res, '角色不存在', 404);
  }
  
  return successResponse(res, character, '获取角色详情成功');
}));

/**
 * 删除角色信息
 * @route DELETE /api/admin/character/:id
 * @param {number} req.params.id - 角色ID
 * @returns {object} 删除结果
 */
router.delete('/character/:id', authMiddleware, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查角色是否存在
    const existingCharacter = await CharacterInfoModel.getCharacterById(id);
    if (!existingCharacter) {
      return errorResponse(res, '角色不存在', 404);
    }
    
    await CharacterInfoModel.deleteCharacter(id);
    return successResponse(res, null, '删除成功');
  } catch (error) {
    console.error('Admin删除角色失败:', error);
    return errorResponse(res, '删除角色失败', 500);
  }
}));

/**
 * 剧情简介管理接口
 */

/**
 * 添加剧情简介
 * @route POST /api/admin/story-intro
 * @param {object} req.body - 剧情数据
 * @returns {object} 添加结果
 */
router.post('/story-intro', authMiddleware, asyncHandler(async (req, res) => {
  // 验证请求数据
  const validation = validateParams(req.body, {
    title: { required: true, type: 'string', maxLength: 255 },
    content: { required: true, type: 'string' },
    chapter_number: { type: 'number' },
    display_order: { type: 'number' },
    status: { type: 'string' }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const { title, content, chapter_number, display_order, status } = req.body;
  
  const storyId = await StoryIntroModel.addStoryIntro({
    title, content, chapter_number, display_order, status
  });
  
  return successResponse(res, { storyId }, '添加成功');
}));

/**
 * 获取所有剧情简介
 * @route GET /api/admin/story-intro
 * @returns {object} 剧情列表
 */
router.get('/story-intro', authMiddleware, asyncHandler(async (req, res) => {
  const { onlyPublished } = req.query;
  const stories = await StoryIntroModel.getAllStoryIntro(onlyPublished === 'true');
  return successResponse(res, stories, '获取剧情简介成功');
}));

/**
 * 更新剧情简介
 * @route PUT /api/admin/story-intro/:id
 * @param {number} req.params.id - 剧情ID
 * @returns {object} 更新结果
 */
router.put('/story-intro/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // 验证请求数据
  const validation = validateParams(req.body, {
    title: { type: 'string', maxLength: 255 },
    content: { type: 'string' },
    chapter_number: { type: 'number' },
    display_order: { type: 'number' },
    status: { type: 'string' }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  // 检查剧情是否存在
  const existingStory = await StoryIntroModel.getStoryIntroById(id);
  if (!existingStory) {
    return errorResponse(res, '剧情不存在', 404);
  }
  
  await StoryIntroModel.updateStoryIntro(id, req.body);
  return successResponse(res, null, '更新成功');
}));

/**
 * 获取单个剧情简介
 * @route GET /api/admin/story-intro/:id
 * @param {number} req.params.id - 剧情ID
 * @returns {object} 剧情详情
 */
router.get('/story-intro/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const story = await StoryIntroModel.getStoryIntroById(id);
  
  if (!story) {
    return errorResponse(res, '剧情不存在', 404);
  }
  
  return successResponse(res, story, '获取剧情详情成功');
}));

/**
 * 删除剧情简介
 * @route DELETE /api/admin/story-intro/:id
 * @param {number} req.params.id - 剧情ID
 * @returns {object} 删除结果
 */
router.delete('/story-intro/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // 检查剧情是否存在
  const existingStory = await StoryIntroModel.getStoryIntroById(id);
  if (!existingStory) {
    return errorResponse(res, '剧情不存在', 404);
  }
  
  await StoryIntroModel.deleteStoryIntro(id);
  return successResponse(res, null, '删除成功');
}));

/**
 * 作品评价管理接口
 */

/**
 * 添加作品评价
 * @route POST /api/admin/review
 * @param {object} req.body - 评价数据
 * @returns {object} 添加结果
 */
router.post('/review', authMiddleware, asyncHandler(async (req, res) => {
  const validation = validateParams(req.body, {
    username: { required: true, type: 'string', maxLength: 100 },
    rating: { required: true, type: 'number', min: 1, max: 5 },
    content: { required: true, type: 'string' },
    tags: { type: 'string' },
    status: { type: 'string' }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const reviewId = await WorkReviewModel.addReview(req.body);
  return successResponse(res, { reviewId }, '添加评价成功');
}));

/**
 * 获取所有作品评价
 * @route GET /api/admin/review
 * @returns {object} 评价列表和统计信息
 */
router.get('/review', authMiddleware, asyncHandler(async (req, res) => {
  const { status, page = 1, pageSize = 10 } = req.query;
  const reviews = await WorkReviewModel.getAllReviews(status, parseInt(page), parseInt(pageSize));
  return successResponse(res, reviews, '获取作品评价成功');
}));

/**
 * 更新评价状态
 * @route PUT /api/admin/review/:id/status
 * @param {number} req.params.id - 评价ID
 * @param {string} req.body.status - 状态(pending/approved/rejected)
 * @returns {object} 更新结果
 */
router.put('/review/:id/status', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // 验证请求数据
  const validation = validateParams(req.body, {
    status: { required: true, type: 'string', enum: ['pending', 'approved', 'rejected'] }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const { status } = req.body;
  
  const review = await WorkReviewModel.getReviewById(id);
  if (!review) {
    return errorResponse(res, '评价不存在', 404);
  }
  
  await WorkReviewModel.updateReviewStatus(id, status);
  return successResponse(res, null, '状态更新成功');
}));

/**
 * 获取单个作品评价
 * @route GET /api/admin/review/:id
 * @param {number} req.params.id - 评价ID
 * @returns {object} 评价详情
 */
router.get('/review/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await WorkReviewModel.getReviewById(id);
  
  if (!review) {
    return errorResponse(res, '评价不存在', 404);
  }
  
  return successResponse(res, review, '获取评价详情成功');
}));

/**
 * 删除作品评价
 * @route DELETE /api/admin/review/:id
 * @param {number} req.params.id - 评价ID
 * @returns {object} 删除结果
 */
router.delete('/review/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const review = await WorkReviewModel.getReviewById(id);
  if (!review) {
    return errorResponse(res, '评价不存在', 404);
  }
  
  await WorkReviewModel.deleteReview(id);
  return successResponse(res, null, '删除成功');
}));

// 作品评价接口别名 - 兼容前端调用
router.post('/work-review', authMiddleware, asyncHandler(async (req, res) => {
  const validation = validateParams(req.body, {
    username: { required: true, type: 'string', maxLength: 100 },
    rating: { required: true, type: 'number', min: 1, max: 5 },
    content: { required: true, type: 'string' },
    tags: { type: 'string' },
    status: { type: 'string' }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const reviewId = await WorkReviewModel.addReview(req.body);
  return successResponse(res, { reviewId }, '添加评价成功');
}));

router.get('/work-review', authMiddleware, asyncHandler(async (req, res) => {
  const { status, page = 1, pageSize = 10 } = req.query;
  const reviews = await WorkReviewModel.getAllReviews(status, parseInt(page), parseInt(pageSize));
  return successResponse(res, reviews, '获取作品评价成功');
}));

router.put('/work-review/:id/status', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const validation = validateParams(req.body, {
    status: { required: true, type: 'string', enum: ['pending', 'approved', 'rejected'] }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const { status } = req.body;
  
  const review = await WorkReviewModel.getReviewById(id);
  if (!review) {
    return errorResponse(res, '评价不存在', 404);
  }
  
  await WorkReviewModel.updateReviewStatus(id, status);
  return successResponse(res, null, '状态更新成功');
}));

router.get('/work-review/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await WorkReviewModel.getReviewById(id);
  
  if (!review) {
    return errorResponse(res, '评价不存在', 404);
  }
  
  return successResponse(res, review, '获取评价详情成功');
}));

router.delete('/work-review/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const review = await WorkReviewModel.getReviewById(id);
  if (!review) {
    return errorResponse(res, '评价不存在', 404);
  }
  
  await WorkReviewModel.deleteReview(id);
  return successResponse(res, null, '删除成功');
}));

/**
 * 留言板管理接口
 */

/**
 * 获取所有留言
 * @route GET /api/admin/message
 * @returns {object} 留言列表
 */
router.get('/message', authMiddleware, asyncHandler(async (req, res) => {
  const messages = await MessageBoardModel.getAllMessages(false);
  return successResponse(res, messages, '获取留言成功');
}));

/**
 * 添加留言
 * @route POST /api/admin/message
 * @param {object} req.body - 留言数据
 * @returns {object} 添加结果
 */
router.post('/message', authMiddleware, asyncHandler(async (req, res) => {
  const validation = validateParams(req.body, {
    username: { required: true, type: 'string', maxLength: 100 },
    content: { required: true, type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    reply: { type: 'string' },
    status: { type: 'string' }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const messageId = await MessageBoardModel.addMessage(req.body);
  return successResponse(res, { messageId }, '添加留言成功');
}));

/**
 * 添加留言回复
 * @route POST /api/admin/message/:id/reply
 * @param {number} req.params.id - 留言ID
 * @param {string} req.body.reply_content - 回复内容
 * @returns {object} 回复结果
 */
router.post('/message/:id/reply', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // 验证请求数据
  const validation = validateParams(req.body, {
    reply_content: { required: true, type: 'string', minLength: 1 }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const { reply_content } = req.body;
  
  const message = await MessageBoardModel.getMessageById(id);
  if (!message) {
    return errorResponse(res, '留言不存在', 404);
  }
  
  await MessageBoardModel.addReply(id, reply_content);
  return successResponse(res, null, '回复成功');
}));

/**
 * 更新留言（包含回复和状态）
 * @route PUT /api/admin/message/:id
 * @param {number} req.params.id - 留言ID
 * @returns {object} 更新结果
 */
router.put('/message/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reply, status } = req.body;
  
  const message = await MessageBoardModel.getMessageById(id);
  if (!message) {
    return errorResponse(res, '留言不存在', 404);
  }
  
  const updateData = {};
  if (reply) updateData.reply = reply;
  if (status) updateData.status = status;
  
  await MessageBoardModel.updateMessage(id, updateData);
  return successResponse(res, null, '更新成功');
}));

/**
 * 删除留言
 * @route DELETE /api/admin/message/:id
 * @param {number} req.params.id - 留言ID
 * @returns {object} 删除结果
 */
router.delete('/message/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const message = await MessageBoardModel.getMessageById(id);
  if (!message) {
    return errorResponse(res, '留言不存在', 404);
  }
  
  await MessageBoardModel.deleteMessage(id);
  return successResponse(res, null, '删除成功');
}));

/**
 * 导航菜单管理接口
 */

/**
 * 获取所有导航菜单
 * @route GET /api/admin/menu
 * @returns {object} 菜单列表
 */
router.get('/menu', authMiddleware, asyncHandler(async (req, res) => {
  const { asTree = false, onlyActive = false } = req.query;
  let menus;
  
  if (asTree === 'true') {
    menus = await NavigationMenuModel.getMenuTree(onlyActive === 'true');
  } else {
    menus = await NavigationMenuModel.getAllMenus(onlyActive === 'true');
  }
  
  return successResponse(res, menus, '获取导航菜单成功');
}));

/**
 * 添加导航菜单
 * @route POST /api/admin/menu
 * @param {object} req.body - 菜单数据
 * @returns {object} 添加结果
 */
router.post('/menu', authMiddleware, asyncHandler(async (req, res) => {
  // 验证请求数据
  const validation = validateParams(req.body, {
    name: { required: true, type: 'string', maxLength: 100 },
    url: { required: true, type: 'string', maxLength: 255 },
    parent_id: { type: ['string', 'number', 'null'] },
    display_order: { type: 'number' },
    is_active: { type: 'boolean' },
    target: { type: 'string' }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const { name, url, parent_id, display_order, is_active, target } = req.body;
  
  const menuId = await NavigationMenuModel.addMenu({
    name, url, parent_id: parent_id || null, display_order, is_active, target
  });
  
  return successResponse(res, { menuId }, '添加成功');
}));

/**
 * 更新导航菜单
 * @route PUT /api/admin/menu/:id
 * @param {number} req.params.id - 菜单ID
 * @returns {object} 更新结果
 */
router.put('/menu/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // 验证请求数据
  const validation = validateParams(req.body, {
    name: { type: 'string', maxLength: 100 },
    url: { type: 'string', maxLength: 255 },
    parent_id: { type: ['string', 'number', 'null'] },
    display_order: { type: 'number' },
    is_active: { type: 'boolean' },
    target: { type: 'string' }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  // 检查菜单是否存在
  const menu = await NavigationMenuModel.getMenuById(id);
  if (!menu) {
    return errorResponse(res, '菜单不存在', 404);
  }
  
  await NavigationMenuModel.updateMenu(id, req.body);
  
  return successResponse(res, null, '更新成功');
}));

/**
 * 删除导航菜单
 * @route DELETE /api/admin/menu/:id
 * @param {number} req.params.id - 菜单ID
 * @returns {object} 删除结果
 */
router.delete('/menu/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const menu = await NavigationMenuModel.getMenuById(id);
  if (!menu) {
    return errorResponse(res, '菜单不存在', 404);
  }
  
  // 检查是否有子菜单
  const hasChildren = await NavigationMenuModel.hasChildMenus(id);
  if (hasChildren) {
    return errorResponse(res, '无法删除包含子菜单的菜单项，请先删除子菜单', 400);
  }
  
  await NavigationMenuModel.deleteMenu(id);
  return successResponse(res, null, '删除成功');
}));

/**
 * 管理员管理接口
 */

/**
 * 获取所有管理员
 * @route GET /api/admin/admin
 * @returns {object} 管理员列表
 */
router.get('/admin', authMiddleware, asyncHandler(async (req, res) => {
  const admins = await AdminModel.getAllAdmins();
  return successResponse(res, admins, '获取管理员列表成功');
}));

/**
 * 添加管理员
 * @route POST /api/admin/admin
 * @param {object} req.body - 管理员数据
 * @returns {object} 添加结果
 */
router.post('/admin', authMiddleware, asyncHandler(async (req, res) => {
  const validation = validateParams(req.body, {
    username: { required: true, type: 'string', minLength: 3, maxLength: 50 },
    password: { required: true, type: 'string', minLength: 6 },
    role: { required: true, type: 'string', enum: ['admin', 'super_admin'] }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  try {
    const adminId = await AdminModel.addAdmin(req.body);
    return successResponse(res, { adminId }, '添加管理员成功');
  } catch (error) {
    if (error.message === '用户名已存在') {
      return errorResponse(res, error.message, 400);
    }
    return errorResponse(res, '添加管理员失败', 500);
  }
}));

/**
 * 获取单个管理员信息
 * @route GET /api/admin/admin/:id
 * @param {number} req.params.id - 管理员ID
 * @returns {object} 管理员信息
 */
router.get('/admin/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const admin = await AdminModel.getAdminById(id);
  if (!admin) {
    return errorResponse(res, '管理员不存在', 404);
  }
  
  // 不返回密码信息
  const { password, ...adminInfo } = admin;
  return successResponse(res, adminInfo, '获取管理员信息成功');
}));

/**
 * 更新管理员信息
 * @route PUT /api/admin/admin/:id
 * @param {number} req.params.id - 管理员ID
 * @returns {object} 更新结果
 */
router.put('/admin/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, role, password } = req.body;
  
  const admin = await AdminModel.getAdminById(id);
  if (!admin) {
    return errorResponse(res, '管理员不存在', 404);
  }
  
  try {
    const updateData = {};
    if (username) updateData.username = username;
    if (role) updateData.role = role;
    if (password) updateData.password = password;
    
    await AdminModel.updateAdmin(id, updateData);
    return successResponse(res, null, '更新成功');
  } catch (error) {
    if (error.message === '用户名已存在') {
      return errorResponse(res, error.message, 400);
    }
    return errorResponse(res, '更新管理员失败', 500);
  }
}));

/**
 * 删除管理员
 * @route DELETE /api/admin/admin/:id
 * @param {number} req.params.id - 管理员ID
 * @returns {object} 删除结果
 */
router.delete('/admin/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const admin = await AdminModel.getAdminById(id);
  if (!admin) {
    return errorResponse(res, '管理员不存在', 404);
  }
  
  await AdminModel.deleteAdmin(id);
  return successResponse(res, null, '删除成功');
}));

/**
 * 修改管理员密码
 * @route POST /api/admin/update-password
 * @param {string} req.body.currentPassword - 当前密码
 * @param {string} req.body.newPassword - 新密码
 * @returns {object} 修改结果
 */
router.post('/update-password', authMiddleware, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // 验证请求参数
  const validation = validateParams(req.body, {
    currentPassword: { required: true, type: 'string', minLength: 1 },
    newPassword: { required: true, type: 'string', minLength: 6 }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  try {
    // 获取当前管理员信息
    const { username } = req.admin;
    
    // 验证当前密码
    const isValidPassword = await AdminModel.verifyPassword(username, currentPassword);
    if (!isValidPassword) {
      return errorResponse(res, '当前密码错误', 400);
    }
    
    // 获取管理员ID
    const adminInfo = await AdminModel.getAdminByUsername(username);
    if (!adminInfo) {
      return errorResponse(res, '管理员不存在', 404);
    }
    
    // 更新密码
    await AdminModel.updateAdmin(adminInfo.id, { password: newPassword });
    
    return successResponse(res, null, '密码修改成功');
  } catch (error) {
    console.error('修改密码失败:', error);
    return errorResponse(res, '密码修改失败', 500);
  }
}));

/**
 * 批量删除接口
 * @route DELETE /api/admin/batch-delete
 * @param {string} req.body.type - 删除类型 (home-content|character|story-intro|review|message)
 * @param {array} req.body.ids - 要删除的ID数组
 * @returns {object} 批量删除结果
 */
router.delete('/batch-delete', authMiddleware, asyncHandler(async (req, res) => {
  const validation = validateParams(req.body, {
    type: { required: true, type: 'string', enum: ['home-content', 'character', 'story-intro', 'review', 'message'] },
    ids: { required: true, type: 'array', minLength: 1 }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const { type, ids } = req.body;
  let successCount = 0;
  let failCount = 0;
  const errors = [];
  
  for (const id of ids) {
    try {
      let exists = false;
      
      // 检查记录是否存在并删除
      switch (type) {
        case 'home-content':
          exists = await HomeContentModel.getContentById(id);
          if (exists) {
            await HomeContentModel.deleteContent(id);
            successCount++;
          } else {
            failCount++;
            errors.push(`ID ${id}: 内容不存在`);
          }
          break;
          
        case 'character':
          exists = await CharacterInfoModel.getCharacterById(id);
          if (exists) {
            await CharacterInfoModel.deleteCharacter(id);
            successCount++;
          } else {
            failCount++;
            errors.push(`ID ${id}: 角色不存在`);
          }
          break;
          
        case 'story-intro':
          exists = await StoryIntroModel.getStoryIntroById(id);
          if (exists) {
            await StoryIntroModel.deleteStoryIntro(id);
            successCount++;
          } else {
            failCount++;
            errors.push(`ID ${id}: 剧情不存在`);
          }
          break;
          
        case 'review':
          exists = await WorkReviewModel.getReviewById(id);
          if (exists) {
            await WorkReviewModel.deleteReview(id);
            successCount++;
          } else {
            failCount++;
            errors.push(`ID ${id}: 评价不存在`);
          }
          break;
          
        case 'message':
          exists = await MessageBoardModel.getMessageById(id);
          if (exists) {
            await MessageBoardModel.deleteMessage(id);
            successCount++;
          } else {
            failCount++;
            errors.push(`ID ${id}: 留言不存在`);
          }
          break;
      }
    } catch (error) {
      failCount++;
      errors.push(`ID ${id}: ${error.message}`);
    }
  }
  
  const result = {
    total: ids.length,
    success: successCount,
    failed: failCount,
    errors: errors
  };
  
  if (failCount === 0) {
    return successResponse(res, result, `成功删除 ${successCount} 条记录`);
  } else {
    return successResponse(res, result, `批量删除完成：成功 ${successCount} 条，失败 ${failCount} 条`);
  }
}));

/**
 * 人物语录管理接口
 */

/**
 * 获取所有人物语录
 * @route GET /api/admin/quotes
 * @returns {object} 语录列表
 */
router.get('/quotes', authMiddleware, asyncHandler(async (req, res) => {
  const { onlyPublished } = req.query;
  const quotes = await CharacterQuotesModel.getAllQuotes(onlyPublished === 'true');
  return successResponse(res, quotes, '获取人物语录成功');
}));

/**
 * 添加人物语录
 * @route POST /api/admin/quotes
 * @param {object} req.body - 语录数据
 * @returns {object} 添加结果
 */
router.post('/quotes', authMiddleware, asyncHandler(async (req, res) => {
  const validation = validateParams(req.body, {
    character_name: { required: true, type: 'string', maxLength: 100 },
    content: { required: true, type: 'string' },
    image_url: { type: 'string' },
    display_order: { type: 'number' },
    status: { type: 'string' }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const quoteId = await CharacterQuotesModel.addQuote(req.body);
  return successResponse(res, { quoteId }, '添加成功');
}));

/**
 * 获取单个人物语录
 * @route GET /api/admin/quotes/:id
 * @param {number} req.params.id - 语录ID
 * @returns {object} 语录详情
 */
router.get('/quotes/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quote = await CharacterQuotesModel.getQuoteById(id);
  
  if (!quote) {
    return errorResponse(res, '语录不存在', 404);
  }
  
  return successResponse(res, quote, '获取语录详情成功');
}));

/**
 * 更新人物语录
 * @route PUT /api/admin/quotes/:id
 * @param {number} req.params.id - 语录ID
 * @returns {object} 更新结果
 */
router.put('/quotes/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const validation = validateParams(req.body, {
    character_name: { type: 'string', maxLength: 100 },
    content: { type: 'string' },
    image_url: { type: 'string' },
    display_order: { type: 'number' },
    status: { type: 'string' }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const existingQuote = await CharacterQuotesModel.getQuoteById(id);
  if (!existingQuote) {
    return errorResponse(res, '语录不存在', 404);
  }
  
  await CharacterQuotesModel.updateQuote(id, req.body);
  return successResponse(res, null, '更新成功');
}));

/**
 * 删除人物语录
 * @route DELETE /api/admin/quotes/:id
 * @param {number} req.params.id - 语录ID
 * @returns {object} 删除结果
 */
router.delete('/quotes/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const existingQuote = await CharacterQuotesModel.getQuoteById(id);
  if (!existingQuote) {
    return errorResponse(res, '语录不存在', 404);
  }
  
  await CharacterQuotesModel.deleteQuote(id);
  return successResponse(res, null, '删除成功');
}));

/**
 * 网站设置管理接口
 */

/**
 * 获取网站设置
 * @route GET /api/admin/site-settings
 * @returns {object} 网站设置信息
 */
router.get('/site-settings', authMiddleware, asyncHandler(async (req, res) => {
  // 这里可以从数据库获取设置，目前返回默认设置
  const defaultSettings = {
    title: '天官赐福',
    subtitle: '一部仙侠奇缘小说',
    description: '讲述了谢怜和花城的仙侠爱情故事，充满了奇幻色彩和深情厚意。',
    keywords: '天官赐福,谢怜,花城,仙侠小说,耳雅',
    contactEmail: 'admin@tianguancifu.com',
    contactPhone: '400-123-4567',
    siteUrl: 'https://tianguancifu.com',
    copyright: '© 2024 天官赐福. 版权所有.',
    welcomeMessage: '欢迎来到天官赐福的世界，这里有最精彩的仙侠故事和最动人的爱情传说。',
    announcement: '网站正在持续更新中，敬请期待更多精彩内容！'
  };
  
  return successResponse(res, defaultSettings, '获取网站设置成功');
}));

/**
 * 更新网站设置
 * @route PUT /api/admin/site-settings
 * @param {object} req.body - 网站设置数据
 * @returns {object} 更新结果
 */
router.put('/site-settings', authMiddleware, asyncHandler(async (req, res) => {
  const validation = validateParams(req.body, {
    title: { type: 'string', maxLength: 100 },
    subtitle: { type: 'string', maxLength: 200 },
    description: { type: 'string', maxLength: 500 },
    keywords: { type: 'string', maxLength: 200 },
    contactEmail: { type: 'string' },
    contactPhone: { type: 'string' },
    siteUrl: { type: 'string' },
    copyright: { type: 'string', maxLength: 200 },
    welcomeMessage: { type: 'string', maxLength: 500 },
    announcement: { type: 'string', maxLength: 1000 }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  // 这里可以将设置保存到数据库
  // 目前只返回成功响应
  
  return successResponse(res, null, '网站设置更新成功');
}));

/**
 * 获取所有内容列表（用于管理界面）
 * @route GET /api/admin/content
 * @access 管理员
 */
router.get('/content', asyncHandler(async (req, res) => {
    try {
        // 为了演示，我们返回一个模拟的内容列表
        // 模拟内容列表
        const contentList = [
            { id: '1', title: '首页内容', author: '管理员', create_time: new Date().toISOString().slice(0, 19).replace('T', ' ') },
            { id: '2', title: '角色信息', author: '管理员', create_time: new Date().toISOString().slice(0, 19).replace('T', ' ') },
            { id: '3', title: '故事介绍', author: '管理员', create_time: new Date().toISOString().slice(0, 19).replace('T', ' ') }
        ];
        
        return successResponse(res, contentList, '获取内容成功');
    } catch (error) {
        console.error('获取内容列表失败:', error);
        return errorResponse(res, '获取内容失败');
    }
}));

/**
 * 获取当前登录管理员个人资料
 * @route GET /api/admin/profile
 * @access 管理员
 */
router.get('/profile', authMiddleware, asyncHandler(async (req, res) => {
  try {
    const { username } = req.admin;
    
    // 根据用户名获取管理员详细信息
    const adminInfo = await AdminModel.getAdminByUsername(username);
    
    if (!adminInfo) {
      return errorResponse(res, '管理员信息不存在', 404);
    }
    
    // 返回管理员信息（排除敏感信息如密码）
    const profileData = {
      id: adminInfo.id,
      username: adminInfo.username,
      role: adminInfo.role,
      create_time: adminInfo.create_time,
      update_time: adminInfo.update_time
    };
    
    return successResponse(res, profileData, '获取管理员信息成功');
  } catch (error) {
    console.error('获取管理员个人资料失败:', error);
    return errorResponse(res, '获取管理员信息失败', 500);
  }
}));

/**
 * 基本信息管理接口
 */

// 获取所有基本信息
router.get('/basic-info', authMiddleware, asyncHandler(async (req, res) => {
  const basicInfo = await BasicInfoModel.getAll();
  return successResponse(res, basicInfo, '获取基本信息成功');
}));

// 添加基本信息
router.post('/basic-info', authMiddleware, asyncHandler(async (req, res) => {
  const validation = validateParams(req.body, {
    label: { required: true, type: 'string', maxLength: 100 },
    value: { required: true, type: 'string' },
    display_order: { type: 'number' }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const id = await BasicInfoModel.add(req.body);
  return successResponse(res, { id }, '添加成功');
}));

// 更新基本信息
router.put('/basic-info/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const validation = validateParams(req.body, {
    label: { type: 'string', maxLength: 100 },
    value: { type: 'string' },
    display_order: { type: 'number' }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  await BasicInfoModel.update(id, req.body);
  return successResponse(res, null, '更新成功');
}));

// 获取单个基本信息
router.get('/basic-info/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const [rows] = await require('../config/db').execute('SELECT * FROM basic_info WHERE id = ?', [id]);
    if (rows.length === 0) {
      return errorResponse(res, '基本信息不存在', 404);
    }
    return successResponse(res, rows[0], '获取基本信息成功');
  } catch (error) {
    console.error('获取基本信息失败:', error);
    return errorResponse(res, '获取基本信息失败', 500);
  }
}));

// 删除基本信息
router.delete('/basic-info/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  await BasicInfoModel.delete(id);
  return successResponse(res, null, '删除成功');
}));

/**
 * 轮播图管理接口
 */

// 获取所有轮播图
router.get('/carousel', authMiddleware, asyncHandler(async (req, res) => {
  const carousels = await CarouselModel.getAll();
  return successResponse(res, carousels, '获取轮播图成功');
}));

// 添加轮播图
router.post('/carousel', authMiddleware, asyncHandler(async (req, res) => {
  const validation = validateParams(req.body, {
    title: { required: true, type: 'string', maxLength: 255 },
    image_url: { required: true, type: 'string', maxLength: 500 },
    link_url: { type: 'string', maxLength: 500 },
    description: { type: 'string' },
    display_order: { type: 'number' },
    is_active: { type: 'boolean' }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const id = await CarouselModel.create(req.body);
  return successResponse(res, { id }, '添加轮播图成功');
}));

// 获取单个轮播图
router.get('/carousel/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const carousel = await CarouselModel.getById(id);
  
  if (!carousel) {
    return errorResponse(res, '轮播图不存在', 404);
  }
  
  return successResponse(res, carousel, '获取轮播图详情成功');
}));

// 更新轮播图
router.put('/carousel/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const validation = validateParams(req.body, {
    title: { type: 'string', maxLength: 255 },
    image_url: { type: 'string', maxLength: 500 },
    link_url: { type: 'string', maxLength: 500 },
    description: { type: 'string' },
    display_order: { type: 'number' },
    is_active: { type: 'boolean' }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const carousel = await CarouselModel.getById(id);
  if (!carousel) {
    return errorResponse(res, '轮播图不存在', 404);
  }
  
  await CarouselModel.update(id, req.body);
  return successResponse(res, null, '更新轮播图成功');
}));

// 删除轮播图
router.delete('/carousel/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const carousel = await CarouselModel.getById(id);
  if (!carousel) {
    return errorResponse(res, '轮播图不存在', 404);
  }
  
  await CarouselModel.delete(id);
  return successResponse(res, null, '删除轮播图成功');
}));

// 图片上传接口
router.post('/upload-image', authMiddleware, (req, res, next) => {
  if (!upload) {
    return errorResponse(res, '文件上传功能不可用', 500);
  }
  
  upload.single('file')(req, res, (err) => {
    if (err) {
      return errorResponse(res, '上传失败: ' + err.message, 400);
    }
    
    if (!req.file) {
      return errorResponse(res, '请选择要上传的图片', 400);
    }
    
    // 动态生成图片URL，根据请求协议自动选择HTTP或HTTPS
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3003';
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    
    return successResponse(res, { 
      url: fileUrl,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size
    }, '图片上传成功');
  });
});

module.exports = router;