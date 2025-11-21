const db = require('../config/db');

class BasicInfoModel {
  static async getAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM basic_info ORDER BY display_order ASC');
      return rows;
    } catch (error) {
      console.error('获取基本信息失败:', error);
      throw error;
    }
  }

  static async add(data) {
    try {
      const { label, value, display_order = 0 } = data;
      const [result] = await db.execute(
        'INSERT INTO basic_info (label, value, display_order, create_time, update_time) VALUES (?, ?, ?, NOW(), NOW())',
        [label, value, display_order]
      );
      return result.insertId;
    } catch (error) {
      console.error('添加基本信息失败:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const { label, value, display_order } = data;
      await db.execute(
        'UPDATE basic_info SET label = ?, value = ?, display_order = ?, update_time = NOW() WHERE id = ?',
        [label, value, display_order, id]
      );
      return true;
    } catch (error) {
      console.error('更新基本信息失败:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db.execute('DELETE FROM basic_info WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('删除基本信息失败:', error);
      throw error;
    }
  }
}

module.exports = BasicInfoModel;