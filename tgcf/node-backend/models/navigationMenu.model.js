const db = require('../config/db');

/**
 * 导航菜单模型 - 处理导航菜单相关的数据库操作
 */
class NavigationMenuModel {
  /**
   * 获取所有导航菜单项
   * @param {boolean} onlyActive - 是否只获取激活的菜单项
   * @returns {Promise<Array>} 菜单项列表
   */
  static async getAllMenuItems(onlyActive = true) {
    try {
      let query = 'SELECT * FROM navigation_menu';
      let conditions = [];
      let params = [];
      
      if (onlyActive) {
        conditions.push('is_active = ?');
        params.push(true);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY display_order ASC';
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('获取菜单项列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取树形结构的导航菜单
   * @param {boolean} onlyActive - 是否只获取激活的菜单项
   * @returns {Promise<Array>} 树形结构菜单
   */
  static async getMenuTree(onlyActive = true) {
    try {
      const allItems = await this.getAllMenuItems(onlyActive);
      
      // 构建树形结构
      const menuMap = {};
      const rootItems = [];
      
      // 先创建所有项的映射
      allItems.forEach(item => {
        menuMap[item.id] = {
          ...item,
          children: []
        };
      });
      
      // 构建父子关系
      allItems.forEach(item => {
        if (item.parent_id === null) {
          rootItems.push(menuMap[item.id]);
        } else if (menuMap[item.parent_id]) {
          menuMap[item.parent_id].children.push(menuMap[item.id]);
        }
      });
      
      return rootItems;
    } catch (error) {
      console.error('获取菜单树失败:', error);
      throw error;
    }
  }

  /**
   * 添加菜单项
   * @param {object} menuData - 菜单数据
   * @returns {Promise<number>} 新增菜单项的ID
   */
  static async addMenuItem(menuData) {
    try {
      const {
        name,
        url,
        parent_id = null,
        display_order = 0,
        is_active = true
      } = menuData;
      
      const [result] = await db.execute(
        `INSERT INTO navigation_menu (name, url, parent_id, display_order, is_active, create_time, update_time)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [name, url, parent_id, display_order, is_active]
      );
      return result.insertId;
    } catch (error) {
      console.error('添加菜单项失败:', error);
      throw error;
    }
  }

  /**
   * 更新菜单项
   * @param {number} id - 菜单项ID
   * @param {object} menuData - 更新的菜单数据
   * @returns {Promise<boolean>} 是否成功
   */
  static async updateMenuItem(id, menuData) {
    try {
      const {
        name,
        url,
        parent_id,
        display_order,
        is_active
      } = menuData;
      
      // 构建动态更新语句
      let updateFields = [];
      let params = [];
      
      if (name !== undefined) { updateFields.push('name = ?'); params.push(name); }
      if (url !== undefined) { updateFields.push('url = ?'); params.push(url); }
      if (parent_id !== undefined) { updateFields.push('parent_id = ?'); params.push(parent_id); }
      if (display_order !== undefined) { updateFields.push('display_order = ?'); params.push(display_order); }
      if (is_active !== undefined) { updateFields.push('is_active = ?'); params.push(is_active); }
      
      // 总是更新时间戳
      updateFields.push('update_time = NOW()');
      params.push(id);
      
      await db.execute(
        `UPDATE navigation_menu SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );
      return true;
    } catch (error) {
      console.error('更新菜单项失败:', error);
      throw error;
    }
  }

  /**
   * 删除菜单项
   * @param {number} id - 菜单项ID
   * @returns {Promise<boolean>} 是否成功
   */
  static async deleteMenuItem(id) {
    try {
      await db.execute('DELETE FROM navigation_menu WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('删除菜单项失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取菜单项
   * @param {number} id - 菜单项ID
   * @returns {Promise<Object|null>} 菜单项对象
   */
  static async getMenuItemById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM navigation_menu WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('获取菜单项详情失败:', error);
      throw error;
    }
  }
}

module.exports = NavigationMenuModel;