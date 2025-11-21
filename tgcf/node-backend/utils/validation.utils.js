/**
 * 数据验证工具函数
 * 提供常用的表单验证、数据类型检查等功能
 */

/**
 * 检查字符串是否为空
 * @param {string} str - 要检查的字符串
 * @returns {boolean} - 如果字符串为空返回true
 */
function isEmptyString(str) {
  return typeof str !== 'string' || str.trim().length === 0;
}

/**
 * 验证电子邮件格式
 * @param {string} email - 电子邮件地址
 * @returns {boolean} - 格式正确返回true
 */
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号码格式（中国手机号）
 * @param {string} phone - 手机号码
 * @returns {boolean} - 格式正确返回true
 */
function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证密码强度
 * 至少8位，包含字母和数字
 * @param {string} password - 密码
 * @returns {boolean} - 密码强度符合要求返回true
 */
function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * 验证是否为有效的URL
 * @param {string} url - URL字符串
 * @returns {boolean} - 是有效URL返回true
 */
function isValidUrl(url) {
  if (typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证是否为有效的ID
 * @param {*} id - ID值
 * @returns {boolean} - 是有效ID返回true
 */
function isValidId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

/**
 * 验证字符串长度
 * @param {string} str - 要检查的字符串
 * @param {number} minLength - 最小长度
 * @param {number} maxLength - 最大长度
 * @returns {boolean} - 长度在范围内返回true
 */
function isStringLengthValid(str, minLength, maxLength) {
  if (typeof str !== 'string') return false;
  const length = str.trim().length;
  return length >= minLength && length <= maxLength;
}

/**
 * 验证数值范围
 * @param {number} value - 要检查的数值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {boolean} - 在范围内返回true
 */
function isNumberInRange(value, min, max) {
  const num = Number(value);
  return Number.isFinite(num) && num >= min && num <= max;
}

/**
 * 验证是否为有效的状态值
 * @param {string|number} status - 状态值
 * @param {Array} validStatuses - 有效的状态值数组
 * @returns {boolean} - 是有效状态返回true
 */
function isValidStatus(status, validStatuses = [0, 1]) {
  return validStatuses.includes(status);
}

/**
 * 验证是否为有效的排序值
 * @param {string|number} sort - 排序值
 * @returns {boolean} - 是有效排序值返回true
 */
function isValidSort(sort) {
  return Number.isInteger(Number(sort)) && Number(sort) >= 0;
}

/**
 * 验证请求参数
 * @param {object} params - 请求参数对象
 * @param {object} rules - 验证规则
 * @returns {object} - 包含valid和errors的对象
 */
function validateParams(params, rules) {
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
      errors[field] = rule.message || `${field}是必填项`;
      continue;
    }
    
    // 如果字段不存在或值为空，但不是必填，跳过后续验证
    if ((value === undefined || value === null || value === '') && !rule.required) {
      continue;
    }
    
    // 类型检查 - 支持数组类型
    if (rule.type) {
      if (rule.type === 'array') {
        if (!Array.isArray(value)) {
          errors[field] = rule.message || `${field}必须是数组类型`;
          continue;
        }
      } else if (Array.isArray(rule.type)) {
        // 支持多种类型
        const validType = rule.type.some(type => {
          if (type === 'array') return Array.isArray(value);
          if (type === 'null') return value === null;
          return typeof value === type;
        });
        if (!validType) {
          errors[field] = rule.message || `${field}类型错误，期望类型: ${rule.type.join('|')}`;
          continue;
        }
      } else if (typeof value !== rule.type) {
        errors[field] = rule.message || `${field}类型错误`;
        continue;
      }
    }
    
    // 数组长度检查
    if (rule.minLength && Array.isArray(value) && value.length < rule.minLength) {
      errors[field] = rule.message || `${field}数组长度不能小于${rule.minLength}`;
      continue;
    }
    
    // 字符串长度检查
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      errors[field] = rule.message || `${field}长度不能小于${rule.minLength}`;
      continue;
    }
    
    // 最大长度检查
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      errors[field] = rule.message || `${field}长度不能大于${rule.maxLength}`;
      continue;
    }
    
    // 枚举值检查
    if (rule.enum && !rule.enum.includes(value)) {
      errors[field] = rule.message || `${field}值必须是: ${rule.enum.join(', ')} 中的一个`;
      continue;
    }
    
    // 正则表达式检查
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field}格式错误`;
      continue;
    }
    
    // 自定义验证函数
    if (rule.validator && typeof rule.validator === 'function') {
      const result = rule.validator(value, params);
      if (result !== true) {
        errors[field] = result || `${field}验证失败`;
      }
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * 清理和格式化输入数据
 * @param {object} data - 要清理的数据
 * @param {object} rules - 清理规则
 * @returns {object} - 清理后的数据
 */
function sanitizeData(data, rules = {}) {
  // 确保data是对象
  if (!data || typeof data !== 'object') {
    return {};
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    let cleanValue = value;
    
    // 应用特定字段的规则
    if (rules[key]) {
      const fieldRules = rules[key];
      
      // 去除首尾空格
      if (fieldRules.trim && typeof cleanValue === 'string') {
        cleanValue = cleanValue.trim();
      }
      
      // 转换为小写
      if (fieldRules.toLowerCase && typeof cleanValue === 'string') {
        cleanValue = cleanValue.toLowerCase();
      }
      
      // 转换为大写
      if (fieldRules.toUpperCase && typeof cleanValue === 'string') {
        cleanValue = cleanValue.toUpperCase();
      }
      
      // 截断长度
      if (fieldRules.maxLength && typeof cleanValue === 'string') {
        cleanValue = cleanValue.slice(0, fieldRules.maxLength);
      }
      
      // 自定义转换函数
      if (fieldRules.transform && typeof fieldRules.transform === 'function') {
        cleanValue = fieldRules.transform(cleanValue);
      }
    }
    
    // 基本清理 - 空字符串转为null
    if (typeof cleanValue === 'string' && cleanValue.trim() === '') {
      cleanValue = null;
    }
    
    // 只保存非undefined值
    if (cleanValue !== undefined) {
      sanitized[key] = cleanValue;
    }
  }
  
  return sanitized;
}

module.exports = {
  isEmptyString,
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidUrl,
  isValidId,
  isStringLengthValid,
  isNumberInRange,
  isValidStatus,
  isValidSort,
  validateParams,
  sanitizeData
};