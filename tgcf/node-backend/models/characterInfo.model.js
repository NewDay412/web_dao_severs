const db = require('../config/db');

/**
 * 角色介绍模型 - 处理角色信息相关的数据库操作
 */
class CharacterInfoModel {
  /**
   * 获取所有角色信息
   * @param {boolean} onlyPublished - 是否只获取已发布的角色
   * @param {string} roleType - 角色类型筛选（main/supporting/guest）
   * @returns {Promise<Array>} 角色列表
   */
  static async getAllCharacters(onlyPublished = false, roleType = null) {
    try {
      let query = 'SELECT * FROM character_info';
      let conditions = [];
      let params = [];
      
      if (onlyPublished) {
        conditions.push('status = ?');
        params.push('published');
      }
      
      if (roleType) {
        conditions.push('role_importance = ?');
        params.push(roleType);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY display_order ASC, name ASC';
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('获取角色列表失败:', error);
      throw error;
    }
  }

  /**
   * 添加角色信息
   * @param {object} characterData - 角色数据
   * @returns {Promise<number>} 新增角色的ID
   */
  static async addCharacter(characterData) {
    try {
      const {
        name,
        description,
        image_url = null,
        personality = null,
        role_importance = 'supporting',
        display_order = 0,
        status = 'published'
      } = characterData;
      
      const [result] = await db.execute(
        `INSERT INTO character_info (name, description, image_url, personality, role_importance, display_order, status, create_time, update_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [name, description, image_url, personality, role_importance, display_order, status]
      );
      return result.insertId;
    } catch (error) {
      console.error('添加角色失败:', error);
      throw error;
    }
  }

  /**
   * 修改角色信息
   * @param {number} id - 角色ID
   * @param {object} characterData - 更新的角色数据
   * @returns {Promise<boolean>} 是否成功
   */
  static async updateCharacter(id, characterData) {
    try {
      const {
        name,
        description,
        image_url,
        personality,
        role_importance,
        display_order,
        status
      } = characterData;
      
      // 构建动态更新语句
      let updateFields = [];
      let params = [];
      
      if (name !== undefined) { updateFields.push('name = ?'); params.push(name); }
      if (description !== undefined) { updateFields.push('description = ?'); params.push(description); }
      if (image_url !== undefined) { updateFields.push('image_url = ?'); params.push(image_url); }
      if (personality !== undefined) { updateFields.push('personality = ?'); params.push(personality); }
      if (role_importance !== undefined) { updateFields.push('role_importance = ?'); params.push(role_importance); }
      if (display_order !== undefined) { updateFields.push('display_order = ?'); params.push(display_order); }
      if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }
      
      // 总是更新时间戳
      updateFields.push('update_time = NOW()');
      params.push(id);
      
      await db.execute(
        `UPDATE character_info SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );
      return true;
    } catch (error) {
      console.error('更新角色失败:', error);
      throw error;
    }
  }

  /**
   * 删除角色信息
   * @param {number} id - 角色ID
   * @returns {Promise<boolean>} 是否成功
   */
  static async deleteCharacter(id) {
    try {
      await db.execute('DELETE FROM character_info WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('删除角色失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取角色信息
   * @param {number} id - 角色ID
   * @returns {Promise<Object|null>} 角色对象
   */
  static async getCharacterById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM character_info WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('获取角色详情失败:', error);
      throw error;
    }
  }
}

module.exports = CharacterInfoModel;