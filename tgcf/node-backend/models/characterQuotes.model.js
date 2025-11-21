const db = require('../config/db');

/**
 * 人物语录模型 - 处理人物经典语录相关的数据库操作
 */
class CharacterQuotesModel {
  /**
   * 获取所有人物语录
   * @param {boolean} onlyPublished - 是否只获取已发布的语录
   * @returns {Promise<Array>} 语录列表
   */
  static async getAllQuotes(onlyPublished = true) {
    try {
      let query = 'SELECT * FROM character_quotes';
      let params = [];
      
      if (onlyPublished) {
        query += ' WHERE status = ?';
        params.push('published');
      }
      
      query += ' ORDER BY display_order ASC, create_time DESC';
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('获取人物语录失败:', error);
      throw error;
    }
  }

  /**
   * 添加人物语录
   * @param {object} quoteData - 语录数据
   * @returns {Promise<number>} 新增语录的ID
   */
  static async addQuote(quoteData) {
    try {
      const {
        character_name,
        content,
        image_url,
        display_order = 0,
        status = 'published'
      } = quoteData;
      
      const [result] = await db.execute(
        `INSERT INTO character_quotes (character_name, content, image_url, display_order, status, create_time, update_time)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [character_name, content, image_url, display_order, status]
      );
      return result.insertId;
    } catch (error) {
      console.error('添加人物语录失败:', error);
      throw error;
    }
  }

  /**
   * 更新人物语录
   * @param {number} id - 语录ID
   * @param {object} updateData - 更新数据
   * @returns {Promise<boolean>} 是否成功
   */
  static async updateQuote(id, updateData) {
    try {
      const fields = [];
      const values = [];
      
      const allowedFields = ['character_name', 'content', 'image_url', 'display_order', 'status'];
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      });
      
      if (fields.length === 0) {
        throw new Error('没有提供有效的更新字段');
      }
      
      fields.push('update_time = NOW()');
      values.push(id);
      
      await db.execute(
        `UPDATE character_quotes SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      return true;
    } catch (error) {
      console.error('更新人物语录失败:', error);
      throw error;
    }
  }

  /**
   * 删除人物语录
   * @param {number} id - 语录ID
   * @returns {Promise<boolean>} 是否成功
   */
  static async deleteQuote(id) {
    try {
      await db.execute('DELETE FROM character_quotes WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('删除人物语录失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取人物语录
   * @param {number} id - 语录ID
   * @returns {Promise<Object|null>} 语录对象
   */
  static async getQuoteById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM character_quotes WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('获取人物语录详情失败:', error);
      throw error;
    }
  }


}

module.exports = CharacterQuotesModel;