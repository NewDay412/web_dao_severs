const db = require('../config/db');

/**
 * 剧情简介模型 - 处理剧情简介相关的数据库操作
 */
class StoryIntroModel {
  /**
   * 获取所有剧情简介
   * @param {boolean} onlyPublished - 是否只获取已发布的内容
   * @returns {Promise<Array>} 剧情简介列表
   */
  static async getAllStoryIntro(onlyPublished = false) {
    try {
      let query = 'SELECT * FROM story_intro ORDER BY chapter_number ASC, display_order ASC';
      let params = [];
      
      if (onlyPublished) {
        query = 'SELECT * FROM story_intro WHERE status = ? ORDER BY chapter_number ASC, display_order ASC';
        params = ['published'];
      }
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('获取剧情简介列表失败:', error);
      throw error;
    }
  }

  /**
   * 添加剧情简介
   * @param {object} storyData - 剧情数据
   * @returns {Promise<number>} 新增剧情的ID
   */
  static async addStoryIntro(storyData) {
    try {
      const {
        title,
        content,
        chapter_number = 0,
        display_order = 0,
        status = 'published'
      } = storyData;
      
      const [result] = await db.execute(
        `INSERT INTO story_intro (title, content, chapter_number, display_order, status, create_time, update_time)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [title, content, chapter_number, display_order, status]
      );
      return result.insertId;
    } catch (error) {
      console.error('添加剧情简介失败:', error);
      throw error;
    }
  }

  /**
   * 修改剧情简介
   * @param {number} id - 剧情ID
   * @param {object} storyData - 更新的剧情数据
   * @returns {Promise<boolean>} 是否成功
   */
  static async updateStoryIntro(id, storyData) {
    try {
      const {
        title,
        content,
        chapter_number,
        display_order,
        status
      } = storyData;
      
      // 构建动态更新语句
      let updateFields = [];
      let params = [];
      
      if (title !== undefined) { updateFields.push('title = ?'); params.push(title); }
      if (content !== undefined) { updateFields.push('content = ?'); params.push(content); }
      if (chapter_number !== undefined) { updateFields.push('chapter_number = ?'); params.push(chapter_number); }
      if (display_order !== undefined) { updateFields.push('display_order = ?'); params.push(display_order); }
      if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }
      
      // 总是更新时间戳
      updateFields.push('update_time = NOW()');
      params.push(id);
      
      await db.execute(
        `UPDATE story_intro SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );
      return true;
    } catch (error) {
      console.error('更新剧情简介失败:', error);
      throw error;
    }
  }

  /**
   * 删除剧情简介
   * @param {number} id - 剧情ID
   * @returns {Promise<boolean>} 是否成功
   */
  static async deleteStoryIntro(id) {
    try {
      await db.execute('DELETE FROM story_intro WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('删除剧情简介失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取剧情简介
   * @param {number} id - 剧情ID
   * @returns {Promise<Object|null>} 剧情对象
   */
  static async getStoryIntroById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM story_intro WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('获取剧情简介详情失败:', error);
      throw error;
    }
  }
}

module.exports = StoryIntroModel;