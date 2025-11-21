/**
 * 通用中间件函数
 * 提供异步错误处理等常用中间件
 */

/**
 * 异步错误处理中间件
 * 自动捕获异步路由处理函数中的错误并传递给错误处理中间件
 * @param {Function} fn - 异步路由处理函数
 * @returns {Function} - 包装后的中间件函数
 */
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 验证参数中间件
 * 验证请求参数是否符合要求
 * @param {object} req - Express请求对象
 * @param {object} rules - 验证规则对象
 * @param {string} [location='body'] - 验证位置 ('body', 'query', 'params')
 * @returns {object} - 验证结果对象
 */
function validateParams(req, rules, location = 'body') {
  const params = req[location];
  const errors = {};
  
  // 确保参数是对象
  if (!params || typeof params !== 'object') {
    return {
      valid: false,
      errors: { params: '无效的请求参数' }
    };
  }
  
  // 确保规则是对象
  if (!rules || typeof rules !== 'object') {
    return {
      valid: false,
      errors: { rules: '无效的验证规则' }
    };
  }
  
  // 遍历规则进行验证
  for (const [field, rule] of Object.entries(rules)) {
    const value = params[field];
    
    // 必填字段检查
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors[field] = rule.message || field + '是必填项';
      continue;
    }
    
    // 如果字段不存在或值为空，但不是必填，跳过后续验证
    if ((value === undefined || value === null || value === '') && !rule.required) {
      continue;
    }
    
    // 类型检查
    if (rule.type && typeof value !== rule.type) {
      errors[field] = rule.message || field + '类型错误';
      continue;
    }
    
    // 最小长度检查
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      errors[field] = rule.message || field + '长度不能小于' + rule.minLength;
      continue;
    }
    
    // 最大长度检查
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      errors[field] = rule.message || field + '长度不能大于' + rule.maxLength;
      continue;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

module.exports = {
  asyncHandler,
  validateParams
};
