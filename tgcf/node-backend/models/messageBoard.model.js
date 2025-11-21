const db = require('../config/db');

/**
 * 留言板模型 - 处理留言板相关的数据库操作
 */
class MessageBoardModel {
  /**
   * 获取所有留言
   * @param {boolean} onlyPublished - 是否只获取已发布的留言
   * @param {number} limit - 返回数量限制
   * @returns {Promise<Array>} 留言列表
   */
  static async getAllMessages(onlyPublished = false, limit = null) {
    try {
      let query = 'SELECT * FROM message_board';
      let conditions = [];
      let params = [];
      
      if (onlyPublished) {
        conditions.push('status = ?');
        params.push('published');
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY create_time DESC';
      
      if (limit) {
        query += ' LIMIT ?';
        params.push(limit);
      }
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('获取留言列表失败:', error);
      throw error;
    }
  }

  /**
   * 添加留言
   * @param {object} messageData - 留言数据
   * @returns {Promise<number>} 新增留言的ID
   */
  static async addMessage(messageData) {
    try {
      const {
        username,
        email,
        phone,
        content,
        reply,
        status = 'pending'
      } = messageData;
      
      const [result] = await db.execute(
        `INSERT INTO message_board (username, email, phone, content, reply, status, create_time, update_time)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [username, email || null, phone || null, content, reply || null, status]
      );
      return result.insertId;
    } catch (error) {
      console.error('添加留言失败:', error);
      throw error;
    }
  }

  /**
   * 更新留言状态
   * @param {number} id - 留言ID
   * @param {string} status - 新状态
   * @returns {Promise<boolean>} 是否成功
   */
  static async updateMessageStatus(id, status) {
    try {
      await db.execute(
        `UPDATE message_board SET status = ?, update_time = NOW() WHERE id = ?`,
        [status, id]
      );
      return true;
    } catch (error) {
      console.error('更新留言状态失败:', error);
      throw error;
    }
  }

  /**
   * 添加留言回复
   * @param {number} id - 留言ID
   * @param {string} reply - 回复内容
   * @returns {Promise<boolean>} 是否成功
   */
  static async addReply(id, reply) {
    try {
      await db.execute(
        `UPDATE message_board SET reply = ?, update_time = NOW() WHERE id = ?`,
        [reply, id]
      );
      return true;
    } catch (error) {
      console.error('添加回复失败:', error);
      throw error;
    }
  }
  
  /**
   * 更新留言
   * @param {number} id - 留言ID
   * @param {object} updateData - 更新数据
   * @returns {Promise<boolean>} 是否成功
   */
  static async updateMessage(id, updateData) {
    try {
      const fields = [];
      const values = [];
      
      if (updateData.reply !== undefined) {
        fields.push('reply = ?');
        values.push(updateData.reply);
      }
      
      if (updateData.status !== undefined) {
        fields.push('status = ?');
        values.push(updateData.status);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      fields.push('update_time = NOW()');
      values.push(id);
      
      await db.execute(
        `UPDATE message_board SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      return true;
    } catch (error) {
      console.error('更新留言失败:', error);
      throw error;
    }
  }

  /**
   * 删除留言
   * @param {number} id - 留言ID
   * @returns {Promise<boolean>} 是否成功
   */
  static async deleteMessage(id) {
    try {
      await db.execute('DELETE FROM message_board WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('删除留言失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取留言
   * @param {number} id - 留言ID
   * @returns {Promise<Object|null>} 留言对象
   */
  static async getMessageById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM message_board WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('获取留言详情失败:', error);
      throw error;
    }
  }
}

module.exports = MessageBoardModel;