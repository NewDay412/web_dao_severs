const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// 导入工具函数
const { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse, asyncHandler } = require('../utils/response.utils');
const { validateParams } = require('../utils/validation.utils');

// 使用应用程序中定义的统一JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // 与app.js保持一致

/**
 * 用户认证中间件 - 验证用户令牌
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
    
    // 将用户信息添加到请求对象
    req.user = decoded;
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
 * 用户注册接口
 * @route POST /api/user/register
 * @param {object} req.body - 包含注册信息
 * @returns {object} 注册结果
 */
// 导入用户模型
const { UserModel } = require('../models/user.model');

router.post('/register', asyncHandler(async (req, res) => {
  const validation = validateParams(req.body, {
    username: { required: true, type: 'string', minLength: 3, maxLength: 16 },
    password: { required: true, type: 'string', minLength: 6, maxLength: 20 },
    sex: { required: true, type: 'string', enum: ['male', 'female', 'other'] }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  try {
    const userId = await UserModel.register(req.body);
    return successResponse(res, { userId, username: req.body.username }, '注册成功');
  } catch (error) {
    if (error.message === '用户名已存在') {
      return errorResponse(res, error.message, 400);
    }
    console.error('注册失败:', error);
    return errorResponse(res, '注册失败', 500);
  }
}));

/**
 * 用户登录接口
 * @route POST /api/user/login
 * @param {object} req.body - 包含username和password
 * @returns {object} 包含token的响应
 */
router.post('/login', asyncHandler(async (req, res) => {
  const validation = validateParams(req.body, {
    username: { required: true, type: 'string', minLength: 1, maxLength: 50 },
    password: { required: true, type: 'string', minLength: 1 }
  });
  
  if (!validation.valid) {
    return validationErrorResponse(res, validation.errors);
  }
  
  const { username, password } = req.body;
  
  try {
    const user = await UserModel.login(username, password);
    
    const token = jwt.sign(
      { username: user.username, role: 'user' },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    return successResponse(res, { token, user: { username: user.username, role: 'user' } }, '登录成功');
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return errorResponse(res, '该用户不存在，请注册', 404);
    } else if (error.message === 'INVALID_PASSWORD') {
      return errorResponse(res, '用户名或密码错误', 401);
    }
    console.error('登录失败:', error);
    return errorResponse(res, '登录失败', 500);
  }
}));

/**
 * 验证令牌有效性（用于前端检查）
 * @route GET /api/user/validate-token
 */
router.get('/validate-token', authMiddleware, (req, res) => {
  return successResponse(res, { user: req.user }, '令牌有效');
});

// 导入所有数据模型
const HomeContentModel = require('../models/homeContent.model');
const StoryIntroModel = require('../models/storyIntro.model');
const CharacterInfoModel = require('../models/characterInfo.model');
const WorkReviewModel = require('../models/workReview.model');
const MessageBoardModel = require('../models/messageBoard.model');
const NavigationMenuModel = require('../models/navigationMenu.model');
const CharacterQuotesModel = require('../models/characterQuotes.model');
const BasicInfoModel = require('../models/basicInfo.model');
const CarouselModel = require('../models/carousel.model');

/**
 * 获取首页内容
 * @route GET /api/user/home-content
 * @returns {object} 首页内容列表
 */
router.get('/home-content', async (req, res) => {
  try {
    // 默认只获取已发布的内容
    const content = await HomeContentModel.getAllContent(true);
    res.json({ success: true, data: content });
  } catch (error) {
    console.error('获取首页内容失败:', error);
    res.status(500).json({ success: false, error: '获取首页内容失败，请稍后重试' });
  }
});

/**
 * 获取剧情简介
 * @route GET /api/user/story-intro
 * @returns {object} 剧情简介列表
 */
router.get('/story-intro', async (req, res) => {
  try {
    // 默认只获取已发布的内容
    const storyIntro = await StoryIntroModel.getAllStoryIntro(true);
    res.json({ success: true, data: storyIntro });
  } catch (error) {
    console.error('获取剧情简介失败:', error);
    res.status(500).json({ success: false, error: '获取剧情简介失败，请稍后重试' });
  }
});

/**
 * 获取角色信息
 * @route GET /api/user/character
 * @returns {object} 角色列表
 */
router.get('/character', async (req, res) => {
  try {
    const { roleType } = req.query;
    // 默认只获取已发布的内容
    const characters = await CharacterInfoModel.getAllCharacters(true, roleType);
    res.json({ success: true, data: characters });
  } catch (error) {
    console.error('获取角色信息失败:', error);
    res.status(500).json({ success: false, error: '获取角色信息失败，请稍后重试' });
  }
});

/**
 * 获取角色详情
 * @route GET /api/user/character/:id
 * @param {number} req.params.id - 角色ID
 * @returns {object} 角色详情
 */
router.get('/character/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const character = await CharacterInfoModel.getCharacterById(id);
    
    if (!character || character.status !== 'published') {
      return res.status(404).json({ error: '角色信息不存在' });
    }
    
    res.json({ success: true, data: character });
  } catch (error) {
    console.error('获取角色详情失败:', error);
    res.status(500).json({ success: false, error: '获取角色详情失败，请稍后重试' });
  }
});

/**
 * 获取作品评价
 * @route GET /api/user/review
 * @returns {object} 评价列表
 */
router.get('/review', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    // 默认只获取已批准的评价
    const reviews = await WorkReviewModel.getAllReviews('approved', parseInt(page), parseInt(pageSize));
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('获取作品评价失败:', error);
    res.status(500).json({ success: false, error: '获取作品评价失败，请稍后重试' });
  }
});

/**
 * 提交作品评价
 * @route POST /api/user/review
 * @param {object} req.body - 评价数据
 * @returns {object} 提交结果
 */
router.post('/review', async (req, res) => {
  try {
    const { username, rating, comment } = req.body;
    
    // 输入验证
    if (!username || !rating || !comment) {
      return res.status(400).json({ error: '用户名、评分和评论内容不能为空' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: '评分必须在1-5之间' });
    }
    
    const reviewId = await WorkReviewModel.addReview({
      username, rating, content: comment
    });
    res.json({ success: true, message: '评价提交成功，等待审核', reviewId });
  } catch (error) {
    console.error('提交作品评价失败:', error);
    res.status(500).json({ success: false, error: '提交作品评价失败，请稍后重试' });
  }
});

/**
 * 获取留言板内容
 * @route GET /api/user/message
 * @returns {object} 留言列表
 */
router.get('/message', async (req, res) => {
  try {
    // 获取所有留言（不仅仅是已发布的）
    const messages = await MessageBoardModel.getAllMessages(false);
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('获取留言板内容失败:', error);
    res.status(500).json({ success: false, error: '获取留言板内容失败，请稍后重试' });
  }
});

/**
 * 提交留言
 * @route POST /api/user/message
 * @param {object} req.body - 留言数据
 * @returns {object} 提交结果
 */
router.post('/message', async (req, res) => {
  try {
    const { username, email, phone, content } = req.body;
    
    // 输入验证
    if (!username || !email || !content) {
      return res.status(400).json({ success: false, error: '用户名、邮箱和留言内容不能为空' });
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: '邮箱格式不正确' });
    }
    
    // 手机号格式验证（如果提供）
    if (phone) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, error: '手机号格式不正确' });
      }
    }
    
    const messageId = await MessageBoardModel.addMessage({
      username, email, phone, content
    });
    res.json({ success: true, message: '留言提交成功，等待审核！', messageId });
  } catch (error) {
    console.error('提交留言失败:', error);
    res.status(500).json({ success: false, error: '提交留言失败，请稍后重试' });
  }
});

/**
 * 获取导航菜单
 * @route GET /api/user/menu
 * @returns {object} 菜单树结构
 */
router.get('/menu', async (req, res) => {
  try {
    // 默认只获取激活的菜单并返回树形结构
    const menuTree = await NavigationMenuModel.getMenuTree(true);
    res.json({ success: true, data: menuTree });
  } catch (error) {
    console.error('获取导航菜单失败:', error);
    res.status(500).json({ success: false, error: '获取导航菜单失败，请稍后重试' });
  }
});

/**
 * 获取人物语录
 * @route GET /api/user/quotes
 * @returns {object} 语录列表
 */
router.get('/quotes', async (req, res) => {
  try {
    // 默认只获取已发布的语录
    const quotes = await CharacterQuotesModel.getAllQuotes(true);
    res.json({ success: true, data: quotes });
  } catch (error) {
    console.error('获取人物语录失败:', error);
    res.status(500).json({ success: false, error: '获取人物语录失败，请稍后重试' });
  }
});

/**
 * 获取基本信息
 * @route GET /api/user/basic-info
 * @returns {object} 基本信息列表
 */
router.get('/basic-info', async (req, res) => {
  try {
    const basicInfo = await BasicInfoModel.getAll();
    res.json({ success: true, data: basicInfo });
  } catch (error) {
    console.error('获取基本信息失败:', error);
    res.status(500).json({ success: false, error: '获取基本信息失败，请稍后重试' });
  }
});

/**
 * 获取轮播图
 * @route GET /api/user/carousel
 * @returns {object} 活跃轮播图列表
 */
router.get('/carousel', async (req, res) => {
  try {
    const carousels = await CarouselModel.getActive();
    res.json({ success: true, data: carousels });
  } catch (error) {
    console.error('获取轮播图失败:', error);
    res.status(500).json({ success: false, error: '获取轮播图失败，请稍后重试' });
  }
});

module.exports = router;