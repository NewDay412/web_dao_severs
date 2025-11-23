const db = require('../config/db');
const { isValidId, isStringLengthValid, isNumberInRange } = require('../utils/validation.utils');

/**
 * 首页内容模型 - 处理首页内容相关的数据库操作
 */
class HomeContentModel {
  /**
   * 获取所有首页内容
   * @param {boolean} onlyPublished - 是否只获取已发布的内容
   * @returns {Promise<Array>} 首页内容列表
   */
  static async getAllContent(onlyPublished = false) {
    try {
      let query = 'SELECT * FROM web_project.home_content ORDER BY display_order ASC, create_time DESC';
      let params = [];
      
      if (onlyPublished) {
        query = 'SELECT * FROM web_project.home_content WHERE status = ? ORDER BY display_order ASC, create_time DESC';
        params = ['published'];
      }
      
      console.log('执行查询:', query, '参数:', params);
      const [rows] = await db.execute(query, params);
      console.log('查询结果:', rows.length, '条记录');
      return rows;
    } catch (error) {
      console.error('获取首页内容列表失败 - 错误详情:', error);
      console.error('错误类型:', error.constructor.name);
      console.error('错误代码:', error.code);
      console.error('SQL状态:', error.sqlState);
      throw new Error(`获取首页内容列表失败: ${error.message}`);
    }
  }

  /**
   * 添加首页内容
   * @param {object} contentData - 内容数据
   * @returns {Promise<number>} 新增内容的ID
   */
  static async addContent(contentData) {
    try {
      // 参数验证
      if (!contentData || typeof contentData !== 'object') {
        throw new Error('无效的内容数据');
      }
      
      const { title, content, image_url, link_url, display_order = 0, status = 'published' } = contentData;
      
      // 标题验证
      if (!isStringLengthValid(title, 1, 255)) {
        throw new Error('标题长度必须在1-255个字符之间');
      }
      
      // 排序验证
      if (!isNumberInRange(display_order, 0, 9999)) {
        throw new Error('排序值必须在0-9999之间');
      }
      
      // 状态验证
      const validStatuses = ['published', 'draft'];
      if (!validStatuses.includes(status)) {
        throw new Error('无效的状态值，必须是 published 或 draft');
      }
      
      // 内容可以为空，但需要验证长度
      const safeContent = content || '';
      if (!isStringLengthValid(safeContent, 0, 5000)) {
        throw new Error('内容长度不能超过5000个字符');
      }
      
      const [result] = await db.execute(
        `INSERT INTO web_project.home_content (title, content, image_url, link_url, display_order, status, create_time, update_time)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [title, safeContent, image_url || null, link_url || null, display_order, status]
      );
      return result.insertId;
    } catch (error) {
      console.error('添加首页内容失败:', error);
      throw error;
    }
  }

  /**
   * 修改首页内容
   * @param {number} id - 内容ID
   * @param {object} contentData - 更新的内容数据
   * @returns {Promise<boolean>} 是否成功
   */
  static async updateContent(id, contentData) {
    try {
      // ID验证
      if (!isValidId(id)) {
        throw new Error('无效的内容ID');
      }
      
      // 数据验证
      if (!contentData || typeof contentData !== 'object') {
        throw new Error('无效的更新数据');
      }
      
      const { title, content, image_url, link_url, display_order, status } = contentData;
      
      // 构建动态更新语句
      let updateFields = [];
      let params = [];
      
      // 标题验证
      if (title !== undefined) {
        if (!isStringLengthValid(title, 1, 255)) {
          throw new Error('标题长度必须在1-255个字符之间');
        }
        updateFields.push('title = ?');
        params.push(title);
      }
      
      // 内容验证
      if (content !== undefined) {
        if (!isStringLengthValid(content, 0, 5000)) {
          throw new Error('内容长度不能超过5000个字符');
        }
        updateFields.push('content = ?');
        params.push(content);
      }
      
      // 图片URL
      if (image_url !== undefined) {
        updateFields.push('image_url = ?');
        params.push(image_url);
      }
      
      // 链接URL
      if (link_url !== undefined) {
        updateFields.push('link_url = ?');
        params.push(link_url);
      }
      
      // 排序验证
      if (display_order !== undefined) {
        if (!isNumberInRange(display_order, 0, 9999)) {
          throw new Error('排序值必须在0-9999之间');
        }
        updateFields.push('display_order = ?');
        params.push(display_order);
      }
      
      // 状态验证
      if (status !== undefined) {
        const validStatuses = ['published', 'draft'];
        if (!validStatuses.includes(status)) {
          throw new Error('无效的状态值，必须是 published 或 draft');
        }
        updateFields.push('status = ?');
        params.push(status);
      }
      
      // 如果没有更新字段，抛出错误
      if (updateFields.length === 0) {
        throw new Error('没有提供有效的更新字段');
      }
      
      // 总是更新时间戳
      updateFields.push('update_time = NOW()');
      params.push(id);
      
      const [result] = await db.execute(
        `UPDATE web_project.home_content SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );
      
      if (result.affectedRows === 0) {
        throw new Error('首页内容不存在');
      }
      
      return true;
    } catch (error) {
      console.error('更新首页内容失败:', error);
      throw error;
    }
  }

  /**
   * 删除首页内容
   * @param {number} id - 内容ID
   * @returns {Promise<boolean>} 是否成功
   */
  static async deleteContent(id) {
    try {
      // ID验证
      if (!isValidId(id)) {
        throw new Error('无效的内容ID');
      }
      
      // 先检查内容是否存在
      const existingContent = await this.getContentById(id);
      if (!existingContent) {
        throw new Error('首页内容不存在');
      }
      
      const [result] = await db.execute('DELETE FROM web_project.home_content WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('删除首页内容失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取首页内容
   * @param {number} id - 内容ID
   * @returns {Promise<Object|null>} 内容对象
   */
  static async getContentById(id) {
    try {
      // ID验证
      if (!isValidId(id)) {
        throw new Error('无效的内容ID');
      }
      
      const [rows] = await db.execute('SELECT * FROM web_project.home_content WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('获取首页内容详情失败:', error);
      throw new Error('获取首页内容详情失败');
    }
  }

  /**
   * 批量获取首页内容
   * @param {Array<number>} ids - 内容ID数组
   * @returns {Promise<Array>} 内容列表
   */
  static async getContentsByIds(ids) {
    try {
      // 参数验证
      if (!Array.isArray(ids) || ids.length === 0) {
        return [];
      }
      
      // 验证所有ID
      const validIds = ids.filter(id => isValidId(id));
      if (validIds.length === 0) {
        return [];
      }
      
      const placeholders = validIds.map(() => '?').join(',');
      const [rows] = await db.execute(
        `SELECT * FROM web_project.home_content WHERE id IN (${placeholders}) ORDER BY display_order ASC`,
        validIds
      );
      return rows;
    } catch (error) {
      console.error('批量获取首页内容失败:', error);
      throw new Error('批量获取首页内容失败');
    }
  }

  /**
   * 更新内容的显示顺序
   * @param {Array<{id: number, display_order: number}>} orderData - 排序数据数组
   * @returns {Promise<boolean>} 是否成功
   */
  static async updateDisplayOrder(orderData) {
    try {
      // 参数验证
      if (!Array.isArray(orderData) || orderData.length === 0) {
        throw new Error('无效的排序数据');
      }
      
      // 开始事务
      await db.execute('START TRANSACTION');
      
      try {
        // 逐个更新排序
        for (const item of orderData) {
          const { id, display_order } = item;
          
          // 验证ID和排序值
          if (!isValidId(id) || !isNumberInRange(display_order, 0, 9999)) {
            throw new Error('无效的ID或排序值');
          }
          
          await db.execute(
            'UPDATE web_project.home_content SET display_order = ?, update_time = NOW() WHERE id = ?',
            [display_order, id]
          );
        }
        
        // 提交事务
        await db.execute('COMMIT');
        return true;
      } catch (error) {
        // 回滚事务
        await db.execute('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('更新显示顺序失败:', error);
      throw error;
    }
  }
}

module.exports = HomeContentModel;