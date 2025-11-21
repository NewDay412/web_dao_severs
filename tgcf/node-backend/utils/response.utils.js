/**
 * 响应格式化和错误处理工具函数
 * 提供统一的API响应格式和错误处理
 */

/**
 * 成功响应格式化
 * @param {object} res - Express响应对象
 * @param {object} data - 响应数据
 * @param {string} message - 响应消息
 * @param {number} statusCode - HTTP状态码
 * @returns {object} - Express响应对象
 */
function successResponse(res, data = null, message = '操作成功', statusCode = 200) {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
  };
  
  return res.status(statusCode).json(response);
}

/**
 * 分页响应格式化
 * @param {object} res - Express响应对象
 * @param {array} items - 数据项数组
 * @param {number} total - 总记录数
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页大小
 * @param {string} message - 响应消息
 * @param {number} statusCode - HTTP状态码
 * @returns {object} - Express响应对象
 */
function paginatedResponse(res, items = [], total = 0, page = 1, pageSize = 10, message = '获取成功', statusCode = 200) {
  const totalPages = Math.ceil(total / pageSize);
  
  const response = {
    success: true,
    message,
    data: {
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    },
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
  };
  
  return res.status(statusCode).json(response);
}

/**
 * 错误响应格式化
 * @param {object} res - Express响应对象
 * @param {string} message - 错误消息
 * @param {number} statusCode - HTTP状态码
 * @param {object} errors - 详细错误信息
 * @returns {object} - Express响应对象
 */
function errorResponse(res, message = '操作失败', statusCode = 400, errors = null) {
  const response = {
    success: false,
    message,
    error: message, // 兼容前端期望的error字段
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
    errorId: Date.now() // 用于问题跟踪
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

/**
 * 未授权错误响应
 * @param {object} res - Express响应对象
 * @param {string} message - 错误消息
 * @returns {object} - Express响应对象
 */
function unauthorizedResponse(res, message = '未授权访问') {
  return errorResponse(res, message, 401);
}

/**
 * 禁止访问错误响应
 * @param {object} res - Express响应对象
 * @param {string} message - 错误消息
 * @returns {object} - Express响应对象
 */
function forbiddenResponse(res, message = '禁止访问') {
  return errorResponse(res, message, 403);
}

/**
 * 资源未找到错误响应
 * @param {object} res - Express响应对象
 * @param {string} message - 错误消息
 * @returns {object} - Express响应对象
 */
function notFoundResponse(res, message = '资源不存在') {
  return errorResponse(res, message, 404);
}

/**
 * 服务器内部错误响应
 * @param {object} res - Express响应对象
 * @param {Error} err - 错误对象
 * @param {string} message - 错误消息
 * @returns {object} - Express响应对象
 */
function serverErrorResponse(res, err = null, message = '服务器内部错误') {
  // 记录详细错误信息到控制台
  if (err) {
    console.error('服务器错误:', {
      message: err.message,
      stack: err.stack
    });
  }
  
  return errorResponse(res, message, 500);
}

/**
 * 验证错误响应
 * @param {object} res - Express响应对象
 * @param {object} validationErrors - 验证错误对象
 * @param {string} message - 错误消息
 * @returns {object} - Express响应对象
 */
function validationErrorResponse(res, validationErrors = {}, message = '请求参数验证失败') {
  return errorResponse(res, message, 400, validationErrors);
}

/**
 * 处理异步路由错误的包装函数
 * @param {Function} fn - 异步路由处理函数
 * @returns {Function} - 包装后的路由处理函数
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
}

/**
 * 构建分页查询参数
 * @param {object} query - 请求查询参数
 * @param {number} defaultPageSize - 默认每页大小
 * @param {number} maxPageSize - 最大每页大小
 * @returns {object} - 包含page和pageSize的对象
 */
function buildPaginationParams(query, defaultPageSize = 10, maxPageSize = 100) {
  // 确保query是对象
  if (!query || typeof query !== 'object') {
    return {
      page: 1,
      pageSize: defaultPageSize
    };
  }
  
  const page = Number(query.page) || 1;
  const pageSize = Math.min(
    Number(query.pageSize) || defaultPageSize,
    maxPageSize
  );
  
  return {
    page: Math.max(1, page),
    pageSize: Math.max(1, pageSize)
  };
}

/**
 * 构建排序查询参数
 * @param {object} query - 请求查询参数
 * @param {string} defaultSortBy - 默认排序字段
 * @param {string} defaultSortOrder - 默认排序方向
 * @param {array} allowedSortFields - 允许的排序字段列表
 * @returns {object} - 包含sortBy和sortOrder的对象
 */
function buildSortParams(query, defaultSortBy = 'created_at', defaultSortOrder = 'DESC', allowedSortFields = []) {
  // 确保query是对象
  if (!query || typeof query !== 'object') {
    return {
      sortBy: defaultSortBy,
      sortOrder: defaultSortOrder
    };
  }
  
  let sortBy = query.sortBy || defaultSortBy;
  let sortOrder = query.sortOrder?.toUpperCase() || defaultSortOrder;
  
  // 验证排序字段
  if (allowedSortFields.length > 0 && !allowedSortFields.includes(sortBy)) {
    sortBy = defaultSortBy;
  }
  
  // 验证排序方向
  if (sortOrder !== 'ASC' && sortOrder !== 'DESC') {
    sortOrder = defaultSortOrder;
  }
  
  return {
    sortBy,
    sortOrder
  };
}

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
  validationErrorResponse,
  asyncHandler,
  buildPaginationParams,
  buildSortParams
};