const db = require('../config/db');

/**
 * 内容模型 - 处理内容相关的数据库操作
 */
class ContentModel {
  /**
   * 获取所有内容
   * @returns {Promise<Array>} 内容列表
   */
  static async getAllContent() {
    try {
      const [rows] = await db.execute('SELECT * FROM content ORDER BY create_time DESC');
      return rows;
    } catch (error) {
      console.error('获取内容列表失败:', error);
      throw error;
    }
  }

  /**
   * 添加内容
   * @param {string} title - 标题
   * @param {string} content - 内容
   * @param {string} author - 作者
   * @returns {Promise<number>} 新增内容的ID
   */
  static async addContent(title, content, author) {
    try {
      const [result] = await db.execute(
        'INSERT INTO content (title, content, author, create_time) VALUES (?, ?, ?, NOW())',
        [title, content, author]
      );
      return result.insertId;
    } catch (error) {
      console.error('添加内容失败:', error);
      throw error;
    }
  }

  /**
   * 修改内容
   * @param {number} id - 内容ID
   * @param {string} title - 标题
   * @param {string} content - 内容
   * @returns {Promise<boolean>} 是否成功
   */
  static async updateContent(id, title, content) {
    try {
      await db.execute(
        'UPDATE content SET title = ?, content = ? WHERE id = ?',
        [title, content, id]
      );
      return true;
    } catch (error) {
      console.error('更新内容失败:', error);
      throw error;
    }
  }

  /**
   * 删除内容
   * @param {number} id - 内容ID
   * @returns {Promise<boolean>} 是否成功
   */
  static async deleteContent(id) {
    try {
      await db.execute('DELETE FROM content WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('删除内容失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取内容
   * @param {number} id - 内容ID
   * @returns {Promise<Object|null>} 内容对象
   */
  static async getContentById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM content WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('获取内容详情失败:', error);
      throw error;
    }
  }
}

module.exports = ContentModel;